// ChatContainer.jsx
import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import "./chat.css";

export default function ChatContainer({ messages, fetchProducts, onSelectProduct,onAddAnswer }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Detect user scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 100; // jarak toleransi px
      const isBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        threshold;

      setIsAtBottom(isBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto scroll hanya jika memang sedang di bawah
  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  return (
    <div className="chat-container" ref={containerRef}>
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          fetchProducts={fetchProducts}
          onSelectProduct={onSelectProduct}
           onAddAnswer={onAddAnswer}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

