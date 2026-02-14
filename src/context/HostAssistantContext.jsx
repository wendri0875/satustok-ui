import { createContext, useContext, useState, useRef } from "react";

const HostAssistantContext = createContext();

export function HostAssistantProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("offline");
  const [hostId, setHostId] = useState("alhayya_gamis");

  const wsRef = useRef(null);

  return (
    <HostAssistantContext.Provider
      value={{
        messages,
        setMessages,
        status,
        setStatus,
        hostId,
        setHostId,
        wsRef
      }}
    >
      {children}
    </HostAssistantContext.Provider>
  );
}

export function useHostAssistant() {
  return useContext(HostAssistantContext);
}
