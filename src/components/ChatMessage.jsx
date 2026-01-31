// ChatMessage.jsx
export default function ChatMessage({ message }) {
  return (
    <div className="chat-message">
      {/* KOMENTAR USER */}
      <div className="chat-user-row">
        <span className="chat-user">{message.user}</span>

        {message.assisted && (
          <span className="chat-assisted-badge">
            ✓ di-assist
          </span>
        )}
      </div>

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
