import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";

export default function StockHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [orderId, setOrderId] = useState(""); // 🔍 Tambahan pencarian order id
  const [rawItems, setRawItems] = useState(""); // 🔍 Tambahan pencarian order id
  const [searchProduct, setSearchProduct] = useState(""); // 🔍 Tambahan pencarian Produk
  const [searchOrder, setSearchOrder] = useState(""); // Untuk debounce input

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOrderId(searchOrder.trim());
      setRawItems(searchProduct.trim());
      setPage(1);
    }, 500); // ⏱ debounce 0.5 detik
    return () => clearTimeout(timeout);
  }, [searchOrder,searchProduct]);

  useEffect(() => {
    fetchLogs();
  }, [page, platform, status, orderId, rawItems]);

  const fetchLogs = async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      page,
      limit,
    });
    if (platform) params.append("platform", platform);
    if (status) params.append("status", status);
    if (orderId) params.append("order_id", orderId);
    if (rawItems) params.append("raw_items", rawItems);

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/orderlogs?${params.toString()}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      const text = await res.text();
      if (!res.ok) throw new Error("Gagal mengambil data log");

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respon bukan JSON (mungkin link expired / HTML error)");
      }

      console.log(JSON.stringify(data,200));

      setLogs(data.logs || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Log Perubahan Stock</h2>

      {/* 🔹 Filter section */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Platform */}
        <select
          value={platform}
          onChange={(e) => {
            setPage(1);
            setPlatform(e.target.value);
          }}
          className="border rounded p-2"
        >
          <option value="">Semua Platform</option>
          <option value="tiktok">TikTok</option>
          <option value="shopee">Shopee</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border rounded p-2"
        >
          <option value="">Semua Status</option>
          <option value="AWAITING_SHIPMENT">AWAITING_SHIPMENT</option>
          <option value="CANCEL">CANCEL</option>
        </select>

          {/* 🔍 Pencarian Order ID */}
          <div className="relative">
            <input
              type="text"
              id="order_id"
              value={searchOrder}
              onChange={(e) => setSearchOrder(e.target.value)}
              className="border rounded p-2 min-w-[200px]"
              placeholder="Cari Order ID: "
            />
          </div>

          {/* 🔍 Pencarian Product */}
          <div className="relative">
            <input
              type="text"
              id="raw_items"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="border rounded p-2 min-w-[200px]"
              placeholder="Cari Produk: "
            />
          </div>

       </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Memuat data...</p>
      ) : logs.length === 0 ? (
        <p>Tidak ada data log.</p>
      ) : (
        <>
 <div className="max-w-6xl  bg-gray-100 p-4 rounded-lg shadow">       
<table className="w-full border-collapse border text-sm">
  <thead className="bg-gray-200 text-gray-700">
    {/* 🔹 Header utama */}
    <tr>
      <th className="p-2 border text-left w-[50px]">ID</th>
      <th className="p-2 border text-left">Platform</th>
      <th className="p-2 border text-left">Shop ID</th>
      <th className="p-2 border text-left">Order ID</th>
      <th className="p-2 border text-left">Status</th>
      <th className="p-2 border text-left">Stock Effect</th>
      <th className="p-2 border text-left">Dibuat Pada</th>
    </tr>

    {/* 🔹 Header subkolom item */}
    <tr className="bg-white text-gray-600">
      <th></th>
      <th colSpan="6" className="p-2">
        <div className="ml-1 flex items-center text-gray-700">
          <div className="w-[60px] text-left">Gambar</div>
          <div className="w-[100px] text-left">SKU</div>
          <div className="w-[100px] text-left">Varian</div>
          <div className="w-[100px] text-right">Harga</div>
          <div className="w-[60px] text-right">Qty</div>
        </div>
      </th>
    </tr>
  </thead>

  {logs.map((log) => (
    <tbody key={log.id}>
      {/* 🔹 Baris utama log */}
      <tr className="bg-gray-200">
        <td className="p-2 border text-center w-[50px]">{log.id}</td>
        <td className="p-2 border">{log.platform}</td>
        <td className="p-2 border">{log.shop_id}</td>
        <td className="p-2 border">{log.order_id}</td>
        <td className="p-2 border">{log.status}</td>
        <td className={`p-2 border ${
                      log.stock_effect === "decrease"
                        ? "text-red-500"
                        : log.stock_effect === "increase"
                        ? "text-green-600"
                        : "text-gray-700"
                    }`}
                  >
                    {`${
                      log.stock_effect === "decrease"
                        ? "MENGURANGI"
                        : log.stock_effect === "increase"
                        ? "MENAMBAH"
                        : "-"
                    }`} </td>

        <td className="p-2 border">
          {(() => {
            const utcDate = new Date(log.created_at.replace(" ", "T") + "Z");
            return utcDate.toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          })()}
        </td>
      </tr>

      {/* 🔹 Daftar item di bawahnya */}
      {log.raw_items?.map((item, idx) => (
        <tr key={idx} className="bg-gray-50">
          <td></td>
          <td colSpan="6" className="p-1">
            <div className="ml-1 flex items-center text-xs">
              <div className="w-[60px]">
                <img
                  src={item.sku_image}
                  alt={item.sku_name}
                  className="w-8 h-8 object-cover rounded"
                />
              </div>
              <div className="w-[100px] truncate">{item.seller_sku}</div>
              <div className="w-[100px] truncate">{item.sku_name}</div>
              <div className="w-[100px] text-right">
                {item.price?.toLocaleString("id-ID")}
              </div>
              <div className="w-[60px] text-right">{item.qty}</div>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  ))}
</table>

</div>



          <div className="flex items-center justify-center mt-4 space-x-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              ⏮ First
            </button>

            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
            >
              Prev
            </button>

            <span className="text-sm">
              Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong> ({totalCount} total data)
            </span>

            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
            >
              Next
            </button>

            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              ⏭ Last
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Menampilkan {logs.length} dari {totalCount} data.
          </p>
        </>
      )}
    </div>
  );
}
