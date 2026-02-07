import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthProvider";
import PhotoPicker from "../components/PhotoPicker"

export default function LiveProductSatustok() {
  const { user } = useAuth();

  const [tiktokAccount, setTiktokAccount] = useState("alhayya_gamis");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingHighlight, setEditingHighlight] = useState("");
  const [editingEtalase, setEditingEtalase] = useState("");
  const [editingSku, setEditingSku] = useState("");
  const [editingName, setEditingName] = useState("");

  const [showPhotoWarning, setShowPhotoWarning] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);

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
    etalase: p.etalase,
    code: p.sku,
    name: p.name,
    highlight: p.highlight || "",
    photoUrl: p.photo_url ? `${backendUrl}${p.photo_url}?ts=${Date.now()}` : "",
    is_active: p.is_active !== 0,
    live_status: p.live_status || null // 🔥 BARU
  }))
);


  }, [user?.token, tiktokAccount, backendUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);



  //editing area

  const textareaRef = useRef(null);
const cardRef = useRef(null);

useEffect(() => {
  if (!editingId) return;

  // auto scroll ke card
  cardRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  // auto resize textarea
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      textareaRef.current.scrollHeight + "px";
  }
}, [editingId]);



// ===============================
  // SAVE HIGHLIGHT (UPDATE)
  // ===============================
  const saveProduct  = async (id) => {
    await fetch(`${backendUrl}/live-products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
       etalase: editingEtalase, 
       sku: editingSku,
      name: editingName,
      highlight: editingHighlight,
      }),
    });

  setEditingId(null);
  setEditingSku(null);
  setEditingSku("");
  setEditingName("");
  setEditingHighlight("");
  fetchProducts();
  };

  // ===============================
  // (delete)
  // ===============================
  const delProduct  = async (id) => {
    await fetch(`${backendUrl}/live-products/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });

  fetchProducts();
  };

    // ===============================
  // (NEW PRODUCT)
  // ===============================
const saveNewProduct = async () => {
  if (!editingSku || !editingName) {
    alert("SKU dan Nama wajib diisi");
    return;
  }

  setIsSaving(true);

  try {
    // 1️⃣ SIMPAN PRODUK
    const res = await fetch(`${backendUrl}/live-products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        tiktok_account: tiktokAccount,
        etalase: editingEtalase,
        sku: editingSku,
        name: editingName,
        highlight: editingHighlight,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error("Gagal simpan produk");

    const newProductId = data.id;

    // 2️⃣ UPLOAD FOTO JIKA ADA
    if (newPhoto) {
      await uploadPhotoById(newProductId, newPhoto);
    }

    // 3️⃣ RESET
    setEditingId(null);
    setEditingEtalase(null);
    setEditingSku("");
    setEditingName("");
    setEditingHighlight("");
    setNewPhoto(null);

    fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Gagal tambah produk");
  } finally {
    setIsSaving(false);
  }
};

const uploadPhotoById = async (productId, file) => {
  const formData = new FormData();
  formData.append("photo", file);

  await fetch(
    `${backendUrl}/live-products/${productId}/photo`,
    {
      method: "POST",
      body: formData,
    }
  );
};



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

  const toggleActive = async (id, currentActive) => {

    console.log("id:",id,"currentActive:",currentActive);
  const nextActive =
    currentActive === 0 ? 1 : 0; // null dianggap aktif

  try {
    await fetch(`${backendUrl}/live-products/${id}/active`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        is_active: nextActive,
      }),
    });

    // refresh list
    fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Gagal mengubah status produk");
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


  const duplicateProduct = async (sourceProductId) => {
  try {
    const res = await fetch(`${backendUrl}/live-products/duplicate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        source_product_id: sourceProductId,
      }),
    });

    if (!res.ok) throw new Error("Gagal duplikat");

    fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Gagal duplikat produk");
  }
};


