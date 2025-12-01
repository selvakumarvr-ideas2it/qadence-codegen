// server/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const {
    createRecordingSession,
    getSession,
    startRecording,
    stopRecording,
    getFilesForUpload,
    createZipArchive,
    sessions
} = require("./recordingManager");

// Constants (per your requirement)
const RECORDING_CONFIG_URL = "/api/recording-config";
const RECORDING_CONTROL_URL = "/api/recording-control";
const UPLOAD_TEST_RECORDS_URL =
    "http://54.242.75.113/dashboard-service/api/v1/test-case/upload-test-records";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. CONFIG endpoint
// curl example:
// curl -X POST http://localhost:3001/api/recording-config \
//   -H "Content-Type: application/json" \
//   -d '{"url": "https://example.com/", "browser": "chromium"}'
app.post(RECORDING_CONFIG_URL, (req, res) => {
    const { url, browser, sourceType, testCaseTrackerId } = req.body || {};
    const authHeader = req.headers["authorization"];
    const jwtToken = authHeader && authHeader.split(" ")[1]; // Assuming Bearer token

    if (!url) {
        return res.status(400).json({ error: "url is required" });
    }

    const session = createRecordingSession(
        url,
        browser || "chromium",
        sourceType,
        testCaseTrackerId,
        jwtToken
    );
    return res.json({
        recordingId: session.id,
        url: session.url,
        browser: session.browser,
        specPath: session.specPath,
        screenshotsDir: session.screenshotsDir,
        status: session.status
    });
});

// 2. CONTROL endpoint
// curl example (single-session mode):
// curl -X POST http://localhost:3001/api/recording-control \
//   -H "Content-Type: application/json" \
//   -d '{"action": "start"}'
//
// curl -X POST http://localhost:3001/api/recording-control \
//   -H "Content-Type: application/json" \
//   -d '{"action": "stop"}'
//
// For multi-session:
// curl -X POST http://localhost:3001/api/recording-control \
//   -H "Content-Type: application/json" \
//   -d '{"action": "start", "recordingId": "<id>"}'
app.post(RECORDING_CONTROL_URL, async (req, res) => {
    const { action, recordingId } = req.body || {};
    if (!action) {
        return res.status(400).json({ error: "action is required (start|stop)" });
    }

    let session = null;

    if (recordingId) {
        session = getSession(recordingId);
        if (!session) {
            return res.status(404).json({ error: "recordingId not found" });
        }
    } else {
        // fallback: if only one session exists, use it
        if (sessions.size === 1) {
            session = Array.from(sessions.values())[0];
        } else {
            return res.status(400).json({
                error:
                    "recordingId is required when multiple sessions are active (or none exist)"
            });
        }
    }

    try {
        if (action === "start") {
            const pid = startRecording(session);
            return res.json({
                message: "Recording started (Qadence recorder launched)",
                recordingId: session.id,
                pid
            });
        } else if (action === "stop") {
            stopRecording(session);
            return res.json({
                message: "Stop signal sent to recording process",
                recordingId: session.id
            });
        } else {
            return res.status(400).json({ error: "Unknown action. Use start|stop" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Internal error" });
    }
});

// 6. UPLOAD endpoint (internal API of this app)
// This calls the external UPLOAD_TEST_RECORDS_URL and streams files.
app.post("/api/upload-test-records", async (req, res) => {
    const { recordingId } = req.body || {};
    if (!recordingId) {
        return res.status(400).json({ error: "recordingId is required" });
    }

    const session = getSession(recordingId);
    if (!session) {
        return res.status(404).json({ error: "recordingId not found" });
    }

    try {
        const zipPath = await createZipArchive(session);

        const form = new FormData();
        form.append("file", fs.createReadStream(zipPath), {
            filename: "recorded_testcase.zip"
        });

        const jsonData = JSON.stringify({
            testCaseTrackerId: session.testCaseTrackerId,
            sourceType: session.sourceType,
            targetFileName: "TC-01_Insurance.spec.ts" // Hardcoded as per request example, or derive if needed
        });

        form.append("data", jsonData);

        const headers = {
            ...form.getHeaders(),
            accept: "/"
        };

        if (session.jwtToken) {
            headers["Authorization"] = `Bearer ${session.jwtToken}`;
        }

        const response = await axios.post(UPLOAD_TEST_RECORDS_URL, form, {
            headers
        });

        return res.json({
            message: "Uploaded test records successfully",
            upstreamStatus: response.status,
            upstreamData: response.data
        });
    } catch (err) {
        console.error(
            "Error uploading to external service:",
            err.response ? err.response.data : err.message
        );
        return res.status(500).json({
            error: "Upload to external service failed",
            details: err.message,
            upstreamError: err.response ? err.response.data : null
        });
    }
});

// Utility endpoint for debugging
app.get("/api/sessions", (req, res) => {
    const data = Array.from(sessions.values()).map((s) => ({
        id: s.id,
        url: s.url,
        browser: s.browser,
        status: s.status,
        createdAt: s.createdAt
    }));
    res.json(data);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Recording server listening on http://localhost:${PORT}`);
});
