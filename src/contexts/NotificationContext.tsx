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
  type: "match" | "handover_request";
  lostItem?: ItemBrief;
  foundItem?: ItemBrief;
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
    loadNotifications();
    window.addEventListener("storage", loadNotifications);
    return () => window.removeEventListener("storage", loadNotifications);
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
