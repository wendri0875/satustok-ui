import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";

const logos = {
  shopee: "🛒",
  tokopedia: "🐢",
  "tiktok shop": "🎵",
};

export default function StoreList() {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openMenu, setOpenMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newMarketplace, setNewMarketplace] = useState("shopee");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // fetch data toko
  const fetchStores = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/shops`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      const text = await res.text();
      if (!res.ok) throw new Error("Gagal mengambil data toko");

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respon bukan JSON, kemungkinan HTML error/expired link");
      }
    // ✅ ambil array-nya dari field shops
       const shops = Array.isArray(data.shops) ? data.shops : [];

       //console.log(shops);
      setStores(shops);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchStores();
  }, [user]);

  // cek query param dari backend callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("status") === "success") {
      const shopName = params.get("shop_name") || "Toko";
      setNotification(`✅ ${shopName} berhasil ditambahkan!`);
      fetchStores();
      navigate("/store-list", { replace: true }); // bersihkan query
    }
  }, [location, navigate]);

  const masterStore = stores.find((s) => s.is_master);
  const clientStores = stores.filter((s) => !s.is_master);



  const setMaster = async (store) => {
    if (store.is_master) return;
    if (!window.confirm(`Jadikan "${store.shop_name}" sebagai master?`)) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/shops/${store.shop_id}/master`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gagal set master: ${errText}`);
      }

      // update lokal
      setStores(
        stores.map((s) => ({
          ...s,
          is_master: s.shop_id === store.shop_id ? 1 : 0,
        }))
      );

      setSelectedIds([]);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === clientStores.length ? [] : clientStores.map((s) => s.id)
    );
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) return alert("Tidak ada toko yang dipilih.");
    if (!window.confirm(`Hapus ${selectedIds.length} toko terpilih?`)) return;

    setStores(stores.filter((s) => !selectedIds.includes(s.id)));
    setSelectedIds([]);
    setOpenMenu(false);
  };

  const handleConnectStore = async () => {
  if (newMarketplace === "shopee") {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/shopee-auth/login`,
        { headers: { Authorization: `Bearer ${user?.token}`,
          "ngrok-skip-browser-warning": "true", // penting biar gak kena banner HTML
       } }
      );

      const text = await res.text(); // ambil mentah
      console.log("Response dari server:", text);

      if (!res.ok) {
        throw new Error(`Server error: ${text}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Respon bukan JSON, kemungkinan error/redirect HTML");
      }

      if (data.login_url) {
        window.location.href = data.login_url;
      } else {
        alert("Tidak mendapat login_url dari server");
      }
    } catch (err) {
      console.error("Gagal hubungkan Shopee:", err);
      alert(err.message || "Gagal hubungkan Shopee");
    }
  } else {
    alert(`Marketplace ${newMarketplace} belum didukung`);
  }
};



const handleReconnect = async (store) => {
  if (store.platform.toLowerCase() === "shopee") {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/shopee-auth/login`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      const data = JSON.parse(text);
      if (data.login_url) {
        window.location.href = data.login_url;
      } else {
        alert("Tidak mendapat login_url dari server");
      }
    } catch (err) {
      alert(err.message || "Gagal hubungkan ulang Shopee");
    }
  } else if (store.platform.toLowerCase() === "tiktok shop") {
    alert("Reconnect TikTok belum dibuat");
  }
};


  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Daftar Toko</h1>
      {notification && (
        <div className="p-3 bg-green-100 text-green-700 rounded">{notification}</div>
      )}

      {/* Master */}
      <div className="border rounded-lg p-4 bg-gray-50 shadow">
        <h2 className="text-xl font-bold mb-3">Master Toko</h2>
        {masterStore ? (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {logos[masterStore.platform.trim().toLowerCase()] || "🏬"}
              </span>
              <div>
                <p className="font-semibold">{masterStore.shop_name}</p>
                <p className="text-sm text-gray-500">{masterStore.platform}</p>
              </div>
            </div>
           {masterStore.status === "Aktif" ? (
                <span className="text-green-600 font-medium">Aktif</span>
              ) : (
                <button
                  onClick={() => handleReconnect(masterStore)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  Hubungkan Ulang
                </button>
              )}
          </div>
        ) : (
          <p className="text-gray-500">Belum ada master toko</p>
        )}
      </div>

      {/* Client */}
      <div className="border rounded-lg p-4 bg-gray-50 shadow">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Toko Client</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700"
          >
            Hubungkan Toko
          </button>
        </div>

        {clientStores.length === 0 ? (
          <p className="text-gray-500">Tidak ada toko client.</p>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b rounded-t">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.length === clientStores.length}
                  onChange={toggleSelectAll}
                />
                <span className="font-semibold">Toko</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="px-2 py-1 text-gray-600 hover:text-gray-800"
                >
                  ⋮
                </button>
                {openMenu && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow z-10">
                    <button
                      onClick={deleteSelected}
                      className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Hapus yang Dipilih
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* List */}
            <div className="divide-y">
              {clientStores.map((store) => (
                <div
                  key={store.shop_id}
                  className="flex items-center justify-between p-3 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(store.shop_id)}
                      onChange={() => toggleSelect(store.shop_id)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {logos[store.platform.trim().toLowerCase()] || "🏬"}
                      </span>
                      <div>
                        <p className="font-medium">{store.shop_name}</p>
                        <p className="text-sm text-gray-500">{store.platform}</p>
                      </div>
                    </div>
                  </div>
                      {/* Status */}
                      {store.status === "Aktif" ? (
                        <button
                          onClick={() => setMaster(store)}
                          className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                        >
                          Jadikan Master
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReconnect(store)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                        >
                          Hubungkan Ulang
                        </button>
                      )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah Toko */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-20">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h3 className="text-lg font-bold mb-4">Tambah Toko Baru</h3>
            <div className="mb-4">
              <label className="block text-sm mb-1">Marketplace</label>
              <select
                value={newMarketplace}
                onChange={(e) => setNewMarketplace(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg"
              >
                {Object.keys(logos).map((key) => (
                  <option key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-2 rounded-lg border hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleConnectStore}
                className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Hubungkan ke{" "}
                {newMarketplace.charAt(0).toUpperCase() + newMarketplace.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
