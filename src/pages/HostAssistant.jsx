// HostAssistant.jsx

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../auth/AuthProvider";
import ChatContainer from "../components/ChatContainer";
import { useHostAssistant } from "../context/HostAssistantContext";
import HostHighlight from "../components/HostHighlight";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const wsUrl = import.meta.env.VITE_WS_URL;

function normalizeHostId(value) {
  return (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/^https:\/\/www\.tiktok\.com\/@/i, "")
    .replace(/^https:\/\/tiktok\.com\/@/i, "");
}

export default function HostAssistant() {
  const { user } = useAuth();
  const chatContainerRef = useRef(null);

  const {
    status,
    setStatus,
    hostId,
    setHostId,
    messages,
    setMessages,
    wsRef
  } = useHostAssistant();

  const [showHighlight, setShowHighlight] = useState(false);
  const [highlightText, setHighlightText] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ===============================
  // WEBSOCKET
  // ===============================
  useEffect(() => {
    if (!user?.token) return;
    if (status !== "online") return; // 🔥 hanya connect kalau online

    let reconnectTimer;
    const activeHostId = normalizeHostId(hostId);
    let disposed = false;
    let socket = null;

    const connect = () => {
      if (disposed || socket) return;

      socket = new WebSocket(`${wsUrl}?hostId=${activeHostId}`);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("WS CONNECTED");
      };

      socket.onmessage = (e) => {
        let data;
        try { data = JSON.parse(e.data); } catch { return; }

        const payloadHostId = normalizeHostId(data.hostId);
        if (payloadHostId && payloadHostId !== activeHostId) {
          return;
        }

        switch (data.type) {
          case "live_status":
            setStatus(data.status);
            break;

          case "live_comment":
            setMessages(prev => [...prev, {
              id: data.commentId,
              hostId: data.hostId || activeHostId,
              userId: data.userId,
              nickname: data.nickname,
              text: data.comment,
              assisted: false,
              lastProductId: data.lastProductId || null,
              lastPhotoUrl: data.lastPhotoUrl || null,
              lastSku: data.lastSku || null,
              lastUpdatedAt: data.lastUpdatedAt || null,
              answers: []
            }]);
            break;

          case "assistant_reply":
            if (data.channel !== "HOST_ASSISTANT") return;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === data.data.commentId
                  ? {
                      ...msg,
                      assisted: true,
                      answers: [...(msg.answers || []), {
                        text: data.data.text,
                        productCode: data.data.productCode
                      }]
                    }
                  : msg
              )
            );
            break;
        }
      };

      socket.onclose = () => {
        console.log("WS CLOSED");
        if (wsRef.current === socket) {
          wsRef.current = null;
        }
        socket = null;

        if (!disposed && status === "online") {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      if (socket) {
        socket.close();
        if (wsRef.current === socket) {
          wsRef.current = null;
        }
        socket = null;
      } else if (wsRef.current && normalizeHostId(hostId) === activeHostId) {
        wsRef.current = null;
      }
    };
  }, [user?.token, hostId, status]);

  // ===============================
  // START / STOP ASSISTANT
  // ===============================
  async function startAssistant() {
    if (!hostId) {
      alert("Akun TikTok wajib diisi");
      return;
    }

    if (status === "connecting" || status === "online") {
      console.log("Assistant already running or connecting");
      return;
    }

    setStatus("connecting");
    setMessages([]);

    try {
      const res = await fetch(`${backendUrl}/ai/live/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ hostId })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gagal start assistant");
      }

      const result = await res.json().catch(() => ({}));

      if (result?.success === false) {
        throw new Error(result.message || "Gagal start assistant");
      }

      setStatus("online");
      console.log("Assistant connected");

    } catch (err) {
      console.error("Start error:", err);
      setStatus("offline");
      alert("Gagal menghubungkan ke TikTok Live");
    }
  }

  async function stopAssistant() {
    if (!hostId) {
      alert("Host belum dipilih");
      return;
    }

    if (status === "offline") return;

    try {
      await fetch(`${backendUrl}/ai/live/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ hostId })
      });
    } catch (err) {
      console.error("Stop error:", err);
    }

    // 🔥 Tutup WS client ini saja
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus("offline");
    setMessages([]);
    console.log(`Assistant stopped for host: ${hostId}`);
  }

  // ===============================
  // FETCH PRODUCTS
  // ===============================
  const fetchProducts = async ({ search = "", page = 1, limit = 10 } = {}) => {
    if (!user?.token || !hostId) {
      return {
        data: [],
        pagination: { total: 0, total_pages: 0, current_page: 1, limit }
      };
    }

    const params = new URLSearchParams({
      tiktok_account: "alhayya_gamis",
      page: String(page),
      limit: String(limit),
    });

    if (search?.trim()) {
      params.set("search", search.trim());
    }

    const url = `${backendUrl}/live-products?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "ngrok-skip-browser-warning": "true",
      }
    });
    const payload = await res.json();

    const rows = Array.isArray(payload) ? payload : (payload?.data || []);
    const mapped = rows.map((p) => ({
      id: p.id,
      etalase: p.etalase,
      sku: p.sku,
      name: p.name,
      highlight: p.highlight || "",
      photoUrl: p.photo_url || "",
      updated_at: p.updated_at || "",
      is_active: p.is_active,
      live_status: p.live_status || null,
    }));

    const pagination = Array.isArray(payload)
      ? { total: mapped.length, total_pages: 1, current_page: 1, limit: mapped.length || limit }
      : {
          total: payload?.pagination?.total || 0,
          total_pages: payload?.pagination?.total_pages || 0,
          current_page: payload?.pagination?.current_page || page,
          limit: payload?.pagination?.limit || limit,
        };

    return { data: mapped, pagination };
  };

  // ===============================
  // HANDLE PRODUCT ASSIGN & ANSWER
  // ===============================
  const handleAssignProduct = async (message, product) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === message.id
          ? { ...m, lastProductId: product.id, lastPhotoUrl: product.photoUrl, lastSku: product.sku, lastUpdatedAt: product.updated_at, manualOverride: true }
          : m
      )
    );

    await fetch(`${backendUrl}/ai/live/manual-assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({
        hostId,
        userId: message.userId,
        productId: product.id,
        photoUrl: product.photoUrl,
        updatedAt: product.updated_at,
        sku: product.sku,
        intent: message.intent || "manual_override"
      })
    });
  };

  const handleAddAnswer = async (message, answerText) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === message.id
          ? { ...m, assisted: true, answers: [...(m.answers || []), { text: answerText, fromSOS: true, createdAt: new Date().toISOString() }] }
          : m
      )
    );
  };

  // ===============================
  // FETCH / SAVE HIGHLIGHT
  // ===============================
  const fetchHighlight = async () => {
    if (!hostId) return;
    try {
      const res = await fetch(`${backendUrl}/host/live-highlight?host_id=${hostId}`, {
        headers: { Authorization: `Bearer ${user.token}`, "ngrok-skip-browser-warning":"true" },
      });
      const data = await res.json();
      setHighlightText(data?.highlight || "");
    } catch (err) { console.error(err); }
  };

  const saveHighlight = async () => {
    if (!hostId) return false;
    try {
      const res = await fetch(`${backendUrl}/host/live-highlight`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${user.token}`, "ngrok-skip-browser-warning":"true" },
        body: JSON.stringify({ host_id: hostId, highlight: highlightText })
      });
      return res.ok;
    } catch (err) { console.error(err); return false; }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="chat-page" style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", overscrollBehaviorY: "none", fontFamily: "sans-serif" }}>
      {/* HEADER FIXED */}
      <div className="chat-header" style={{
        position: "relative",
        flex: "0 0 auto",
        zIndex: 40,
        display: "flex", flexDirection: "column", alignItems: "stretch",
        gap: "8px",
        padding: "10px 16px", background: "#fff",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)", borderBottom: "1px solid #ddd"
      }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: "#9a3412",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          Akun TikTok yang sedang live: @{hostId || "-"}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <span style={{ fontSize: "18px", flexShrink: 0 }}>
            {status === "online" ? "🟢" : status === "connecting" ? "🟡" : "🔴"}
          </span>
          <input
            type="text"
            placeholder="Username TikTok (tanpa @)"
            value={hostId}
            disabled={status==="online"||status==="connecting"}
            onChange={(e)=>setHostId(e.target.value)}
            style={{
              flex:1,
              minWidth: 0,
              padding:"8px 12px",
              borderRadius:"999px",
              border:"1px solid #ccc",
              outline:"none",
              color:"#000",
              backgroundColor: status==="online"||status==="connecting" ? "#f5f5f5" : "#fff"
            }}
          />

          <div style={{ display:"flex", gap:"6px", flexShrink: 0, alignItems: "center" }}>
            {status==="offline" ? (
              <button onClick={startAssistant} style={buttonStyle} title="Mulai">▶️</button>
            ) : (
              <button onClick={stopAssistant} style={buttonStyle} title="Stop">⏹️</button>
            )}

            <button onClick={() => {
                if(!hostId){ alert("Isi dulu Username TikTok"); return;}
                setShowHighlight(prev => !prev);
                if(!showHighlight) fetchHighlight();
              }}
              style={buttonStyle} title="Highlight Toko">🛍️</button>
          </div>
        </div>
      </div>

      {/* CHAT */}
      <ChatContainer
        ref={chatContainerRef}
        messages={messages}
        fetchProducts={fetchProducts}
        onSelectProduct={handleAssignProduct}
        onAddAnswer={handleAddAnswer}
      />

      {/* MODAL HIGHLIGHT */}
      {showHighlight && <HostHighlight
        hostId={hostId}
        highlightText={highlightText}
        setHighlightText={setHighlightText}
        saveHighlight={saveHighlight}
        onClose={()=>setShowHighlight(false)}
      />}
    </div>
  );
}

// Minimal flat button style
const buttonStyle = {
  background:"#e0e0e0",
  color:"#333",
  border:"none",
  padding:"6px 12px",
  borderRadius:"50%",
  cursor:"pointer",
  fontSize:"18px",
  transition:"transform 0.2s, background 0.2s",
  onMouseEnter: (e)=>{ e.currentTarget.style.transform="scale(1.1)"; e.currentTarget.style.background="#d5d5d5"; },
  onMouseLeave: (e)=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.background="#e0e0e0"; }
};
