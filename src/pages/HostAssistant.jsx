// HostAssistant.jsx

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../auth/AuthProvider";
import ChatContainer from "../components/ChatContainer";
import { useHostAssistant } from "../context/HostAssistantContext";
import HostHighlight from "../components/HostHighlight";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const wsUrl = import.meta.env.VITE_WS_URL;

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

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log("WS CONNECTED");

    ws.onmessage = (e) => {
      let data;
      try { data = JSON.parse(e.data); } 
      catch { return; }

      switch (data.type) {
        case "live_status":
          setStatus(data.status);
          break;

        case "live_comment":
          setMessages((prev) => [
            ...prev,
            {
              id: data.commentId,
              hostId: hostId,
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

        case "assistant_reply":
          if (data.channel !== "HOST_ASSISTANT") return;
          setMessages((prev) =>
            prev.map((msg) =>
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

        default:
          console.warn("WS UNKNOWN TYPE:", data);
      }
    };

    ws.onerror = (err) => console.error("WS ERROR:", err);
    ws.onclose = (event) => console.log("WS CLOSED:", event);

    return () => ws.close();
  }, [user?.token]);

  // ===============================
  // START / STOP ASSISTANT
  // ===============================
  async function startAssistant() {
    if (!hostId) return alert("Akun TikTok wajib diisi");
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

  async function stopAssistant() {
    try {
      await fetch(`${backendUrl}/ai/live/stop`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` }
      });
    } catch (err) { console.error(err); }
    setStatus("offline");
  }

  // ===============================
  // Fetch Products
  // ===============================
  const fetchProducts = async () => {
    if (!user?.token || !hostId) return [];
    const url = `${backendUrl}/live-products?tiktok_account=alhayya_gamis`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${user.token}`, "ngrok-skip-browser-warning":"true" } });
    const data = await res.json();
    
    return data.map(p => ({
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
  };

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
          ? { ...m, assisted: true, answers: [...(m.answers||[]), { text: answerText, fromSOS: true, createdAt: new Date().toISOString() }] }
          : m
      )
    );
  };

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
    <div className="chat-page" style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "sans-serif" }}>

      {/* HEADER FIXED */}
      <div className="chat-header" style={{
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 16px", background: "#fff",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)", borderBottom: "1px solid #ddd"
      }}>
        {/* LEFT STATUS + INPUT */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
          <span style={{ fontSize: "18px" }}>{status === "online" ? "🟢" : status === "connecting" ? "🟡" : "🔴"}</span>
          <input
            type="text"
            placeholder="Username TikTok (tanpa @)"
            value={hostId}
            disabled={status==="online"||status==="connecting"}
            onChange={(e)=>setHostId(e.target.value)}
            style={{
              flex:1,
              padding:"6px 12px",
              borderRadius:"999px",
              border:"1px solid #ccc",
              outline:"none",
              color:"#000",
              backgroundColor: status==="online"||status==="connecting" ? "#f5f5f5" : "#fff"
            }}
          />
        </div>

        {/* RIGHT BUTTONS */}
        <div style={{ display:"flex", gap:"6px" }}>
          {status==="offline" ? (
            <button
              onClick={startAssistant}
              style={buttonStyle}
              title="Mulai">▶️</button>
          ) : (
            <button
              onClick={stopAssistant}
              style={buttonStyle}
              title="Stop">⏹️</button>
          )}

          <button
            onClick={() => {
              if(!hostId){ alert("Isi dulu Username TikTok"); return;}
              setShowHighlight(prev => !prev);
              if(!showHighlight) fetchHighlight();
            }}
            style={buttonStyle} title="Highlight Toko">🛍️</button>
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