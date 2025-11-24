import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Item, mockItems } from "@/lib/mockData";

interface ItemsContextType {
  items: Item[];
  addItem: (item: Omit<Item, "id" | "createdAt" | "updatedAt" | "status">) => void;
  deleteItem: (id: string) => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Item[]>(() => {
    const stored = localStorage.getItem("lostFoundItems");
    if (stored) {
      return JSON.parse(stored);
    }
    // Seed with demo items on first load
    localStorage.setItem("lostFoundItems", JSON.stringify(mockItems));
    return mockItems;
  });

  useEffect(() => {
    localStorage.setItem("lostFoundItems", JSON.stringify(items));
  }, [items]);

  const addItem = (itemData: Omit<Item, "id" | "createdAt" | "updatedAt" | "status">) => {
    const now = Date.now();
    const newItem: Item = {
      ...itemData,
      id: now.toString(),
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ItemsContext.Provider value={{ items, addItem, deleteItem }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error("useItems must be used within ItemsProvider");
  }
  return context;
};
