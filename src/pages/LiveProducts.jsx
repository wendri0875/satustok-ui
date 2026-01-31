import { useState,useRef, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function LiveProductSatustok() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.token) return;
  }, [user]);

  const [products, setProducts] = useState([
    { code: "GA.64", desc: "Gamis Zahra – Adem & lembut", photo: null },
    { code: "GA.77", desc: "Busui Friendly – Jatuh", photo: null },
  ]);

  const excelRef = useRef();

  const handlePhotoChange = (index, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const updated = [...products];
    updated[index].photo = url;
    setProducts(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold text-center mb-4">Live Product – Satustok</h2>

        {/* Upload Excel */}
        <div className="mb-4">
          <button
            onClick={() => excelRef.current.click()}
            className="w-full bg-black text-white py-2 rounded-xl text-sm"
          >
            Upload Excel Produk
          </button>
          <input ref={excelRef} type="file" accept=".xls,.xlsx" hidden />
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {products.map((p, i) => (
            <div
              key={p.code}
              className="flex items-center gap-3 border rounded-xl p-3"
            >
              <label className="w-20 h-20 border-2 border-dashed rounded-xl flex items-center justify-center text-xs text-gray-500 cursor-pointer overflow-hidden">
                {p.photo ? (
                  <img src={p.photo} className="w-full h-full object-cover" />
                ) : (
                  "+ Foto"
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={(e) => handlePhotoChange(i, e.target.files[0])}
                />
              </label>

              <div className="flex-1">
                <div className="font-semibold text-sm">Kode: {p.code}</div>
                <div className="text-xs text-gray-600">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
