export default function ProductCard({ product }) {
  const price =
    Number(product.price || product.sale_price || product.current_price || 0);
  const stock =
    product.stock ?? product.available_stock ?? product.total_available_stock ?? 0;

  const platform = product.platform?.toLowerCase();

  return (
    <div className="border rounded-2xl shadow-sm bg-white overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Gambar produk */}
      <div className="relative w-full aspect-square bg-gray-50">
        <img
          src={product.image || product.thumbnail_url || "/no-image.png"}
          alt={product.name}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Detail produk */}
      <div className="p-3 flex flex-col h-full">
        <h3
          className="font-semibold text-sm leading-tight line-clamp-2 mb-2"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Harga & stok */}
        <div className="text-xs text-gray-600 mb-2">
          <p className="font-medium text-gray-800">
            Rp {price.toLocaleString("id-ID")}
          </p>
          <p
            className={`${
              stock < 5 ? "text-red-500 font-semibold" : "text-gray-600"
            }`}
          >
            Stok: {stock}
          </p>
        </div>

        {/* Label platform */}
        {platform && (
          <div
            className={`mt-auto inline-block px-2 py-1 text-[10px] font-semibold rounded-full text-white ${
              platform === "shopee"
                ? "bg-orange-500"
                : platform === "tiktok"
                ? "bg-black"
                : "bg-gray-400"
            }`}
          >
            {platform.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
