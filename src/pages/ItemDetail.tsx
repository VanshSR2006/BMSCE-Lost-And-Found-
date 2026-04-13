import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Share2,
  Flag,
  PackageCheck,
  ShieldCheck,
  User,
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

const CATEGORY_ICONS: Record<string, string> = {
  wallet: "account_balance_wallet",
  "id-card": "badge",
  bottle: "water_drop",
  stationery: "edit",
  electronics: "devices",
  other: "inventory_2",
};

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { notifications } = useNotifications();

  const hasMatchForThisItem = notifications.some(
    (n) => n.type === "match" && (n.foundItem?._id === id || n.lostItem?._id === id)
  );

  const matchNotification = notifications.find(n => 
    (n.foundItem?._id === id || n.lostItem?._id === id) && n.type === "match"
  );

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [userLostItems, setUserLostItems] = useState<any[]>([]);
  const [selectedLostItem, setSelectedLostItem] = useState<string>("");
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

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
    
    const fetchUserLostItems = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('/items/mine');
        setUserLostItems(res.data.filter((i: any) => i.type === 'lost'));
      } catch (err) {
        console.error(err);
      }
    };

    fetchItem();
    fetchUserLostItems();
  }, [id, isAuthenticated]);

  const hasCategoryMatch = userLostItems.some((i: any) => i.category === item?.category);
  const isLateReport = item && userLostItems.some(
    i => i.category === item.category && new Date(i.createdAt) > new Date(item.createdAt)
  );

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

  const handleReport = () => {
    toast.success("Item reported. Admin will review.");
  };

  const handleClaim = async () => {
    // If it's a FOUND item and we don't have a system match yet, trigger the manual request flow
    // Using matchNotification from component scope

    if (item.type === "found" && !matchNotification) {
      handleRequestHandover();
      return;
    }

    // If we have a match notification with a direct chat link, go there
    if (matchNotification?.conversationId) {
      navigate(`/chat/${matchNotification.conversationId}`);
      return;
    }

    try {
      if (item.type === "found") {
        // Correct ownership check (comparing strings)
        const itemOwnerId = item.createdBy?._id || item.createdBy;
        if (itemOwnerId.toString() !== user?._id) {
           handleRequestHandover();
           return;
        }
        await api.delete(`/items/${item._id}`);
      } else {
        // Owner closing their own lost post
        await api.put(`/items/${item._id}/claim`);
      }
      
      toast.success(
        item.type === "lost" 
          ? "Inventory marked as reclaimed!" 
          : "Found report terminated and secured."
      );
      setShowClaimDialog(false);
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to process request");
    }
  };

  const handleRequestHandover = async () => {
    if (!selectedLostItem || !challengeAnswer) {
      toast.error("Please fill in all verification fields.");
      return;
    }

    setIsSubmittingClaim(true);
    try {
      await api.post(`/items/${item._id}/request-handover`, {
        challengeResponse: challengeAnswer,
        lostItemId: selectedLostItem
      });
      toast.success("Identity verification sent to the founder!");
      setShowClaimDialog(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#16052a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4af8e3]"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#16052a] flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold text-white mb-6 font-['Plus_Jakarta_Sans']">Anomaly Not Located</h1>
          <p className="text-purple-200/50 mb-8">The requested item signature does not exist in the neural net.</p>
          <Button 
            onClick={() => navigate("/")}
            className="bg-[#6200EE] hover:bg-[#6200EE]/80 text-white rounded-xl px-8 h-12"
          >
            Return to Base
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#16052a] flex flex-col font-['Inter'] selection:bg-[#4af8e3]/30 selection:text-[#4af8e3]">
      <Navbar />

      <main className="flex-1 pt-24 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-purple-200/40 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Directory
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* LEFT: IMAGE SECTION */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6200EE] to-[#4af8e3] rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-[2rem] overflow-hidden bg-[#240e3b] border border-white/10 shadow-2xl">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <span className={`material-symbols-outlined text-8xl opacity-10 ${item.type === 'lost' ? 'text-[#ff2e97]' : 'text-[#4af8e3]'}`}
                      style={{fontVariationSettings: "'FILL' 1"}}>
                      {CATEGORY_ICONS[item.category] || "inventory_2"}
                    </span>
                    <span className="text-white/20 text-xs uppercase tracking-[0.3em] font-black">Null Visual Evidence</span>
                  </div>
                )}
                
                {/* STATUS OVERLAY */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className={`px-4 py-2 rounded-full backdrop-blur-md border font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl ${item.type === "lost" ? "bg-[#ff2e97]/20 border-[#ff2e97]/40 text-[#ff2e97]" : "bg-[#4af8e3]/20 border-[#4af8e3]/40 text-[#4af8e3]"}`}>
                    <span className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full animate-pulse ${item.type === 'lost' ? 'bg-[#ff2e97]' : 'bg-[#4af8e3]'}`}></span>
                       {item.type} Object
                    </span>
                  </div>

                  {isLateReport && item.type === "found" && (
                    <div className="bg-amber-500/20 border border-amber-500/40 text-amber-500 px-4 py-2 rounded-full backdrop-blur-md font-black text-[9px] uppercase tracking-[0.2em] animate-pulse">
                      ⚡ Potential Sync Delay
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: CONTENT SECTION */}
            <div className="flex flex-col h-full space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight mb-4">{item.title}</h1>
                <p className="text-xl text-purple-100/60 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-1">
                    <MapPin className="h-4 w-4 text-[#4af8e3]" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#4af8e3]">Location</span>
                  </div>
                  <p className="text-white font-bold">{item.location}</p>
                </div>

                <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-1">
                    <Calendar className="h-4 w-4 text-[#ff2e97]" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#ff2e97]">Chronology</span>
                  </div>
                  <p className="text-white font-bold">{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</p>
                </div>

                <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-1">
                    <PackageCheck className="h-4 w-4 text-purple-400" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-purple-400">Classification</span>
                  </div>
                  <p className="text-white font-bold capitalize">{item.category}</p>
                </div>

                <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-1">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">Reported By</span>
                  </div>
                  <p className="text-white font-bold truncate">{item.createdBy?.name || "Verified Campus User"}</p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-14 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold tracking-wide"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5 mr-3 text-[#4af8e3]" />
                    Broadcast
                  </Button>

                  <Button 
                    variant="outline" 
                    className="flex-1 h-14 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold tracking-wide"
                    onClick={handleReport}
                  >
                    <Flag className="h-5 w-5 mr-3 text-[#ff2e97]" />
                    Flag Anomaly
                  </Button>
                </div>

                {/* DYNAMIC CASE-BY-CASE ACTIONS */}
                {isAuthenticated && user?._id === (item?.createdBy?._id || item?.createdBy) && (
                  <Button 
                    className="w-full h-16 bg-gradient-to-r from-rose-500 to-[#ff2e97] text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-900/20 active:scale-95 transition-all"
                    onClick={() => setShowClaimDialog(true)}
                  >
                    Terminate Protocol (Object Secured)
                  </Button>
                )}

                {isAuthenticated && item.type === "found" && user?._id !== (item?.createdBy?._id || item?.createdBy) && (
                  <Button 
                    disabled={item.status === "returned"}
                    className="w-full h-16 bg-gradient-to-r from-[#6200EE] to-[#4af8e3] text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    onClick={() => setShowClaimDialog(true)}
                  >
                    {hasMatchForThisItem && matchNotification?.conversationId ? (
                      <>
                        <ShieldCheck className="h-6 w-6" />
                        Enter Communication Port
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-6 w-6" />
                        Request Secure Connection
                      </>
                    )}
                  </Button>
                )}
                
                {!isAuthenticated && (
                  <div className="bg-white/5 border border-white/5 p-6 rounded-2xl text-center">
                    <p className="text-purple-200/50 text-sm mb-4 font-medium italic">Secure authentication required to interact with this object.</p>
                    <Button 
                      className="bg-white text-black font-bold h-12 px-8 rounded-xl hover:bg-white/90"
                      onClick={() => navigate('/auth')}
                    >
                      Authenticate to Claim
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* ALERT DIALOG - STYLED */}
      <AlertDialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <AlertDialogContent className="bg-[#16052a] text-white border-white/10 rounded-[2rem] p-10 max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">
              {item.type === "lost" ? "Reclaim Object?" : "Request Secure Link?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-purple-100/40 py-4 leading-relaxed">
              {item.type === "lost"
                ? "Permanently remove this signature from the neural network. Use only if item is back in your possession."
                : (hasMatchForThisItem 
                    ? "Our system detected a high-probability match. Click below to initiate the handover protocol." 
                    : "To prevent fraud, you must provide a unique detail only you would know (e.g., specific damage or hidden features).")}
            </AlertDialogDescription>

            {item.type === "found" && !hasMatchForThisItem && (
              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <Label className="text-[#4af8e3] text-xs font-black uppercase tracking-widest">Select Your Lost Post</Label>
                  <Select value={selectedLostItem} onValueChange={setSelectedLostItem}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-12">
                      <SelectValue placeholder="Which of your items is this?" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#240e3b] border-white/10 text-white">
                      {userLostItems.map((i: any) => (
                        <SelectItem key={i._id} value={i._id}>{i.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[#4af8e3] text-xs font-black uppercase tracking-widest">Verification Challenge</Label>
                  <Textarea
                    className="bg-white/5 border-white/10 text-purple-50 rounded-xl min-h-[100px]"
                    placeholder="Describe a detail not mentioned in the public listing (e.g., 'Wallpaper is my dog', 'Scratch on the left side')."
                    value={challengeAnswer}
                    onChange={(e) => setChallengeAnswer(e.target.value)}
                  />
                </div>
              </div>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-4 pt-6">
            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/10 text-white rounded-xl h-12 px-8 flex-1">
              Abort
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleClaim();
              }}
              disabled={isSubmittingClaim || (item.type === "found" && !hasMatchForThisItem && (!selectedLostItem || !challengeAnswer))}
              className={`rounded-xl h-12 px-8 flex-1 font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${item.type === "lost" ? "bg-[#ff2e97] text-white" : "bg-[#4af8e3] text-[#16052a]"}`}
            >
              {isSubmittingClaim ? "Encrypting..." : "Transmit Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemDetail;
