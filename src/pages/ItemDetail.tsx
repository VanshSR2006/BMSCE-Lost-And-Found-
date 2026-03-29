import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
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
  const { notifications } = useNotifications();

  // Only show handover button if this user has a match notification pointing to this found item
  const hasMatchForThisItem = notifications.some(
    (n) => n.type === "match" && n.foundItem?._id === id
  );

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
  // CLAIM ITEM / REQUEST HANDOVER
  // -------------------------
  const handleClaim = async () => {
    try {
      await api.put(`/items/${item._id}/claim`);
      toast.success(
        item.type === "lost" 
          ? "Item marked as claimed!" 
          : "Handover request sent to Admins!"
      );
      setShowClaimDialog(false);
      
      if(item.type === "lost") {
        navigate("/my-posts");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to process request");
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
              user?._id === item?.createdBy &&
              item.type === "lost" && (
                <Button className="w-full mt-6 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all" onClick={() => setShowClaimDialog(true)}>
                  Mark as Claimed
                </Button>
              )}

            {/* REQUEST HANDOVER BUTTON — only the matched user, never admins */}
            {isAuthenticated &&
              item.type === "found" &&
              user?.role !== "admin" &&
              hasMatchForThisItem && (
                <Button className="w-full mt-6 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-white shadow-[0_0_15px_rgba(45,212,191,0.4)] font-bold transition-all" onClick={() => setShowClaimDialog(true)}>
                  Request Secure Handover
                </Button>
              )}
          </div>
        </div>
      </main>

      <Footer />

      {/* CLAIM CONFIRMATION POPUP */}
      <AlertDialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <AlertDialogContent className="bg-[#16052a] text-white border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {item.type === "lost" ? "Mark as Claimed?" : "Request Secure Handover?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-purple-200/70">
              {item.type === "lost"
                ? "Once claimed, this item will be removed from public listings."
                : "This will notify Campus Security Admins to arrange a secure physical handover."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClaim}
              className={item.type === "lost" ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-emerald-500 text-white hover:bg-emerald-600"}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemDetail;
