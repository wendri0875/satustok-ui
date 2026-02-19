
// \components\ChatMessage.jsx
import { useState,useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import ProductThumbnail from "../components/ProductThumbnail"

 
export default function ChatMessage({ message, fetchProducts, onSelectProduct , onAddAnswer  }) {
  const { user } = useAuth();
const [products, setProducts] = useState([]);
const [showPicker, setShowPicker] = useState(false);
const [loading, setLoading] = useState(false);

const [showSOS, setShowSOS] = useState(null); // index jawaban yg dibuka
const [sosText, setSosText] = useState("");
const [saving, setSaving] = useState(false);
const [saveAsGeneral, setSaveAsGeneral] = useState(false);
const [intent, setIntent] = useState("");

const backendUrl = import.meta.env.VITE_BACKEND_URL;


const handleOpenPicker = async () => {
  if (!showPicker) {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(data.filter(p => p.is_active)); // optional filter
    setLoading(false);
  }

  setShowPicker(!showPicker);
};

const handleSaveSOS = async (type) => {
  if (!sosText.trim()) return;

  try {
    setSaving(true);

       const res = await fetch(`${backendUrl}/ai/sos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({
        hostId: message.hostId,
        productId: message.lastProductId,
        question: message.text,
        answer: sosText,
        intent, // 🔥 tambahan ini
        type
      })
    });
    
    if (!res.ok) throw new Error("Gagal save");
        
    if (res.ok) {
      onAddAnswer(message, sosText);
    }

    setShowSOS(null);
    setSosText("");
  } catch (err) {
    console.error("SOS ERROR", err);
  } finally {
    setSaving(false);
  }
};

  // ✅ LETAKKAN DI SINI
  const hasProduct = !!message.lastProductId;

  useEffect(() => {
    if (!hasProduct) {
      setSaveAsGeneral(true);
    }
  }, [hasProduct]);

   
  return (
    <div className="chat-message">
      {/* HEADER KOMENTAR */}
      <div
        className="chat-user-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div>
          <span className="chat-user">{message.nickname}</span>

          {message.assisted && (
            <span className="chat-assisted-badge">
              ✓ di-assist
            </span>
          )}
        </div>

       {/* TOMBOL PILIH PRODUK */}
            <div style={{ position: "relative" }}>
              <button
                onClick={handleOpenPicker}
                title="Pilih atau ganti produk"
                style={{
                  fontSize: 12,
                  padding: 4,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  background: "#fff",
                }}
              >
                {message.lastProductId ? (
                  <div style={{ position: "relative", width: 48, height: 48 }}>
                    
                    {/* BADGE SKU */}
                    <div
                      style={{
                        position: "absolute",
                        top: -6,
                        left: -6,
                        background: "#000",
                        color: "#fff",
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 6,
                        zIndex: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {message.lastSku}
                    </div>

                    {/* GAMBAR PRODUK */}
                         <ProductThumbnail
                        src={`${backendUrl}${message.lastPhotoUrl}`}
                        token={user.token}
                        version={message.lastUpdatedAt}
                      />
                  </div>
                ) : (
                  "📦"
                )}
              </button>

              {showPicker && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 60,
                    width: 220,
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 9999,
                  }}
                >
                  {loading && <div style={{ padding: 10 }}>Loading...</div>}

                  {!loading &&
                    products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProduct(message, p);
                          setShowPicker(false);
                        }}
                        style={{
                          display: "flex",
                          gap: 8,
                          padding: 8,
                          cursor: "pointer",
                          alignItems: "center",
                        }}
                      >
                      <ProductThumbnail
                        src={`${backendUrl}${p.photoUrl}`}
                        token={user.token}
                        version={p.updated_at}
                      />

                        <span>{p.sku}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

      </div>

      {/* ISI KOMENTAR */}
      <div className="chat-text">
        {message.text}
      </div>

      {/* TOMBOL SOS SELALU MUNCUL */}
      <div style={{ marginTop: 6 }}>
        <button
          onClick={() => {
            setShowSOS("question");
            setSosText("");
          }}
          style={{
            fontSize: 11,
            padding: "3px 8px",
            borderRadius: 6,
            border: "1px solid #ff4d4f",
            background: "#fff",
            color: "#ff4d4f",
            cursor: "pointer"
          }}
        >
          🆘
        </button>
      </div>

      {showSOS === "question" && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fafafa"
          }}
        >
            {/* INPUT TOPIK */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>
                🏷️ Topik
              </label>

              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="Contoh: ukuran, ongkir, bahan, warna..."
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #d9d9d9"
                }}
              />
            </div>
          <textarea
            value={sosText}
            onChange={(e) => setSosText(e.target.value)}
            rows={4}
            placeholder="Tulis jawaban terbaik versi host..."
            style={{ width: "100%", padding: "6px 8px", marginBottom: 8, border: "1px solid #d9d9d9" }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            
            {/* CHECKBOX */}
            <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                disabled={!hasProduct} // 🔥 disable kalau tidak ada produk
                checked={saveAsGeneral}
                onChange={(e) => setSaveAsGeneral(e.target.checked)}
              />
              Jadikan jawaban umum (tidak spesifik produk)
            </label>
            {!hasProduct && (
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                Tidak ada produk terpilih → otomatis disimpan sebagai jawaban umum
              </div>
            )}

            {/* BUTTON ROW */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() =>
                  handleSaveSOS( hasProduct
                      ? saveAsGeneral
                        ? "general"
                        : "product"
                      : "general")
                }
                disabled={saving}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #d9d9d9",
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                💾 Simpan
              </button>

              <button
                onClick={() => setShowSOS(null)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #d9d9d9",
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                ❌ Batal
              </button>
            </div>
          </div>


        </div>
      )}



      {/* JAWABAN ASSISTANT */}
      {Array.isArray(message.answers) &&
        message.answers.map((ans, idx) => (
          <div key={idx} className="chat-assistant">
            🤖 {ans.text}
          </div>
        ))}
    </div>
  );
}
