import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function ProductDashboard() {
  const { user, logout } = useAuth();
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [masterShop, setMasterShop] = useState(null);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  /** 🔹 Ambil toko master */
  useEffect(() => {
    if (!user?.token) return;

    const fetchMasterShop = async () => {
      try {
        const res = await fetch(`${backendUrl}/shops`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (res.status === 401) {
          logout();
          return;
        }

        if (!res.ok) throw new Error("Gagal fetch shops");

        const data = await res.json();
        const master = data?.shops?.find((s) => s.is_master === 1);

        if (!master) {
          setLoading(false);
          setError("Tidak ada master toko, produk tidak bisa diambil");
          return;
        }

        setMasterShop(master);
      } catch (err) {
        console.error("Gagal fetch master shop:", err);
        setError("Tidak bisa mengambil data toko");
      }
    };

    fetchMasterShop();
  }, [user, backendUrl, logout]);

  /** 🔹 Ambil produk aktif dari backend */
  const fetchProducts = useCallback(async () => {
    if (!user?.token || !masterShop) return;

    setLoading(true);
    setError(null);

    try {
      const url = `${backendUrl}/shops/${masterShop.shop_id}/products`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.error === "invalid_access_token") {
          setError("Token platform invalid, silakan hubungkan ulang toko.");
        } else {
          setError(data?.error || "Gagal mengambil produk");
        }
        setAllProducts([]);
        return;
      }

      // ✅ Backend sudah hanya kirim produk aktif
      setAllProducts(data.items || []);
    } catch (err) {
      console.error("Gagal fetch products:", err);
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }, [user, masterShop, backendUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /** 🔹 Expand / Collapse */
  const toggleExpand = (id) =>
    setExpandedProduct((prev) => (prev === id ? null : id));

  /** 🔹 Ubah stok/harga di state */
  const handleChange = (productId, modelId, field, value) => {
    setAllProducts((prev) =>
      prev.map((p) =>
        p.item_id === productId
          ? {
              ...p,
              models: (p.models || []).map((m) =>
                m.model_id === modelId ? { ...m, [field]: value } : m
              ),
            }
          : p
      )
    );
  };

  /** 🔹 Search lokal (frontend only) */
  const filteredProducts = useMemo(() => {
    if (!searchInput.trim()) return allProducts;
    const q = searchInput.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.item_name?.toLowerCase().includes(q) ||
        p.models?.some((m) => m.model_name?.toLowerCase().includes(q))
    );
  }, [allProducts, searchInput]);

  /** 🔹 Pagination */
  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  // === Render ===
  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return (
      <div className="p-4 text-red-600 font-medium">
        {error}{" "}
        {error.includes("hubungkan ulang") && (
          <button
            onClick={() => (window.location.href = "/store-list")}
            className="ml-2 underline text-blue-600"
          >
            Hubungkan ulang toko
          </button>
        )}
      </div>
    );

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Daftar Produk Aktif</h2>

      {/* 🔹 Search bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-1/2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* 🔹 Daftar Produk */}
      {paginatedProducts.map((product) => (
        <div
          key={product.item_id}
          className="border rounded-2xl shadow-sm p-4 bg-white"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleExpand(product.item_id)}
          >
            <div className="flex items-center gap-4">
              <img
                src={product.image || "/no-image.png"}
                alt={product.item_name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{product.item_name}</h3>
                <p className="text-sm text-gray-500">
                  {masterShop.platform === "shopee" ? "Shopee" : "TikTok"}
                </p>
              </div>
            </div>
            <span className="text-orange-600 font-medium">
              {expandedProduct === product.item_id ? "▲ Tutup" : "▼ Buka"}
            </span>
          </div>

          {expandedProduct === product.item_id && (
            <div className="mt-4">
              {product.models?.length > 0 ? (
                <div className="overflow-x-auto">
                 <table className="min-w-[400px] border border-gray-200 text-sm table-auto">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">SKU</th>
                      <th className="p-2 border">Stok</th>
                      <th className="p-2 border">Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.models?.map((variant) => (
                      <tr key={variant.model_id} className="border-b">
                        <td className="p-2 border">{variant.model_sku}</td>
                        <td className="p-2 border">
                          <input
                            type="number"
                            value={variant.total_available_stock}
                            className="w-20 border rounded px-2"
                            onChange={(e) =>
                              handleChange(
                                product.item_id,
                                variant.model_id,
                                "total_available_stock",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="number"
                            value={variant.current_price}
                            className="w-28 border rounded px-2"
                            onChange={(e) =>
                              handleChange(
                                product.item_id,
                                variant.model_id,
                                "current_price",
                                Number(e.target.value)
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              ) : (
                <div className="text-gray-500">
                  Produk ini tidak punya variasi
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* 🔹 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`px-3 py-1 border rounded ${
                p === page
                  ? "bg-orange-600 text-white border-orange-600"
                  : "hover:bg-orange-100"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
