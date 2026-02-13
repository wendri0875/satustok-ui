// ChatContainer.jsx
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import "./chat.css";

export default function ChatContainer({ messages, fetchProducts, onSelectProduct }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          fetchProducts={fetchProducts}
          onSelectProduct={onSelectProduct}
        />
      ))}
      <div ref={bottomRef} />

      
    </div>

    
  );
}
