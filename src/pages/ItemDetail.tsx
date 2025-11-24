import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Share2,
  Flag,
  PackageCheck,
} from "lucide-react";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { api } from "@/utils/api";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // -------------------------
  // SHARE
  // -------------------------
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  // -------------------------
  // REPORT
  // -------------------------
  const handleReport = () => {
    toast.success("Item reported. Admin will review.");
  };

  // -------------------------
  // CLAIM ITEM (ONLY OWNER)
  // -------------------------
  const handleClaim = async () => {
    try {
      await api.put(`/items/${item._id}/claim`); // Backend should delete / archive the item
      toast.success("Item marked as claimed!");
      setShowClaimDialog(false);
      navigate("/my-posts");
    } catch (err) {
      toast.error("You are not allowed to claim this");
    }
  };

  // -------------------------
  // LOADING / ERROR SCREENS
  // -------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-xl">
        Loading item...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </main>
        <Footer />
      </div>
    );
  }

  // -------------------------
  // RENDER PAGE UI
  // -------------------------
  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-10">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* IMAGE */}
          <div className="rounded-xl shadow-xl overflow-hidden bg-muted">
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* DETAILS */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-3">{item.title}</h1>
              <Badge
                variant={item.type === "lost" ? "destructive" : "default"}
                className="text-sm px-3 py-1"
              >
                {item.type === "lost" ? "🔴 Lost" : "🟢 Found"}
              </Badge>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {item.description}
            </p>

            <Card className="border rounded-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-muted-foreground">{item.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">
                      {item.type === "lost" ? "Lost On" : "Found On"}
                    </p>
                    <p className="text-muted-foreground">{item.date}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PackageCheck className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Category</p>
                    <p className="text-muted-foreground">{item.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SHARE + REPORT */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button variant="outline" className="flex-1" onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>

            {/* CLAIM BUTTON (ONLY OWNER OF LOST ITEM) */}
            {isAuthenticated &&
              user?._id===item?.createdby &&
              item.type === "lost" && (
                <Button className="w-full mt-6" onClick={() => setShowClaimDialog(true)}>
                  Mark as Claimed
                </Button>
              )}
          </div>
        </div>
      </main>

      <Footer />

      {/* CLAIM CONFIRMATION POPUP */}
      <AlertDialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Claimed?</AlertDialogTitle>
            <AlertDialogDescription>
              Once claimed, this item will be removed from public listings.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClaim}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemDetail;
