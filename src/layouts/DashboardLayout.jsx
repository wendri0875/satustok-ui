import Header from "../components/Header";
import SidebarMenu from "../components/SidebarMenu";

export default function DashboardLayout({ children, activeMenu }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header full-width */}
      <Header />

      {/* Body: sidebar + konten */}
      <div className="flex flex-1 bg-gray-50">
        <aside className="w-64 bg-gray-100 border-r border-gray-300">
          <SidebarMenu activeMenu={activeMenu} />
        </aside>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
