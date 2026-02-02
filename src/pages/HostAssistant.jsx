// HostAssistant.jsx

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import ChatHeader from "../components/ChatHeader";
import ChatContainer from "../components/ChatContainer";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const wsUrl = import.meta.env.VITE_WS_URL;

export default function HostAssistant() {
  const { user } = useAuth();

  const [status, setStatus] = useState("offline"); // online | connecting | offline
  const [username, setUsername] = useState("alhayya_gamis");
  const [messages, setMessages] = useState([]);

  const wsRef = useRef(null);

  /* ===============================
   * WEBSOCKET
   * =============================== */
  useEffect(() => {
    if (!user?.token) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS CONNECTED");
    };

    ws.onmessage = (e) => {
      let data;
      try {
        data = JSON.parse(e.data);
      } catch (err) {
        console.error("WS PARSE ERROR:", e.data);
        return;
      }

      console.log("WS IN:", data);

      switch (data.type) {
        /* =====================
         * STATUS LIVE
         * ===================== */
        case "live_status":
          setStatus(data.status);

          if (data.status === "offline") {
            setMessages([]);
            setUsername("");
          }
          break;

        /* =====================
         * KOMENTAR LIVE
         * ===================== */
        case "live_comment":
          setMessages((prev) => [
            ...prev,
            {
              id: data.commentId,
              user: data.nickname,
              text: data.comment,
              assisted: false,
              answers: []
            }
          ]);
          break;

        /* =====================
         * JAWABAN AI / ASSISTANT
         * ===================== */
        case "assistant_reply":
          if (data.channel !== "HOST_ASSISTANT") return;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.data.commentId
                ? {
                    ...msg,
                    assisted: true,
                    answers: [
                      ...msg.answers,
                      {
                        text: data.data.text,
                        productCode: data.data.productCode
                      }
                    ]
                  }
                : msg
            )
          );
          break;

        default:
          console.warn("WS UNKNOWN TYPE:", data);
      }
    };

    ws.onerror = (err) => {
      console.error("WS ERROR:", err);
    };

    ws.onclose = () => {
      console.log("WS CLOSED");
    };

    return () => ws.close();
  }, [user?.token]);

  /* ===============================
   * START LIVE ASSISTANT
   * =============================== */
  async function startAssistant() {
    if (!username) {
      alert("Username TikTok wajib diisi");
      return;
    }

    setStatus("connecting");

    try {
      await fetch(`${backendUrl}/ai/live/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ username })
      });
    } catch (err) {
      console.error(err);
      setStatus("offline");
      alert("Gagal menghubungkan ke TikTok Live");
    }
  }

  /* ===============================
   * STOP LIVE ASSISTANT
   * =============================== */
  async function stopAssistant() {
    try {
      await fetch(`${backendUrl}/ai/live/stop`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
    } catch (err) {
      console.error(err);
    }

    setMessages([]);
    setUsername("");
    setStatus("offline");
  }

  /* ===============================
   * UI
   * =============================== */
  return (
    <div className="chat-page">
      <ChatHeader status={status} />

      {/* CONTROL BAR */}
      <div style={{ padding: "12px", background: "#fff", borderBottom: "1px solid #ddd" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Username TikTok (tanpa @)"
            value={username}
            disabled={status === "online" || status === "connecting"}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />

          {status === "offline" ? (
            <button
              onClick={startAssistant}
              style={{
                background: "#f44336",
                color: "#fff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              MULAI
            </button>
          ) : (
            <button
              onClick={stopAssistant}
              style={{
                background: "#333",
                color: "#fff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              STOP
            </button>
          )}
        </div>

        {/* STATUS */}
        <div style={{ marginTop: "6px", fontSize: "12px" }}>
          {status === "connecting" && (
            <span style={{ color: "#ff9800" }}>
              ⏳ Menghubungkan ke TikTok Live...
            </span>
          )}

          {status === "online" && (
            <span style={{ color: "green" }}>
              ● LIVE — TikTok terhubung
            </span>
          )}

          {status === "offline" && (
            <span style={{ color: "#999" }}>
              ○ Offline
            </span>
          )}
        </div>
      </div>

      {/* CHAT */}
      <ChatContainer messages={messages} />
    </div>
  );
}
