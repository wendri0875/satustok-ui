import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function LiveProductSatustok() {
  const { user } = useAuth();

  const [tiktokAccount, setTiktokAccount] = useState("alhayya_gamis");
  const [products, setProducts] = useState([]);




  const excelRef = useRef();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ===============================
  // FETCH PRODUCTS
  // ===============================
  const fetchProducts = useCallback(async () => {
    if (!user?.token || !tiktokAccount) return;

    const url = `${backendUrl}/live-products?tiktok_account=${tiktokAccount}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = await res.json();

setProducts(
  data.map(p => ({
    id: p.id,                 // 🔥 PENTING
    code: p.sku,
    desc: `${p.name} – ${JSON.parse(p.highlight || "[]").join(", ")}`,
    photoUrl: p.photo_url ? `${backendUrl}${p.photo_url}?ts=${Date.now()}` : ""
  }))
);


  }, [user?.token, tiktokAccount, backendUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ===============================
  // UPLOAD EXCEL
  // ===============================
  const handleExcelUpload = async (file) => {
    if (!file || !user?.token) return;

    if (!tiktokAccount) {
      alert("Akun TikTok wajib diisi");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tiktok_account", tiktokAccount);

    try {
      const url = `${backendUrl}/live-products/upload-excel`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal upload Excel");
        return;
      }

      alert(`Berhasil upload ${data.inserted} produk`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // ===============================
  // UPLOAD FOTO (KE BACKEND)
  // ===============================

  const [uploadingIndex, setUploadingIndex] = useState(null);

  const handlePhotoUpload = async (index, file) => {
    if (!file || !user?.token) return;

    const product = products[index];
    const formData = new FormData();
    formData.append("photo", file);

    try {
      setUploadingIndex(index); // 🔥 mulai loading
      const res = await fetch(
        `${backendUrl}/live-products/${product.id}/photo`,
        {
          method: "POST",
          body: formData,
        }
      );

       const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal upload foto");
        return;
      }

      // refresh image (force reload cache)
      setProducts((prev) => {
        const updated = [...prev];
        updated[index].photoUrl =
          `${backendUrl}/uploads/products/${product.id}.webp?ts=` +
          Date.now();
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
    setUploadingIndex(null); // 🔥 stop loading
  }

  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold text-center mb-4">
          Live Product – Satustok
        </h2>

        {/* TikTok Account */}
        <div className="mb-3">
          <label className="text-xs text-gray-600 mb-1 block">
            Akun TikTok (sedang live)
          </label>
          <input
            type="text"
            value={tiktokAccount}
            onChange={(e) => setTiktokAccount(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm"
          />
        </div>

        {tiktokAccount && (
          <div className="text-xs text-green-600 text-center mb-3">
            Live aktif untuk akun <b>{tiktokAccount}</b>
          </div>
        )}

        {/* Upload Excel */}
        <div className="mb-4">
          <button
            onClick={() => excelRef.current.click()}
            className="w-full bg-black text-white py-2 rounded-xl text-sm"
          >
            Upload Excel Produk
          </button>
          <input
            ref={excelRef}
            type="file"
            accept=".xls,.xlsx"
            hidden
            onChange={(e) => handleExcelUpload(e.target.files[0])}
          />
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {products.map((p, i) => (
            <div
              key={p.code}
              className="flex items-center gap-3 border rounded-xl p-3"
            >
            <label
              className="
                relative
                w-20
                aspect-[9/16]
                border-2
                border-dashed
                rounded-xl
                flex
                items-center
                justify-center
                text-xs
                text-gray-500
                cursor-pointer
                overflow-hidden
                bg-gray-50
              "
            >
              {/* FOTO */}
              {p.photoUrl?.trim()  && (
                <img
                src={p.photoUrl}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",   // 🔥 TIDAK CROP
                  backgroundColor: "#f3f3f3",
                  opacity: uploadingIndex === i ? 0.4 : 1,
                  transition: "opacity 0.2s",
                  background: "linear-gradient(#fafafa, #eee)"
                }}
              />
              )}

              {/* PLACEHOLDER */}
              {!p.photoUrl && uploadingIndex !== i && "+ Foto"}

              {/* LOADING OVERLAY */}
              {uploadingIndex === i && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) =>
                  handlePhotoUpload(i, e.target.files[0])
                }
              />
            </label>

              <div className="flex-1">
                <div className="font-semibold text-sm">
                  Kode: {p.code}
                </div>
                <div className="text-xs text-gray-600">{p.desc}</div>
              </div>
            </div>
          ))}

          {!products.length && tiktokAccount && (
            <div className="text-xs text-gray-400 text-center">
              Belum ada produk untuk akun ini
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
