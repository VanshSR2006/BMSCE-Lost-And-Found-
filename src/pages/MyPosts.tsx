import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import { api } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MyPosts = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user-owned posts
  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await api.get("/items/mine", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setItems(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Error loading your posts");
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  // Handle item deletion (after claim)
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/items/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setItems(items.filter((item) => item._id !== id));
      toast.success("Item removed successfully");
    } catch (err) {
      toast.error("Unable to remove item");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-12 flex-1">
        <h1 className="text-3xl font-bold mb-6">My Posts</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">
            You haven't posted anything yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item._id}>
                <ItemCard
                  id={item._id}
                  title={item.title}
                  description={item.description}
                  category={item.category || "Other"}
                  location={item.location}
                  date={item.date}
                  type={item.type}
                  imageUrl={item.image}
                />

                {/* Delete / Claim Button */}
                <Button
                  variant="destructive"
                  className="w-full mt-3"
                  onClick={() => handleDelete(item._id)}
                >
                  Remove / Mark as Claimed
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyPosts;
