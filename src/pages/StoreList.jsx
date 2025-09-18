import { useState } from "react";

const logos = {
  shopee: "🛒",
  tokopedia: "🐢",
  "tiktok shop": "🎵",
};

export default function StoreList() {
  const initialStores = [
    { id: 1, marketplace: "Shopee", storeName: "Toko A", status: "Aktif", isMaster: false },
    { id: 2, marketplace: "Shopee", storeName: "Toko B", status: "Aktif", isMaster: true },
    { id: 3, marketplace: "Tokopedia", storeName: "Toko C", status: "Aktif", isMaster: false },
    { id: 4, marketplace: "TikTok Shop", storeName: "Toko D", status: "Aktif", isMaster: false },
  ];

  const [stores, setStores] = useState(initialStores);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openMenu, setOpenMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [newStoreName, setNewStoreName] = useState("");
  const [newMarketplace, setNewMarketplace] = useState("Shopee");

  const masterStore = stores.find((s) => s.isMaster);
  const clientStores = stores.filter((s) => !s.isMaster);

  const setMaster = (store) => {
    if (store.isMaster) return;
    const confirmChange = window.confirm(
      `Apakah Anda yakin ingin menjadikan "${store.storeName}" sebagai master toko?`
    );
    if (!confirmChange) return;
    setStores(
      stores.map((s) => ({
        ...s,
        isMaster: s.id === store.id,
      }))
    );
    setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === clientStores.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clientStores.map((s) => s.id));
    }
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) {
      alert("Tidak ada toko yang dipilih.");
      return;
    }
    if (window.confirm(`Hapus ${selectedIds.length} toko terpilih?`)) {
      setStores(stores.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      setOpenMenu(false);
    }
  };

  const saveNewStore = () => {
    if (!newStoreName.trim()) {
      alert("Nama toko tidak boleh kosong");
      return;
    }

    const newId = Math.max(...stores.map((s) => s.id)) + 1;
    const newStore = {
      id: newId,
      marketplace: newMarketplace,
      storeName: newStoreName.trim(),
      status: "Aktif",
      isMaster: false,
    };

    setStores([...stores, newStore]);
    setNewStoreName("");
    setNewMarketplace("Shopee");
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Master */}
      <div className="border rounded-lg p-4 bg-gray-50 shadow">
        <h2 className="text-xl font-bold mb-3">Master Toko</h2>
        <p className="text-sm text-gray-500 mb-4">Toko pusat tempat mengatur stok</p>
        {masterStore ? (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {logos[masterStore.marketplace.trim().toLowerCase()] || "🏬"}
              </span>
              <div>
                <p className="font-semibold">{masterStore.storeName}</p>
                <p className="text-sm text-gray-500">{masterStore.marketplace}</p>
              </div>
            </div>
            <span className="text-green-600 font-medium">{masterStore.status}</span>
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
            className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            + Tambah Toko
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Toko-toko yang stoknya mengikuti Master Toko</p>

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
                  key={store.id}
                  className="flex items-center justify-between p-3 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(store.id)}
                      onChange={() => toggleSelect(store.id)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {logos[store.marketplace.trim().toLowerCase()] || "🏬"}
                      </span>
                      <div>
                        <p className="font-medium">{store.storeName}</p>
                        <p className="text-sm text-gray-500">{store.marketplace}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setMaster(store)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Jadikan Master
                  </button>
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
            <div className="mb-3">
              <label className="block text-sm mb-1">Nama Toko</label>
              <input
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Marketplace</label>
              <select
                value={newMarketplace}
                onChange={(e) => setNewMarketplace(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg"
              >
                <option value="Shopee">Shopee</option>
                <option value="Tokopedia">Tokopedia</option>
                <option value="TikTok Shop">TikTok Shop</option>
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
                onClick={saveNewStore}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
