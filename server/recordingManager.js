// server/recordingManager.js
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const archiver = require("archiver");

const recordingsRoot = path.join(__dirname, "recordings");
if (!fs.existsSync(recordingsRoot)) {
    fs.mkdirSync(recordingsRoot, { recursive: true });
}

/**
 * In-memory map of recording sessions.
 * Key: recordingId
 * Value: {
 *   id,
 *   url,
 *   browser,
 *   status,
 *   createdAt,
 *   dir,
 *   specPath,
 *   screenshotsDir,
 *   codegenProcess
 * }
 */
const sessions = new Map();

function createRecordingSession(url, browser = "chromium", sourceType, testCaseTrackerId, jwtToken) {
    const id = crypto.randomBytes(8).toString("hex");
    const dir = path.join(recordingsRoot, id);
    const screenshotsDir = path.join(dir, "screenshots");
    const specPath = path.join(dir, "record.spec.ts");

    fs.mkdirSync(dir, { recursive: true });
    fs.mkdirSync(screenshotsDir, { recursive: true });

    const session = {
        id,
        url,
        browser,
        sourceType,
        testCaseTrackerId,
        jwtToken,
        status: "created", // created | recording | processing | ready | error
        createdAt: new Date().toISOString(),
        dir,
        specPath,
        screenshotsDir,
        codegenProcess: null
    };

    sessions.set(id, session);
    return session;
}

function getSession(recordingId) {
    return sessions.get(recordingId);
}

/**
 * Start Playwright codegen for a session.
 * Returns immediately; codegen runs in background.
 */
function startRecording(session) {
    if (session.codegenProcess) {
        throw new Error("Recording already started for this session");
    }

    session.status = "recording";

    const args = [
        "playwright",
        "codegen",
        `--target=playwright-test`,
        `--output=${session.specPath}`,
        `--browser=${session.browser}`,
        `--viewport-size=1280,720`,
        session.url
    ];

    const child = spawn("npx", args, {
        cwd: session.dir,
        stdio: "inherit",
        shell: process.platform === "win32" // for Windows
    });

    session.codegenProcess = child;

    child.on("exit", async (code, signal) => {
        session.codegenProcess = null;

        try {
            // If codegen never wrote the spec, we can't proceed
            if (!fs.existsSync(session.specPath)) {
                console.error(
                    `record.spec.ts not found for session ${session.id}; code=${code}, signal=${signal}`
                );
                session.status = "error";
                return;
            }

            // From here: run the post-processing & test ONCE,
            // regardless of exit code (covers SIGINT on "stop").
            session.status = "processing";

            await postProcessSpecForScreenshots(session);
            await runSpecToGenerateScreenshots(session);
            await cleanupSpecAfterScreenshots(session);

            session.status = "ready";
        } catch (err) {
            console.error("Error post-processing spec:", err);
            session.status = "error";
        }
    });

    return child.pid;
}

/**
 * Stop codegen by sending SIGINT (Ctrl+C).
 */
function stopRecording(session) {
    if (!session.codegenProcess) {
        throw new Error("No active recording process for this session");
    }

    session.status = "stopping";

    const proc = session.codegenProcess;
    try {
        if (process.platform === "win32") {
            require("child_process").spawn("taskkill", ["/pid", proc.pid, "/f", "/t"]);
        } else {
            proc.kill("SIGINT");
        }
    } catch (err) {
        console.error("Error stopping recording:", err);
    }
}

/**
 * Read record.spec.ts and:
 * - Import Page type
 * - Introduce snap helper
 * - After each `await page.*` line, add a screenshot call.
 */
async function postProcessSpecForScreenshots(session) {
    const specPath = session.specPath;
    if (!fs.existsSync(specPath)) {
        throw new Error("record.spec.ts not found. Did codegen finish?");
    }

    let content = fs.readFileSync(specPath, "utf8");

    // 1. Ensure Page is imported
    content = content.replace(
        /import\s+\{\s*test,\s*expect\s*\}\s+from\s+'@playwright\/test';/,
        "import { test, expect, Page } from '@playwright/test';"
    );

    // 2. Insert snap helper after the import
    const snapHelper = `
let stepCounter = 1;
async function snap(page: Page) {
  await page.screenshot({ path: \`screenshots/step-\${stepCounter++}.png\`, fullPage: true });
}
`;

    content = content.replace(
        /(@playwright\/test';\s*)/,
        "$1" + snapHelper + "\n"
    );

    // 3. Add "await snap(page)" after each user action (await page.*)
    //    but NEVER inside the snap helper itself, and not on lines that already
    //    call snap() or are screenshot lines.
    const lines = content.split("\n");
    const newLines = [];

    let inSnapHelper = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Detect start of snap helper
        if (trimmed.startsWith("async function snap(")) {
            inSnapHelper = true;
        }

        newLines.push(line);

        // Only inject outside snap helper body
        if (!inSnapHelper) {
            const isPageCall =
                trimmed.startsWith("await page.") && !trimmed.includes("snap(");

            const isScreenshotLine = trimmed.includes("page.screenshot");

            if (isPageCall && !isScreenshotLine) {
                const indent = line.substring(0, line.indexOf("await"));
                newLines.push(`${indent}await snap(page);`);
            }
        }

        // Detect end of snap helper (simple heuristic: line with just "}" that closes it)
        if (inSnapHelper && trimmed === "}") {
            inSnapHelper = false;
        }
    }

    const newContent = newLines.join("\n");
    fs.writeFileSync(specPath, newContent, "utf8");
}

