import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { MessageSquare, Clock, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Chats = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { refreshUnreadCount } = useChat();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchConversations = async () => {
      try {
        const res = await api.get("/chat");
        setConversations(res.data);
        refreshUnreadCount();
      } catch (err) {
        toast.error("Failed to load your conversations");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#16052a] pt-24 pb-32 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white font-['Plus_Jakarta_Sans'] tracking-tight">Active Links</h1>
          <p className="text-purple-200/50 mt-1">Communicate with matches to reclaim or return items.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#b89fff]/20 border-t-[#b89fff] rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-[#240e3b]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-12 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Chats</h3>
            <p className="text-purple-200/40 max-w-xs mx-auto">Once a match is verified, you can start a secure link with the other party here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conv, idx) => {
              const otherUser = conv.participants.find((p: any) => p._id !== user._id);
              const unread = conv.unreadCount?.[user._id] || 0;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={conv._id}
                  onClick={() => navigate(`/chat/${conv._id}`)}
                  className="group relative bg-[#240e3b]/60 hover:bg-[#240e3b]/80 backdrop-blur-2xl border border-white/5 hover:border-[#b89fff]/30 rounded-3xl p-5 transition-all cursor-pointer shadow-xl overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#b89fff]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#b89fff]/10 transition-colors pointer-events-none" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6200EE] to-[#ff2e97] p-[2px] shadow-lg">
                      <div className="w-full h-full rounded-2xl bg-[#16052a] flex items-center justify-center font-black text-[#b89fff] text-xl font-['Plus_Jakarta_Sans'] uppercase">
                        {otherUser?.name.charAt(0)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-white font-bold font-['Plus_Jakarta_Sans'] truncate pr-4">
                          {otherUser?.name}
                        </h3>
                        {conv.lastMessage?.createdAt && (
                          <div className="flex items-center gap-1 text-[10px] text-purple-200/40 uppercase font-black tracking-widest whitespace-nowrap">
                            <Clock size={10} />
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#b89fff]/10 text-[#b89fff] font-bold uppercase tracking-widest border border-[#b89fff]/20">
                          {conv.associatedItem?.title}
                        </span>
                      </div>

                      <p className={`text-sm truncate ${unread > 0 ? 'text-white font-bold' : 'text-purple-200/50'}`}>
                        {conv.lastMessage?.text || "No messages yet"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {unread > 0 && (
                        <div className="bg-[#ff2e97] text-white text-[10px] font-black px-2 py-1 rounded-full shadow-[0_0_15px_rgba(255,46,151,0.5)]">
                          {unread} NEW
                        </div>
                      )}
                      <ChevronRight className="text-purple-200/20 group-hover:text-[#4af8e3] transition-colors" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
