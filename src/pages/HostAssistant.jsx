// HostAssistant.jsx

import { useEffect,useState  } from "react";
import { useAuth } from "../auth/AuthProvider";
import ChatHeader from "../components/ChatHeader";
import ChatContainer from "../components/ChatContainer";
import { useHostAssistant } from "../context/HostAssistantContext";
import HostHighlight from "../components/HostHighlight";




const backendUrl = import.meta.env.VITE_BACKEND_URL;
const wsUrl = import.meta.env.VITE_WS_URL;



export default function HostAssistant() {
  const { user } = useAuth();




  const {
  status,
  setStatus,
  hostId,
  setHostId,
  messages,
  setMessages,
  wsRef
} = useHostAssistant();

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
         //   setMessages([]);
          //  setUsername("");
          }
          break;

        /* =====================
         * KOMENTAR LIVE
         * ===================== */
        case "live_comment":
          
          if (data.status === "offline") {
            setStatus(data.status);
          }

         setMessages((prev) => [
          ...prev,
            {
              id: data.commentId,
              hostId: hostId, // 🔥 penting untuk SOS
              userId: data.userId,
              nickname: data.nickname,
              text: data.comment,
              assisted: false,
              lastProductId: data.lastProductId || null,
              lastPhotoUrl: data.lastPhotoUrl || null,
              lastSku: data.lastSku || null,
              lastUpdatedAt: data.lastUpdatedAt || null,
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
                       ...(msg.answers || []),
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

    ws.onclose = (event) => {
        console.log("WS CLOSED");
        console.log("WS CLOSED:");
        console.log("code:", event.code);
        console.log("reason:", event.reason);
        console.log("wasClean:", event.wasClean);
    };

    return () => ws.close();
  }, [user?.token]);

  /* ===============================
   * START LIVE ASSISTANT
   * =============================== */
  async function startAssistant() {
    if (!hostId) {
      alert("Akun TikTok wajib diisi");
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
        body: JSON.stringify({ hostId })
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

    //setMessages([]);
    //setUsername("");
    setStatus("offline");
  }


  const fetchProducts = async () => {

  if (!user?.token || !hostId) return [];
  //const url = `${backendUrl}/live-products?tiktok_account=${username}`;
  const url = `${backendUrl}/live-products?tiktok_account=alhayya_gamis`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${user.token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  const data = await res.json();

  console.log(data);

  return data.map(p => ({
    id: p.id,
    etalase: p.etalase,
    sku: p.sku,
    name: p.name,
    highlight: p.highlight || "",
    photoUrl: p.photo_url ||"",
    updated_at:p.updated_at ||"",
    is_active: p.is_active !== 0,
    live_status: p.live_status || null,
  }));
};


const handleAssignProduct = async (message, product) => {
  try {
    console.log("Assigning product:", product.id);

    // 1️⃣ Update UI langsung (optimistic update)
    setMessages((prev) =>
      prev.map((m) =>
        m.id === message.id
          ? {
              ...m,
              lastProductId: product.id,
              lastPhotoUrl: product.photoUrl,
              lastSku: product.sku,
              lastUpdatedAt:product.updated_at,
              manualOverride: true // optional flag
            }
          : m
      )
    );

    console.log("msg",message);

    // 2️⃣ Kirim ke backend (AI context update)
    await fetch(`${backendUrl}/ai/live/manual-assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        hostId: hostId,
        userId: message.userId,
        productId: product.id,
        photoUrl: product.photoUrl,
        updatedAt:product.updated_at,
        sku: product.sku,
        intent: message.intent || "manual_override",
      }),
    });

  } catch (err) {
    console.error("Assign gagal:", err);
  }
};




const handleAddAnswer = async (message, answerText) => {
  try {
    console.log("Adding SOS answer to message:", message.id);

    // 1️⃣ Optimistic UI update
    setMessages((prev) =>
      prev.map((m) =>
        m.id === message.id
          ? {
              ...m,
              answers: [
                ...(Array.isArray(m.answers) ? m.answers : []),
                {
                  text: answerText,
                  fromSOS: true,
                  createdAt: new Date().toISOString(),
                },
              ],
              assisted: true, // optional: langsung tandai assisted
            }
          : m
      )
    );

  } catch (err) {
    console.error("Add answer gagal:", err);
  }
};


const [showHighlight, setShowHighlight] = useState(false);
const [highlightText, setHighlightText] = useState("");


const fetchHighlight = async () => {
  if (!hostId) return;

  try {
    const res = await fetch(
      `${backendUrl}/host/live-highlight?host_id=${hostId}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const data = await res.json();

    console.log("highlight:",data );
    setHighlightText(data?.highlight || "");
  } catch (err) {
    console.error("Fetch highlight gagal:", err);
  }
};

const saveHighlight = async () => {
  if (!hostId) return false;

  try {
    const res = await fetch(`${backendUrl}/host/live-highlight`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        host_id: hostId,
        highlight: highlightText,
      }),
    });

    if (!res.ok) {
      throw new Error("Save gagal");
    }

    return true;
  } catch (err) {
    console.error("Save highlight gagal:", err);
    return false;
  }
};





  /* ===============================
   * UI
   * =============================== */
  return (
    <div className="chat-page">
      <ChatHeader status={status} />

      {/* CONTROL BAR */}
      <div style={{ padding: "12px", background: "#fff", borderBottom: "1px solid #ddd" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Username TikTok (tanpa @)"
                  value={hostId}
                  disabled={status === "online" || status === "connecting"}
                  onChange={(e) => setHostId(e.target.value)}
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

                <button
                  onClick={() => {
                    if (!hostId) {
                      alert("Isi dulu Username TikTok");
                      return;
                    }

                    setShowHighlight((prev) => !prev);

                    if (!showHighlight) {
                      fetchHighlight(); // load saat dibuka
                    }
                  }}
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  📘 Highlight
                </button>
          </div>

            {showHighlight && (
                <HostHighlight
                  highlightText={highlightText}
                  setHighlightText={setHighlightText}
                  saveHighlight={saveHighlight}
                  onClose={() => {
                    setShowHighlight(false);
                  }}
                />
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
      <ChatContainer
        messages={messages}
        fetchProducts={fetchProducts}
        onSelectProduct={handleAssignProduct}
        onAddAnswer={handleAddAnswer }
      />

    </div>
  );
}
