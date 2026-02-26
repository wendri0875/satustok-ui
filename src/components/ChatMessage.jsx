//ChatMessage.jsx

import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import ProductThumbnail from "../components/ProductThumbnail";
import SOSPanel from "../components/SOSPanel";

export default function ChatMessage({
  message,
  fetchProducts,
  onSelectProduct,
  onAddAnswer
}) {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
    current_page: 1,
    limit: 8
  });

  const [showHighlight, setShowHighlight] = useState(false);
  const [highlightData, setHighlightData] = useState(null);
  const [loadingHighlight, setLoadingHighlight] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const hasProduct = !!message.lastProductId;

  const loadProducts = async ({ search = "", nextPage = 1 } = {}) => {
    setLoading(true);
    try {
      const result = await fetchProducts({
        search,
        page: nextPage,
        limit
      });

      const rows = Array.isArray(result) ? result : (result?.data || []);
      const activeOnly = rows.filter((p) => p.is_active);
      setProducts(activeOnly);
      setPagination(
        result?.pagination || {
          total: activeOnly.length,
          total_pages: 1,
          current_page: nextPage,
          limit
        }
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FETCH PRODUCT LIST
  ========================= */
  const handleOpenPicker = async () => {
    if (!showPicker) {
      const firstPage = 1;
      setPage(firstPage);
      await loadProducts({ search: searchTerm, nextPage: firstPage });
    }
    setShowPicker(!showPicker);
  };

  /* =========================
     FETCH PRODUCT DETAIL (SELECT *)
     GET /live-products/:id
  ========================= */
  const fetchProductDetail = async (productId) => {
    try {
      setLoadingHighlight(true);

      const res = await fetch(
        `${backendUrl}/live-products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Gagal mengambil produk");
      }

      const data = await res.json();
      const product = data?.rows?.[0] || data;
      setHighlightData(product?.highlight || "");
    } catch (err) {
      console.error("Fetch highlight error:", err);
      setHighlightData("Gagal mengambil highlight");
    } finally {
      setLoadingHighlight(false);
    }
  };

  /* =========================
     HANDLE INTIP
  ========================= */
  const handleToggleHighlight = async () => {
    if (!showHighlight && message.lastProductId) {
      await fetchProductDetail(message.lastProductId);
    }
    setShowHighlight((prev) => !prev);
  };

  return (
    <div className="chat-message">
      {/* HEADER */}
      <div
        className="chat-user-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8
        }}
      >
        <div>
          <span className="chat-user">{message.nickname}</span>
          {message.assisted && (
            <span className="chat-assisted-badge">✓ di-assist</span>
          )}
        </div>

        {/* PRODUCT PICKER BLOCK */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4
          }}
        >
          {/* BUTTON PICKER */}
          <button
            onClick={handleOpenPicker}
            style={{
              fontSize: 12,
              padding: 4,
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            {hasProduct ? (
              <div style={{ position: "relative", width: 48, height: 48 }}>
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
                    zIndex: 2
                  }}
                >
                  {message.lastSku}
                </div>

                <ProductThumbnail
                  src={message.lastPhotoUrl}
                  version={message.lastUpdatedAt}
                />


              </div>
            ) : (
              "📦"
            )}
          </button>

          {/* INTIP BUTTON */}
          {hasProduct && (
            <button
              onClick={handleToggleHighlight}
              style={{
                fontSize: 10,
                padding: "2px 6px",
                borderRadius: 6,
                border: "1px solid #1677ff",
                background: "#fff",
                color: "#1677ff",
                cursor: "pointer"
              }}
            >
              👀 {showHighlight ? "Tutup" : "Intip"}
            </button>
          )}

          {/* HIGHLIGHT BOX */}
          {showHighlight && (
            <div
              style={{
                position: "absolute",
                top: 100,
                right: 0,
                width: 260,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 9999
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 6
                }}
              >
                ✨ Highlight Produk
              </div>

              {loadingHighlight ? (
                <div style={{ fontSize: 13 }}>Loading...</div>
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {highlightData || "Tidak ada highlight"}
                </div>
              )}
            </div>
          )}

          {/* PRODUCT PICKER DROPDOWN */}
          {showPicker && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 60,
                width: 220,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 9999,
                maxHeight: 300,      // 🔥 batas tinggi popup
                overflowY: "auto"    // 🔥 aktifkan scroll di dalam popup
              }}
            >
              <div style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      const firstPage = 1;
                      setPage(firstPage);
                      await loadProducts({
                        search: searchTerm,
                        nextPage: firstPage
                      });
                    }
                  }}
                  placeholder="Cari SKU / nama / etalase"
                  style={{
                    width: "100%",
                    fontSize: 12,
                    padding: "6px 8px",
                    border: "1px solid #ddd",
                    borderRadius: 6
                  }}
                />
              </div>

              {loading && <div style={{ padding: 10 }}>Loading...</div>}

              {!loading && products.length === 0 && (
                <div style={{ padding: 10, fontSize: 12, color: "#666" }}>
                  Produk tidak ditemukan
                </div>
              )}

              {!loading &&
                products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(message, p);
                      setShowPicker(false);
                      setShowHighlight(false);
                      setHighlightData(null);
                    }}
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: 8,
                      cursor: "pointer",
                      alignItems: "center"
                    }}
                  >
                    <ProductThumbnail
                      src={p.photoUrl}
                      version={p.updated_at}
                    />
                    <span>{p.sku}</span>
                  </div>
                ))}

              {!loading && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    padding: 8,
                    borderTop: "1px solid #eee",
                    fontSize: 11
                  }}
                >
                  <button
                    disabled={page <= 1}
                    onClick={async () => {
                      const next = Math.max(page - 1, 1);
                      setPage(next);
                      await loadProducts({ search: searchTerm, nextPage: next });
                    }}
                    style={{
                      border: "1px solid #ddd",
                      background: page <= 1 ? "#f5f5f5" : "#fff",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: page <= 1 ? "not-allowed" : "pointer"
                    }}
                  >
                    Prev
                  </button>

                  <span>
                    {pagination.current_page || page} / {pagination.total_pages || 1}
                  </span>

                  <button
                    disabled={page >= (pagination.total_pages || 1)}
                    onClick={async () => {
                      const next = page + 1;
                      setPage(next);
                      await loadProducts({ search: searchTerm, nextPage: next });
                    }}
                    style={{
                      border: "1px solid #ddd",
                      background: page >= (pagination.total_pages || 1) ? "#f5f5f5" : "#fff",
                      borderRadius: 6,
                      padding: "4px 8px",
                      cursor: page >= (pagination.total_pages || 1) ? "not-allowed" : "pointer"
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TEXT */}
      <div className="chat-text">{message.text}</div>

      {/* SOS BUTTON */}
      <div style={{ marginTop: 6 }}>
        <button
          onClick={() => setShowSOS(true)}
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

      {/* SOS PANEL */}
      {showSOS && (
        <SOSPanel
          message={message}
          backendUrl={backendUrl}
          hasProduct={hasProduct}
          onClose={() => setShowSOS(false)}
          onSaved={(text) => onAddAnswer(message, text)}
        />
      )}

      {/* ANSWERS */}
      {Array.isArray(message.answers) &&
        message.answers.map((ans, idx) => (
          <div key={idx} className="chat-assistant">
            🤖 {ans.text}
          </div>
        ))}
    </div>
  );
}
