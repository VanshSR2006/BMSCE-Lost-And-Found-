import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Package, CheckCheck, MapPin, Tag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import HandoverVerification from "@/components/HandoverVerification";

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, clearNotification } = useNotifications();
  const { user } = useAuth();

  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleAction = async (n: any) => {
    // 1. If direct conversation link exists (Safe Match)
    if (n.conversationId) {
      clearNotification(n._id);
      navigate(`/chat/${n.conversationId}`);
      return;
    }

    // 2. If it's a match that needs verification (Anomaly) or a manual claim
    if (n.type === "match" || n.type === "claim_request") {
      setSelectedNotification(n);
      setIsVerifying(true);
      return;
    }

    // 3. Fallback/Legacy (Hide admin path)
    if (n.type === "handover_request") {
      toast.info("This request is now handled directly by the founder.");
      clearNotification(n._id);
    }
  };

  const handleApprove = async (notificationId: string) => {
    try {
      const res = await api.post("/chat/initiate", { notificationId });
      clearNotification(notificationId);
      setIsVerifying(false);
      navigate(`/chat/${res.data._id}`);
      toast.success("Security coordinates sent. Chat link active.");
    } catch {
      toast.error("Failed to authorize link.");
    }
  };

  return (
    <div className="min-h-screen bg-[#16052a] pt-24 pb-32 px-4">
      <main className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-white font-['Plus_Jakarta_Sans'] tracking-tight mb-2">Neural Alerts</h1>
          <p className="text-purple-200/50">Sector notifications and match reports.</p>
        </header>

        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((n, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={n._id}
              >
                <Card className="bg-[#240e3b]/60 backdrop-blur-2xl border-white/5 hover:border-white/10 transition-all overflow-hidden group">
                  <CardContent className="p-6 relative">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#b89fff]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#b89fff]/10 transition-colors pointer-events-none" />

                    <div className="flex gap-5 relative z-10">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${n.type === "match" ? "bg-[#4af8e3]/10 border border-[#4af8e3]/20 text-[#4af8e3]" :
                            n.type === "claim_request" ? "bg-[#ff2e97]/10 border border-[#ff2e97]/20 text-[#ff2e97]" :
                              "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                          }`}>
                          {n.type === "claim_request" ? <CheckCheck className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                              {n.type === "match" ? "Match Detected" : n.type === "claim_request" ? "Handover Request" : "System Notification"}
                              <Badge className="bg-white/10 text-purple-200 hover:bg-white/10 border-none text-[10px] uppercase font-black tracking-widest">New</Badge>
                            </h3>
                          </div>
                          <span className="text-[10px] text-purple-200/30 uppercase font-black tracking-widest">Recent</span>
                        </div>

                        <p className="text-purple-100 text-sm leading-relaxed mb-4">
                          {n.message}
                        </p>

                        {(n.lostItem || n.foundItem) && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {n.lostItem && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[11px] text-purple-200/60 uppercase font-black tracking-tight">
                                <Tag size={12} className="text-[#6200EE]" /> {n.lostItem.title}
                              </div>
                            )}
                            {n.foundItem && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[11px] text-purple-200/60 uppercase font-black tracking-tight">
                                <MapPin size={12} className="text-[#ff2e97]" /> {n.foundItem.location}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button
                            className={`flex-1 h-11 rounded-xl font-bold transition-all shadow-lg ${n.type === "match" || n.type === "claim_request"
                                ? "bg-gradient-to-r from-[#6200EE] to-[#ff2e97] text-white hover:shadow-[0_8px_20px_rgba(255,46,151,0.3)]"
                                : "bg-white/10 hover:bg-white/20 text-white"
                              }`}
                            onClick={() => handleAction(n)}
                          >
                            {n.type === "match" ? "Open Secure Link" : n.type === "claim_request" ? "Review Verification" : "View Protocol"}
                          </Button>
                          <Button
                            variant="ghost"
                            className="flex-1 h-11 border border-white/5 hover:bg-red-500/10 text-purple-200/40 hover:text-red-400 rounded-xl font-bold transition-all"
                            onClick={() => clearNotification(n._id)}
                          >
                            Discard
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-[#240e3b]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-20 text-center">
            <Package className="h-16 w-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white mb-2">Sector Clear</h3>
            <p className="text-purple-200/40">No pending anomalies or matches detected.</p>
          </div>
        )}
      </main>

      <HandoverVerification
        isOpen={isVerifying}
        onClose={() => setIsVerifying(false)}
        onApprove={handleApprove}
        notification={selectedNotification}
      />
    </div>
  );
};

export default Notifications;
