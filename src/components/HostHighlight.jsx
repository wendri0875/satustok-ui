import React, { useState } from "react";

export default function HostHighlight({
  hostId,
  highlightText,
  setHighlightText,
  saveHighlight,
  loadingHighlight = false,
  onClose
}) {
  const [savingHighlight, setSavingHighlight] = useState(false);

  const handleSave = async () => {
    setSavingHighlight(true);
    await saveHighlight();
    setSavingHighlight(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "640px",
          height: "min(85vh, 680px)",
          background: "linear-gradient(180deg, #fffaf5 0%, #fff7ed 100%)",
          border: "1px solid #fed7aa",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 18px 45px rgba(249, 115, 22, 0.14)"
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "#fff7ed",
            borderRadius: "50%",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #fdba74",
            cursor: "pointer",
            fontSize: "14px",
            color: "#9a3412",
            zIndex: 2
          }}
        >
          ✕
        </button>

        <div
          style={{
            margin: "16px 16px 12px",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "#ffedd5",
            border: "1px solid #fdba74",
            borderLeft: "4px solid #f97316",
            color: "#9a3412",
            fontSize: "16px",
            fontWeight: 800,
            letterSpacing: "0.2px",
            paddingRight: "44px"
          }}
        >
          {`Data Umum Toko ${hostId || "-"}`}
        </div>

        <div
          style={{
            padding: "0 16px 16px",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <textarea
            value={highlightText}
            onChange={(e) => setHighlightText(e.target.value)}
            placeholder={loadingHighlight ? "Memuat data umum toko..." : "Tulis data umum toko di sini..."}
            disabled={loadingHighlight}
            style={{
              width: "100%",
              flex: 1,
              minHeight: 0,
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #fdba74",
              resize: "none",
              fontSize: "14px",
              lineHeight: "1.6",
              boxSizing: "border-box",
              background: loadingHighlight ? "#fffaf5" : "#fff",
              color: "#431407"
            }}
          />
        </div>

        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #fed7aa",
            background: "#fffaf5",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            boxShadow: "0 -8px 20px rgba(249, 115, 22, 0.08)"
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#e5e7eb",
              color: "#374151",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Tutup
          </button>

          <button
            onClick={handleSave}
            disabled={savingHighlight || loadingHighlight}
            style={{
              background: savingHighlight ? "#fcd34d" : "#f59e0b",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: savingHighlight || loadingHighlight ? "not-allowed" : "pointer",
              opacity: loadingHighlight ? 0.7 : 1,
              fontWeight: 700
            }}
          >
            {loadingHighlight ? "Memuat..." : savingHighlight ? "Menyimpan..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
