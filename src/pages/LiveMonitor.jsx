import { useEffect, useState } from "react";
import ChatContainer from "../components/ChatContainer";
import ChatHeader from "../components/ChatHeader";
import { getLiveStatus } from "../services/liveApi";
import { useAuth } from "../auth/AuthProvider";
  

export default function LiveMonitor() {
  const [status, setStatus] = useState("offline");
  const [messages] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const interval = setInterval(async () => {
      const s = await getLiveStatus(user.token);
      setStatus(s.status);

      /*if (s.status === "online") {
        const comments = await getLiveComments();
        setMessages(comments);
      }*/
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chat-page">
      <ChatHeader status={status} />
      <ChatContainer messages={messages} />
    </div>
  );
}
