
// \components\ChatMessage.jsx
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import ProductThumbnail from "../components/ProductThumbnail"

 
export default function ChatMessage({ message, fetchProducts, onSelectProduct  }) {
  const { user } = useAuth();
const [products, setProducts] = useState([]);
const [showPicker, setShowPicker] = useState(false);
const [loading, setLoading] = useState(false);

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
                {message.lastproductId ? (
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
                        src={`${backendUrl}${message.lastphotoUrl}`}
                        token={user.token}
                        version={message.lastUpdatedat}
                      />
                  </div>
                ) : (
                  "📦 Pilih Produk"
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
