export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  type: "lost" | "found";
  imageUrl?: string;
  userEmail: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  status?: "active" | "claimed";
  createdAt?: number;
  updatedAt?: number;
}

export const mockItems: Item[] = [
  {
    id: "1",
    title: "Black Leather Wallet",
    description: "Black leather wallet with ID cards and some cash. Lost near the library.",
    category: "Wallet",
    location: "Library - 2nd Floor",
    date: "2024-01-15",
    type: "lost",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop",
    userEmail: "student@bmsce.ac.in"
  },
  {
    id: "2",
    title: "Blue Water Bottle",
    description: "Cello brand blue water bottle found in the cafeteria.",
    category: "Water Bottle",
    location: "Cafeteria",
    date: "2024-01-16",
    type: "found",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop",
    userEmail: "student2@bmsce.ac.in"
  },
  {
    id: "3",
    title: "HP Laptop Charger",
    description: "HP laptop charger 65W. Lost in Computer Lab B.",
    category: "Electronics",
    location: "Computer Lab B",
    date: "2024-01-14",
    type: "lost",
    imageUrl: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop",
    userEmail: "student3@bmsce.ac.in"
  },
  {
    id: "4",
    title: "Sports Watch",
    description: "Black Fastrack sports watch found near the basketball court.",
    category: "Watch",
    location: "Basketball Court",
    date: "2024-01-17",
    type: "found",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    userEmail: "student4@bmsce.ac.in"
  },
  {
    id: "5",
    title: "Textbook - Engineering Mathematics",
    description: "Engineering Mathematics 3rd edition textbook with name written inside.",
    category: "Books",
    location: "Classroom 301",
    date: "2024-01-13",
    type: "lost",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
    userEmail: "student5@bmsce.ac.in"
  },
  {
    id: "6",
    title: "Set of Keys",
    description: "Set of keys with a blue keychain found in the parking lot.",
    category: "Keys",
    location: "Main Parking Lot",
    date: "2024-01-18",
    type: "found",
    imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&h=300&fit=crop",
    userEmail: "student6@bmsce.ac.in"
  }
];
