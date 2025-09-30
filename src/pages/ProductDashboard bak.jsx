import { useState } from "react";
import { products as initialProducts } from "../data/products";

export default function ProductDashboard() {
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [products, setProducts] = useState(initialProducts);

  const toggleExpand = (id) => {
    setExpandedProduct(expandedProduct === id ? null : id);
  };

  const handleChange = (productId, modelId, field, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.product_id === productId
          ? {
              ...p,
              models: p.models.map((m) =>
                m.model_id === modelId ? { ...m, [field]: value } : m
              ),
            }
          : p
      )
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Master Product List</h2>

      {products.map((product) => (
        <div
          key={product.product_id}
          className="border rounded-2xl shadow-sm p-4 bg-white"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleExpand(product.product_id)}
          >
            <div className="flex items-center gap-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500">
                  {product.tier_variation.map((tv) => tv.name).join(" × ")}
                </p>
              </div>
            </div>
            <span className="text-orange-600 font-medium">
              {expandedProduct === product.product_id ? "▲ Tutup" : "▼ Buka"}
            </span>
          </div>

          {expandedProduct === product.product_id && (
            <div className="mt-4">
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
                      <td className="p-2 border">{variant.sku}</td>
                      <td className="p-2 border">{variant.name}</td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          value={variant.stock}
                          className="w-20 border rounded px-2"
                          onChange={(e) =>
                            handleChange(
                              product.product_id,
                              variant.model_id,
                              "stock",
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          value={variant.price}
                          className="w-28 border rounded px-2"
                          onChange={(e) =>
                            handleChange(
                              product.product_id,
                              variant.model_id,
                              "price",
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
          )}
        </div>
      ))}
    </div>
  );
}
