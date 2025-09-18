// src/components/Header.jsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import logo from "/images/favicon.png"; // path ke file logo
import { Link } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between items-center p-4 bg-blue-600 text-white">
      <Link to="/" className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-bold">Satu Stok</span>
        </Link>

      {user && (
        <div className="relative" ref={menuRef}>
          {/* Avatar */}
          <button
            onClick={() => setOpen(!open)}
            className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold"
          >
            {user.name[0].toUpperCase()}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-50">
              <div className="px-4 py-2 border-b">{user.name}</div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
