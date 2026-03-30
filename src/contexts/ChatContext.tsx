import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { api } from "@/utils/api";
import { toast } from "sonner";

interface ChatContextValue {
  socket: Socket | null;
  unreadMessagesCount: number;
  refreshUnreadCount: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Initialize Socket
  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem("token");
    const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:5001", {
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket Connection Error:", err.message);
    });

    // Listen for new messages globally for badge updates
    newSocket.on("new_message", (msg) => {
      // Only show notification if we are NOT the sender
      // Only show notification if we are NOT the sender
      if (msg.sender !== user?._id) {
        const currentPath = window.location.pathname;
        const isInThisChat = currentPath === `/chat/${msg.conversationId}`;
        
        if (!isInThisChat) {
          setUnreadMessagesCount(prev => prev + 1);
        }
        
        // Show toast ONLY if we're not currently on the chats page AND not in this specific chat
        if (currentPath !== "/chats" && !isInThisChat) {
          toast("New message received!", {
            description: msg.text.substring(0, 30) + (msg.text.length > 30 ? "..." : ""),
            action: {
              label: "View",
              onClick: () => window.location.href = `/chat/${msg.conversationId}`
            }
          });
        }
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  const refreshUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get("/chat");
      const chats = res.data;
      // Simple logic: count conversations with unread messages for this user
      // (In a real app, backend would provide a specific totalUnread count)
      setUnreadMessagesCount(chats.reduce((acc: number, c: any) => acc + (c.unreadCount?.[user?._id || ""] || 0), 0));
    } catch (err) {
      console.error("Failed to refresh unread count", err);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [isAuthenticated]);

  return (
    <ChatContext.Provider value={{ socket, unreadMessagesCount, refreshUnreadCount }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};
