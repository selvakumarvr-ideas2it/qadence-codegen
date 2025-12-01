// client/src/App.tsx
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3001";
const RECORDING_CONTROL_URL = `${API_BASE}/api/recording-control`;
const UPLOAD_INTERNAL_URL = `${API_BASE}/api/upload-test-records`;

type Session = {
    id: string;
    url: string;
    browser: string;
    status: string;
    createdAt: string;
};

function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const chooseActiveSession = (list: Session[]): Session | null => {
        if (!list || list.length === 0) return null;

        // Prefer non-error, newest session
        const nonError = list.filter((s) => s.status !== "error");
        const candidates = nonError.length ? nonError : list;

        return candidates.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
    };

    const fetchSessions = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/sessions`);
            const data: Session[] = await res.json();
            setSession(chooseActiveSession(data));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSessions();
        const timer = setInterval(fetchSessions, 5000);
        return () => clearInterval(timer);
    }, []);

    const controlSession = async (action: "start" | "stop") => {
        if (!session) return;
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(RECORDING_CONTROL_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, recordingId: session.id })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message || `Action ${action} executed`);
                fetchSessions();
            } else {
                setMessage(`Error: ${data.error || "Failed to control session"}`);
            }
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const uploadSession = async () => {
        if (!session) return;
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(UPLOAD_INTERNAL_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recordingId: session.id })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(
                    `Upload completed (upstream status: ${data.upstreamStatus || "unknown"})`
                );
            } else {
                setMessage(`Error: ${data.error || "Upload failed"}`);
            }
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case "recording":
                return "#2563ff";   // bright blue
            case "processing":
                return "#f59e0b";   // amber
            case "ready":
                return "#22c55e";   // green
            case "stopping":
                return "#6b7280";   // gray
            case "error":
                return "#dc2626";   // red
            default:
                return "#6b7280";
        }
    };


    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                padding: "3rem 1rem",
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 640,
                    background: "#ffffff",
                    borderRadius: 16,
                    boxShadow:
                        "0 14px 28px rgba(0,0,0,0.06), 0 10px 10px rgba(0,0,0,0.04)",
                    padding: "1.75rem 2rem 2rem 2rem",
                    border: "1px solid #e3e3ea"
                }}
            >
                {/* Header */}
                <header
                    style={{
                        marginBottom: "1.5rem"
                    }}
                >
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "1.4rem",
                            letterSpacing: 0.4,
                            fontWeight: 600,
                            color: "#222"
                        }}
                    >
                        Qadence Recording Console
                    </h1>
                    <p
                        style={{
                            margin: "0.25rem 0 0",
                            fontSize: 13,
                            color: "#666"
                        }}
                    >
                        Manage the current recording session and generate a Playwright test
                        with step-wise screenshots.
                    </p>
                </header>

                {/* Divider */}
                <div
                    style={{
                        borderBottom: "1px solid #efeff3",
                        marginBottom: "1.5rem"
                    }}
                />

                {/* Message */}
                {message && (
                    <div
                        style={{
                            marginBottom: "1.5rem",
                            padding: "0.75rem 1rem",
                            borderRadius: 10,
                            border: "1px solid #d7defb",
                            background: "#f3f5ff",
                            fontSize: 13,
                            color: "#374151"
                        }}
                    >
                        {message}
                    </div>
                )}

                {/* Active session card */}
                <section>
                    <h2
                        style={{
                            margin: "0 0 0.75rem",
                            fontSize: 14,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            color: "#666"
                        }}
                    >
                        Active Session
                    </h2>

                    {!session ? (
                        <p
                            style={{
                                fontSize: 13,
                                color: "#999",
                                marginTop: 4
                            }}
                        >
                            No active session found. Create a session using the backend API
                            (<code>/api/recording-config</code>).
                        </p>
                    ) : (
                        <div
                            style={{
                                borderRadius: 12,
                                border: "1px solid #ececf2",
                                padding: "1rem 1.25rem",
                                background: "#fafafa"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "0.75rem"
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            textTransform: "uppercase",
                                            letterSpacing: 1,
                                            color: "#777",
                                            marginBottom: 4
                                        }}
                                    >
                                        Session ID
                                    </div>
                                    <code
                                        style={{
                                            fontSize: 13,
                                            padding: "0.15rem 0.4rem",
                                            borderRadius: 4,
                                            background: "#f4f4f7"
                                        }}
                                    >
                                        {session.id.slice(0, 8)}
                                    </code>
                                </div>

                                <div>
                                    <span
                                        style={{
                                            display: "inline-block",
                                            padding: "0.15rem 0.55rem",
                                            borderRadius: 999,
                                            fontSize: 11,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.8,
                                            background: "#f8f8fa",
                                            border: `1px solid ${statusColor(session.status)}`,
                                            color: statusColor(session.status)
                                        }}
                                    >
                                        {session.status}
                                    </span>
                                </div>
                            </div>
                            <div
                                style={{
                                    marginTop: "0.25rem",
                                    fontSize: 12,
                                    color: "#555"
                                }}
                            >
                                <div
                                    style={{
                                        textTransform: "uppercase",
                                        letterSpacing: 0.8,
                                        color: "#777",
                                        marginBottom: 2
                                    }}
                                >
                                    URL
                                </div>
                                <div
                                    style={{
                                        maxWidth: "100%",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}
                                    title={session.url}
                                >
                                    {session.url}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "0.5rem",
                                    marginTop: "0.5rem"
                                }}
                            >
                                <button
                                    onClick={() => controlSession("start")}
                                    disabled={loading || session.status === "recording"}
                                    style={{
                                        padding: "0.35rem 0.8rem",
                                        borderRadius: 999,
                                        border: "1px solid #d5d5e0",
                                        background: "#fff",
                                        fontSize: 12,
                                        cursor:
                                            loading || session.status === "recording"
                                                ? "default"
                                                : "pointer",
                                        opacity:
                                            loading || session.status === "recording" ? 0.5 : 1
                                    }}
                                >
                                    Start
                                </button>
                                <button
                                    onClick={() => controlSession("stop")}
                                    disabled={loading || session.status !== "recording"}
                                    style={{
                                        padding: "0.35rem 0.8rem",
                                        borderRadius: 999,
                                        border: "1px solid #f0c9c2",
                                        background: "#fff7f5",
                                        fontSize: 12,
                                        cursor:
                                            loading || session.status !== "recording"
                                                ? "default"
                                                : "pointer",
                                        opacity:
                                            loading || session.status !== "recording" ? 0.5 : 1
                                    }}
                                >
                                    Stop
                                </button>
                                <button
                                    onClick={uploadSession}
                                    disabled={loading || session.status !== "ready"}
                                    style={{
                                        padding: "0.35rem 0.8rem",
                                        borderRadius: 999,
                                        border: "none",
                                        background: "#222",
                                        color: "#fff",
                                        fontSize: 12,
                                        cursor:
                                            loading || session.status !== "ready"
                                                ? "default"
                                                : "pointer",
                                        opacity:
                                            loading || session.status !== "ready" ? 0.5 : 1
                                    }}
                                >
                                    Upload
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default App;