const updateLiveStatus = async (id, nextStatus) => {
  try {
    await fetch(`${backendUrl}/live-products/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
         "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        live_status: nextStatus, // "used" | "held" | null
      }),
    });

    fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Gagal update status live");
  }
};



  const renderWA = (text = "") => {
  let html = text
    .replace(/\*(.*?)\*/g, "<b>$1</b>")     // *bold*..
    .replace(/_(.*?)_/g, "<i>$1</i>")       // _italic_
    .replace(/~(.*?)~/g, "<s>$1</s>")       // ~strike~
    .replace(/\n/g, "<br/>");               // newline

  return { __html: html };
};



  // ===============================
  // UI
  // ===============================
  return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto bg-white rounded-2xl shadow p-4">

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
            <button
              onClick={() => {
                setEditingId("new");
                setEditingSku("");
                setEditingName("");
                setEditingHighlight("");
              }}
              className="
                w-full mb-3
                border-2 border-dashed border-blue-600
                text-blue-600
                py-2 rounded-xl text-sm
              "
            >
            ➕ Tambah Manual 
            </button>

          {/* Product List */}
          <div className="space-y-3">

            {editingId === "new" && (
              <div className="border rounded-xl p-3 mb-3 bg-white">
                {/* FOTO KOSONG */}
                <div className="flex gap-3">
                  
                  <PhotoPicker
                    value={newPhoto}
                    onChange={(file) => setNewPhoto(file)}
                  />

                  {/* FORM */}
                  <div className="flex-1">
                    <input
                      className="w-full border rounded-lg px-2 py-1 text-xs mb-1"
                      placeholder="Etalase"
                      value={editingEtalase}
                      onChange={(e) => setEditingEtalase(e.target.value)}
                    />
                    <input
                      className="w-full border rounded-lg px-2 py-1 text-xs mb-1"
                      placeholder="SKU"
                      value={editingSku}
                      onChange={(e) => setEditingSku(e.target.value)}
                    />

                    <input
                      className="w-full border rounded-lg px-2 py-1 text-xs mb-2"
                      placeholder="Nama Produk"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />

                    <textarea
                      className="w-full border rounded-xl p-2 text-xs"
                      rows={5}
                      placeholder="Highlight (format WA)"
                      value={editingHighlight}
                      onChange={(e) => setEditingHighlight(e.target.value)}
                    />
                  </div>
                </div>

                {/* BUTTON */}
                <div className="flex flex-col items-end gap-1 mt-2">
                  <button
                  onClick={() => {
                if (!newPhoto) {
                  setShowPhotoWarning(true);
                  return;
                }
                saveNewProduct();
              }}
              disabled={isSaving}
              className={`py-1 rounded-xl text-xs border-2
                ${isSaving
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-green-600 text-green-700"
                }
              `}
            >
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="border-2 border-gray-400 text-gray-600 text-xs px-3 py-1 rounded-lg"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {showPhotoWarning && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-4 w-72 text-sm">
                  <p className="mb-4">
                    Bunda belum menambahkan foto produk.
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowPhotoWarning(false);
                        saveNewProduct(); // simpan tanpa foto
                      }}
                      className="flex-1 border rounded-lg py-1"
                    >
                      Simpan Dulu
                    </button>

                    <button
                      onClick={() => setShowPhotoWarning(false)}
                      className="flex-1 border-2 border-green-600 text-green-700 rounded-lg py-1"
                    >
                      Ok
                    </button>
                  </div>
                </div>
              </div>
            )}

              {products.map((p, i) => {
                const isActive = Number(p.is_active) !== 0;

                return (

           

                  <div
                    ref={editingId === p.id ? cardRef : null}
                    key={p.code}
                    className="bg-white rounded-xl border p-3 flex flex-col gap-3 relative"
                  >
                    {/* ===== ATAS: FOTO + KONTEN ===== */}
                    <div className="flex gap-3">

                      {/* FOTO */}
                      <div className="relative">
                      <PhotoPicker
                        imageUrl={p.photoUrl}
                        loading={uploadingIndex === i}
                        onChange={(file) => handlePhotoUpload(i, file)}
                      />

                      {p.etalase && (
                          <div className="absolute top-1 left-1 bg-yellow-500 text-black font-semibold text-[10px] px-2 py-0.5 rounded-md z-10">
                            {p.etalase}
                          </div>
                        )}

                      </div>
                      {/* KONTEN KANAN */}
                      <div className="flex-1 flex flex-col gap-2">
                        {editingId === p.id ? 
                          (
                              <>
                                <input
                                  className="w-full border rounded-lg px-2 py-1 text-xs"
                                  placeholder="Etalase"
                                  value={editingEtalase}
                                  onChange={(e) => setEditingEtalase(e.target.value)}
                                />
                                <input
                                  className="w-full border rounded-lg px-2 py-1 text-xs"
                                  placeholder="SKU"
                                  value={editingSku}
                                  onChange={(e) => setEditingSku(e.target.value)}
                                />

                                <input
                                  className="w-full border rounded-lg px-2 py-1 text-xs"
                                  placeholder="Nama Produk"
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                />

                                <textarea
                                  ref={textareaRef}
                                  className="w-full border rounded-xl p-2 text-xs"
                                  rows={6}
                                  value={editingHighlight}
                                  onChange={(e) => setEditingHighlight(e.target.value)}
                                />

                                <button
                                  onClick={() => saveProduct(p.id)}
                                  className="w-full bg-green-600 text-white py-1 rounded-xl text-xs"
                                >
                                  Simpan
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditingHighlight("");
                                    setEditingEtalase(null);
                                    setEditingSku("");
                                    setEditingName("");
                                  }}
                                  className="w-full bg-gray-300 text-gray-700 py-1 rounded-xl text-xs"
                                >
                                  Batal
                                </button>
                              </>
                           ) : (

                          <div className={`${!isActive ? "text-gray-400" : ""}`}>
                            <div className="text-sm font-semibold">
                              {p.code} — {p.name}
                            </div>

                            <div
                              className="text-xs bg-gray-50 p-2 rounded leading-relaxed mt-1"
                              dangerouslySetInnerHTML={renderWA(p.highlight)}
                            />
                          </div>
                              )}
                      </div>
                    </div>

                    {/* ===== BAWAH: TOMBOL ===== */}
                    {editingId !== p.id && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t">

                        {/* MENU ... */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenuId(openMenuId === p.id ? null : p.id)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-full border text-gray-500"
                          >
                            ⋯
                          </button>

                          {openMenuId === p.id && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow text-xs z-30 min-w-[160px]">
                              <button
                                onClick={() => {
                                  toggleActive(p.id, isActive ? 1 : 0);
                                  setOpenMenuId(null);
                                }}
                                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                              >
                                {isActive ? "🔴 Nonaktifkan" : "🟢 Aktifkan"}
                              </button>

                              <button
                                onClick={() => {
                                  duplicateProduct(p.id);
                                  setOpenMenuId(null);
                                }}
                                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                              >
                                📄 Duplikat
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus produk ${p.code}?`)) {
                                    delProduct(p.id);
                                  }
                                  setOpenMenuId(null);
                                }}
                                className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                              >
                                🗑 Hapus
                              </button>
                            </div>
                          )}
                        </div>

                        {/* STATUS */}
                        {
                        isActive && (
                          <>
                            <button
                              onClick={() => {
                                  setEditingId(p.id);
                                  setEditingEtalase(p.etalase);
                                  setEditingSku(p.code);
                                  setEditingName(p.name);
                                  setEditingHighlight(p.highlight);
                                  setOpenMenuId(null);
                                }}
                              className={`
                                text-xs px-2 py-1 rounded-lg whitespace-nowrap border
                              `}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() =>
                                updateLiveStatus(
                                  p.id,
                                  p.live_status === "used" ? null : "used"
                                )
                              }
                              className={`
                                text-xs px-2 py-1 rounded-lg whitespace-nowrap border
                                ${p.live_status === "used"
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-gray-300"
                                }
                              `}
                            >
                              🧕🏻 Dipakai
                            </button>

                            <button
                              onClick={() =>
                                updateLiveStatus(
                                  p.id,
                                  p.live_status === "held" ? null : "held"
                                )
                              }
                              className={`
                                text-xs px-2 py-1 rounded-lg whitespace-nowrap border
                                ${p.live_status === "held"
                                  ? "bg-orange-500 text-white border-orange-500"
                                  : "border-gray-300"
                                }
                              `}
                            >
                              🙋‍♀️ Dipegang
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}



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
