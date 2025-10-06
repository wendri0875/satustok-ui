import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function ProductDashboard() {
  const { user, logout } = useAuth();
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [masterShop, setMasterShop] = useState(null);
  const [error, setError] = useState(null);

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
        logout(); // otomatis clear session & redirect ke login
        return;
        }

        if (!res.ok) throw new Error("Gagal fetch shops");

        const data = await res.json();
        const master = data?.shops?.find((s) => s.is_master === 1);
        
        if (!master) {
        setLoading(false);
        setError("Tidak ada master toko, produk tidak bisa diambil");
      }

        setMasterShop(master || null);
      } catch (err) {
        console.error("Gagal fetch master shop:", err);
        setError("Tidak bisa mengambil data toko");
      }
    };

    fetchMasterShop();
  }, [user, backendUrl, logout]);

  /** 🔹 Ambil produk */
  const fetchProducts = useCallback(async () => {
    if (!user?.token || !masterShop) return;

    setLoading(true);
    setError(null);

    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const url = `${backendUrl}/shops/${masterShop.shop_id}/products?item_status=REVIEWING&item_status=NORMAL&item_status=UNLIST&include_variations=true${searchParam}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = await res.json();
    //  console.log(data);
      if (!res.ok) {
        if (data?.error === "invalid_acceess_token") {
          setError("Token Shopee invalid, silakan hubungkan ulang toko.");
        } else {
          setError(data?.error || "Gagal mengambil produk");
        }
        setAllProducts([]);
        return;
      }

      setAllProducts(data.items || []);
    } catch (err) {
      console.error("Gagal fetch products:", err);
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }, [user, masterShop, search, backendUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /** 🔹 Toggle expand/collapse produk */
  const toggleExpand = (id) =>
    setExpandedProduct((prev) => (prev === id ? null : id));

  /** 🔹 Handle perubahan stok/harga */
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

  /** 🔹 Filter sesuai tab */
  const filteredProducts = useMemo(() => {
    return activeTab === "ALL"
      ? allProducts
      : allProducts.filter((p) => p.item_status === activeTab);
  }, [allProducts, activeTab]);

  /** 🔹 Hitung total per status */
  const counts = useMemo(
    () => ({
      ALL: allProducts.length,
      NORMAL: allProducts.filter((p) => p.item_status === "NORMAL").length,
      REVIEWING: allProducts.filter((p) => p.item_status === "REVIEWING").length,
      UNLIST: allProducts.filter((p) => p.item_status === "UNLIST").length,
    }),
    [allProducts]
  );

  /** 🔹 Search */
  const handleSearch = () => setSearch(searchInput.trim());

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
      <h2 className="text-2xl font-bold mb-4">Master Product List</h2>

      {/* 🔹 Search bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full md:w-1/2 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={handleSearch}
          className="bg-orange-600 text-white px-4 rounded-lg"
        >
          Cari
        </button>
      </div>

      {/* 🔹 Tabs */}
      <div className="flex gap-4 border-b pb-2 mb-4">
        {["ALL", "NORMAL", "REVIEWING", "UNLIST"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-t-lg font-medium ${
              activeTab === tab
                ? "border-b-2 border-orange-600 text-orange-600"
                : "text-gray-600 hover:text-orange-600"
            }`}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* 🔹 Daftar Produk */}
      {filteredProducts.map((product) => (
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
                <p className="text-sm text-gray-500">{product.item_status}</p>
              </div>
            </div>
            <span className="text-orange-600 font-medium">
              {expandedProduct === product.item_id ? "▲ Tutup" : "▼ Buka"}
            </span>
          </div>

          {expandedProduct === product.item_id && (
            <div className="mt-4">
              {product.models?.length > 0 ? (
                <table className="w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">SKU</th>
                      <th className="p-2 border">Nama</th>
                      <th className="p-2 border">Stok</th>
                      <th className="p-2 border">Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.models.map((variant) => (
                      <tr key={variant.model_id} className="border-b">
                        <td className="p-2 border">{variant.model_sku}</td>
                        <td className="p-2 border">{variant.model_name}</td>
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
              ) : (
                <div className="text-gray-500">
                  Produk ini tidak punya variasi
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
