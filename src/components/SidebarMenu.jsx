import { Link, useLocation } from "react-router-dom";

export default function SidebarMenu() {
  const location = useLocation();

  const menuItems = [
    {
      title: "📦 Master Data",
      subItems: [
        { name: "Master Product List", path: "/master-product" },
        { name: "Mapping Produk (Master ↔ Client SKU)", path: "/mapping-produk" },
      ],
    },
    {
      title: "🏬 Store Management",
      subItems: [
        { name: "Daftar Toko", path: "/store-list" },
      ],
    },
    {
      title: "📊 Inventory",
      subItems: [
        { name: "Sinkronisasi Stok Manual", path: "/sync-stock" },
        { name: "Riwayat Perubahan Stok", path: "/stock-history" },
        { name: "Status Update (log sukses/gagal)", path: "/status-update" },
      ],
    },
    {
      title: "🛒 Orders",
      subItems: [
        { name: "Order dari Semua Toko", path: "/all-orders" },
        { name: "Order Status Sync", path: "/order-sync" },
      ],
    },
    {
      title: "⚙️ Settings",
      subItems: [
        { name: "User Management", path: "/user-management" },
        { name: "API Keys & Integrasi", path: "/api-integration" },
        { name: "Notifikasi (WA/Email kalau stok error)", path: "/notifications" },
      ],
    },
  ];

  return (
    <nav className="p-4 space-y-4">
      {menuItems.map((item, idx) => (
        <div key={idx}>
          <div className="font-bold py-2 text-gray-700">{item.title}</div>
          <div className="pl-4 space-y-1">
            {item.subItems.map((sub, sidx) => {
              const isActive = location.pathname === sub.path;
              return (
                <Link
                  key={sidx}
                  to={sub.path}
                  className={`block py-1 px-2 rounded cursor-pointer transition ${
                    isActive
                      ? "bg-[#EE4D2D] text-white font-semibold"
                      : "hover:bg-orange-100 hover:text-[#EE4D2D]"
                  }`}
                >
                  {sub.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