/**
 * Run the generated spec so that screenshots are actually captured.
 */
async function runSpecToGenerateScreenshots(session) {
    return new Promise((resolve, reject) => {
        const args = [
            "playwright",
            "test",
            path.basename(session.specPath),
            "--reporter=line"
        ];

        const child = spawn("npx", args, {
            cwd: session.dir,
            stdio: "inherit",
            shell: process.platform === "win32"
        });

        child.on("exit", (code) => {
            if (code === 0) {
                resolve(true);
            } else {
                session.status = "error";
            }
        });
    });
}

/**
 * Collect all files (record.spec.ts + screenshots) to upload.
 */
function getFilesForUpload(session) {
    const files = [];

    if (fs.existsSync(session.specPath)) {
        files.push({
            fieldName: "recordSpec",
            filePath: session.specPath,
            filename: "record.spec.ts"
        });
    }

    if (fs.existsSync(session.screenshotsDir)) {
        const screenshotFiles = fs
            .readdirSync(session.screenshotsDir)
            .filter((f) => f.endsWith(".png"));

        screenshotFiles.forEach((name) => {
            files.push({
                fieldName: "screenshots",
                filePath: path.join(session.screenshotsDir, name),
                filename: name
            });
        });
    }

    return files;
}

async function cleanupSpecAfterScreenshots(session) {
    const fs = require("fs");
    const specPath = session.specPath;

    if (!fs.existsSync(specPath)) return;

    let content = fs.readFileSync(specPath, "utf8");

    // Count how many snap() calls exist to number the screenshots
    const snapCalls = [...content.matchAll(/await\s+snap\s*\(\s*page\s*\)\s*;?/g)];
    let counter = 1;

    // Replace each snap call with corresponding screenshot comment
    content = content.replace(
        /await\s+snap\s*\(\s*page\s*\)\s*;?/g,
        () => `// Screenshot step-${counter++}.png`
    );

    // Remove the entire snap helper block
    content = content.replace(
        /let\s+stepCounter[\s\S]*?async\s+function\s+snap[\s\S]*?\}\s*\n?/gm,
        ""
    );

    // Clean up "Page" from import
    content = content.replace(
        /import\s*\{\s*([^}]*)\}\s*from\s*'@playwright\/test';/,
        (match, group) => {
            const identifiers = group
                .split(",")
                .map((s) => s.trim())
                .filter((x) => x !== "Page");

            return `import { ${identifiers.join(", ")} } from '@playwright/test';`;
        }
    );

    // Collapse extra blank lines
    content = content.replace(/\n{3,}/g, "\n\n");

    fs.writeFileSync(specPath, content, "utf8");
    fs.writeFileSync(specPath, content, "utf8");
}

/**
 * Create a zip archive of the recording artifacts (spec + screenshots).
 * Returns a promise that resolves to the zip file path.
 */
function createZipArchive(session) {
    return new Promise((resolve, reject) => {
        const zipPath = path.join(session.dir, "recorded_testcase.zip");
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", {
            zlib: { level: 9 } // Sets the compression level.
        });

        output.on("close", function () {
            console.log(
                "Zip created: " + zipPath + " (" + archive.pointer() + " total bytes)"
            );
            resolve(zipPath);
        });

        archive.on("error", function (err) {
            reject(err);
        });

        archive.pipe(output);

        // Add record.spec.ts
        if (fs.existsSync(session.specPath)) {
            archive.file(session.specPath, { name: "record.spec.ts" });
        }

        // Add screenshots folder
        if (fs.existsSync(session.screenshotsDir)) {
            archive.directory(session.screenshotsDir, "screenshots");
        }

        archive.finalize();
    });
}


module.exports = {
    createRecordingSession,
    getSession,
    startRecording,
    stopRecording,
    getFilesForUpload,
    cleanupSpecAfterScreenshots,
    createZipArchive,
    sessions,
    recordingsRoot
};
