const backendUrl = import.meta.env.VITE_BACKEND_URL;
 
export default function ChatMessage({ message }) {
  const handleParse = async () => {
    try {
   
      const res = await fetch(`${backendUrl}/ai/live/parse-comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: message.text,
        }),
      });

      const data = await res.json();
      console.log("PARSE RESULT:", data);

      alert(
        `RAW: ${data.raw}\n\nCODE: ${
          data.productCode || "-"
        }\nINTENT: ${data.intent || "-"}`
      );
    } catch (err) {
      console.error("Parse failed:", err);
      alert("Parse gagal, cek console");
    }
  };

  return (
    <div className="chat-message">
      {/* HEADER KOMENTAR */}
      <div
        className="chat-user-row"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div>
          <span className="chat-user">{message.user}</span>

          {message.assisted && (
            <span className="chat-assisted-badge">
              ✓ di-assist
            </span>
          )}
        </div>

        {/* TOMBOL PARSE */}
        <button
          onClick={handleParse}
          title="Parse comment"
          style={{
            fontSize: 12,
            padding: "2px 6px",
            borderRadius: 6,
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          ⚙️
        </button>
      </div>

      {/* ISI KOMENTAR */}
      <div className="chat-text">
        {message.text}
      </div>

      {/* JAWABAN ASSISTANT */}
      {Array.isArray(message.answers) &&
        message.answers.map((ans, idx) => (
          <div key={idx} className="chat-assistant">
            🤖 {ans.text}
          </div>
        ))}
    </div>
  );
}
