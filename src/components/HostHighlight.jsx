import React, { useState } from "react";

export default function HostHighlight({
  highlightText,
  setHighlightText,
  saveHighlight,
  onClose
}) {
  const [editingHighlight, setEditingHighlight] = useState(false);
  const [savingHighlight, setSavingHighlight] = useState(false);

  const handleSave = async () => {
    setSavingHighlight(true);
    const success = await saveHighlight();
    setSavingHighlight(false);

    if (success) {
      setEditingHighlight(false);
    }
  };

  const formatWA = (text) => {
    if (!text) return "";

    let formatted = text
      .replace(/\*(.*?)\*/g, "<b>$1</b>")
      .replace(/_(.*?)_/g, "<i>$1</i>")
      .replace(/~(.*?)~/g, "<s>$1</s>")
      .replace(/\n/g, "<br/>");

    return formatted;
  };

  return (
    <div
      style={{
        position: "relative",
        padding: "16px",
        paddingTop: "40px",
        background: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginTop: "8px"
      }}
    >
      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "12px",
          background: "#eee",
          borderRadius: "50%",
          width: "26px",
          height: "26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          cursor: "pointer",
          fontSize: "14px"
        }}
      >
        ✕
      </button>

      {!editingHighlight ? (
        <>
          {/* VIEW MODE */}
          <div
            style={{
              lineHeight: "1.6",
              fontSize: "14px",
              minHeight: "80px"
            }}
            dangerouslySetInnerHTML={{
              __html: highlightText
                ? formatWA(highlightText)
                : "<span style='color:#999'>Belum ada highlight</span>"
            }}
          />

          <div style={{ marginTop: "12px" }}>
            <button
              onClick={() => setEditingHighlight(true)}
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Edit
            </button>
          </div>
        </>
      ) : (
        <>
          {/* EDIT MODE */}
          <textarea
            value={highlightText}
            onChange={(e) => setHighlightText(e.target.value)}
            rows={10}
            style={{
              width: "100%",
              minHeight: "220px",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              resize: "vertical",
              fontSize: "14px",
              lineHeight: "1.5",
              boxSizing: "border-box"
            }}
          />

          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
            <button
              onClick={handleSave}
              disabled={savingHighlight}
              style={{
                background: savingHighlight ? "#aaa" : "green",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: savingHighlight ? "not-allowed" : "pointer"
              }}
            >
              {savingHighlight ? "Menyimpan..." : "Save"}
            </button>

            <button
              onClick={() => setEditingHighlight(false)}
              style={{
                background: "#999",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px"
              }}
            >
              Batal
            </button>
          </div>
        </>
      )}
    </div>
  );
}
