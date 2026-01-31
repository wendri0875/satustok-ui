export default function ChatHeader({ status }) {
  return (
    <div className="chat-header">
      <span>TikTok LIVE Monitor</span>
      <span className={`status ${status}`}>
        {status.toUpperCase()}
      </span>
    </div>
  );
}