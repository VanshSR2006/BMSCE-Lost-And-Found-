import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/utils/api";

export interface ItemBrief {
  _id: string;
  title: string;
  description?: string;
  category: string;
  location: string;
}

export interface Notification {
  _id: string;
  message: string;
  createdAt: string;
  type: "match" | "claim_request" | "system" | "handover_request";
  lostItem?: ItemBrief;
  foundItem?: ItemBrief;
  challengeResponse?: string;
  requesterLostItem?: ItemBrief;
  conversationId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  clearNotification: (id: string) => Promise<void>;
  reloadNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    }
  };

  const clearNotification = async (id: string) => {
    await api.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  useEffect(() => {
    // Only fetch if there's an active session — avoids a 401 on every guest page load
    const token = localStorage.getItem("token");
    if (token) loadNotifications();

    // Reload when auth state changes (login / logout dispatches a storage event)
    const handleStorage = () => {
      const t = localStorage.getItem("token");
      if (t) {
        loadNotifications();
      } else {
        setNotifications([]);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, clearNotification, reloadNotifications: loadNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside provider");
  return ctx;
};
