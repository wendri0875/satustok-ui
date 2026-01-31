import { useState } from "react";
import Header from "../components/Header";
import SidebarMenu from "../components/SidebarMenu";

export default function DashboardLayout({ children, activeMenu }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex flex-1 bg-gray-50 relative">
        {/* Sidebar Desktop */}
        <aside className="hidden md:block w-64 bg-gray-100 border-r border-gray-300">
          <SidebarMenu activeMenu={activeMenu} />
        </aside>

        {/* Overlay Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Mobile */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-gray-100 border-r border-gray-300 z-50 transform transition-transform md:hidden
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <SidebarMenu
            activeMenu={activeMenu}
            onSelect={() => setSidebarOpen(false)}  // 👈 INI KUNCINYA
          />
        </aside>


        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
