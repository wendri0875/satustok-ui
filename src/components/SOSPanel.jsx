import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function SOSPanel({
  message,
  backendUrl,
  hasProduct,
  onClose,
  onSaved
}) {
  const { user } = useAuth();

  const [sosText, setSosText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveAsGeneral, setSaveAsGeneral] = useState(false);
  const [intent, setIntent] = useState("");

  useEffect(() => {
    if (!hasProduct) {
      setSaveAsGeneral(true);
    }
  }, [hasProduct]);

  const handleSave = async () => {
    if (!sosText.trim()) return;

    try {
      setSaving(true);

      const res = await fetch(`${backendUrl}/ai/sos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          hostId: message.hostId,
          productId: message.lastProductId,
          question: message.text,
          answer: sosText,
          intent,
          type: hasProduct
            ? saveAsGeneral
              ? "general"
              : "product"
            : "general"
        })
      });

      if (!res.ok) throw new Error("Gagal save");

      onSaved(sosText);
      onClose();

    } catch (err) {
      console.error("SOS ERROR", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 8,
        padding: 10,
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fafafa"
      }}
    >
      {/* INPUT TOPIK */}
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
          🏷️ Topik
        </label>
        <input
          type="text"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="Contoh: ukuran, ongkir, bahan, warna..."
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 6,
            border: "1px solid #d9d9d9"
          }}
        />
      </div>

      <textarea
        value={sosText}
        onChange={(e) => setSosText(e.target.value)}
        rows={4}
        placeholder="Tulis jawaban terbaik versi host..."
        style={{
          width: "100%",
          padding: "6px 8px",
          marginBottom: 8,
          border: "1px solid #d9d9d9"
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

        <label style={{ fontSize: 13, display: "flex", gap: 6 }}>
          <input
            type="checkbox"
            disabled={!hasProduct}
            checked={saveAsGeneral}
            onChange={(e) => setSaveAsGeneral(e.target.checked)}
          />
          Jadikan jawaban umum (tidak spesifik produk)
        </label>

        {!hasProduct && (
          <div style={{ fontSize: 11, color: "#888" }}>
            Tidak ada produk terpilih → otomatis disimpan sebagai jawaban umum
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d9d9d9",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            💾 Simpan
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #d9d9d9",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            ❌ Batal
          </button>
        </div>
      </div>
    </div>
  );
}