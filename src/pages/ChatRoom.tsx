import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Send, AlertTriangle, Shield, CheckCircle, ArrowLeft, LogOut, XCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket, refreshUnreadCount } = useChat();
  const { reloadNotifications } = useNotifications();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load & Rules Check
  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchChatData = async () => {
      try {
        const [convRes, msgRes] = await Promise.all([
          api.get(`/chat/${id}`), 
          api.get(`/chat/${id}/messages`),
          api.put(`/chat/${id}/read`) // Clear unread count on entry
        ]);
        
        setConversation(convRes.data);
        setMessages(msgRes.data);
        refreshUnreadCount();
        
        // Check if rules already shown
        const rulesShown = localStorage.getItem(`rules_shown_${id}`);
        if (!rulesShown) setShowRules(true);

      } catch (err) {
        toast.error("Could not join secure link");
        navigate("/chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [id, isAuthenticated]);

  // 2. Socket Join & Message Listeners
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join_room", id);

    socket.on("new_message", (msg) => {
      if (msg.conversationId === id) {
        setMessages(prev => [...prev, msg]);
        // Note: We no longer call /read here because the server 
        // handles unread logic by checking who is in the room.
      }
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket, id]);

  // 3. Auto Scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !socket) return;
    
    socket.emit("send_message", {
      conversationId: id,
      text: inputText
    });
    
    setInputText("");
  };

  const [showTerminateModal, setShowTerminateModal] = useState(false);
  
  const confirmTerminate = async (reason: string) => {
    if (!id) return;
    try {
      await api.put(`/chat/${id}/close`, { reason });
      await reloadNotifications();
      toast.success(reason === "misbehaving" ? "Report logged. Link secured." : "Link terminated successfully.");
      navigate("/chats");
    } catch {
      toast.error("Failed to terminate link");
    }
  };

  const closeRules = () => {
    localStorage.setItem(`rules_shown_${id}`, "true");
    setShowRules(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#16052a] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#ff2e97]/20 border-t-[#ff2e97] rounded-full animate-spin" />
    </div>
  );

  const otherUser = conversation?.participants.find((p: any) => p._id !== user?._id);

  return (
    <div className="min-h-screen bg-[#16052a] flex flex-col font-['Inter']">
      
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 w-full h-20 bg-[#240e3b]/80 backdrop-blur-2xl border-b border-white/5 z-40 px-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/chats")} className="p-2 hover:bg-white/5 rounded-full transition-all">
            <ArrowLeft className="text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6200EE] to-[#ff2e97] p-0.5 shadow-lg">
              <div className="w-full h-full rounded-xl bg-[#16052a] flex items-center justify-center font-bold text-white text-xs">
                {otherUser?.name.charAt(0)}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold leading-none">{otherUser?.name}</span>
              <span className="text-[10px] text-[#4af8e3] font-black uppercase tracking-widest mt-1">
                Context: {conversation?.associatedItem?.title}
              </span>
            </div>
          </div>
        </div>

        <button onClick={() => setShowTerminateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-black uppercase transition-all">
          <LogOut size={14} /> Close Chat
        </button>
      </header>

      {/* ─── MESSAGES AREA ─── */}
      <main 
        ref={scrollRef}
        className="flex-1 pt-24 pb-32 px-4 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full scroll-smooth"
      >
        <div className="text-center py-10 opacity-30">
          <Shield className="mx-auto mb-2 text-purple-200" size={32} />
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-purple-200">Encryption Active • Secure Link</p>
        </div>

        {messages.map((msg, idx) => {
          const isMine = (msg.sender?._id || msg.sender) === user?._id;
          return (
            <motion.div
              initial={{ opacity: 0, x: isMine ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={idx}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-3xl text-sm leading-relaxed shadow-lg ${
                  isMine 
                    ? 'bg-gradient-to-br from-[#6200EE] to-[#ff2e97] text-white rounded-tr-none' 
                    : 'bg-[#240e3b] text-purple-100 border border-white/5 rounded-tl-none'
                }`}
              >
                {msg.text}
                <div className={`text-[9px] mt-1 opacity-50 text-right font-black`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </main>

      {/* ─── INPUT AREA ─── */}
      <div className="fixed bottom-0 w-full bg-[#16052a]/80 backdrop-blur-3xl border-t border-white/10 p-4 z-[100]">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Secure message..."
            className="flex-1 bg-[#240e3b] border border-white/10 rounded-2xl p-4 text-white placeholder-purple-200/20 focus:outline-none focus:border-[#b89fff]/50 transition-all shadow-xl"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-4 rounded-2xl bg-gradient-to-tr from-[#6200EE] to-[#ff2e97] text-white shadow-[0_5px_15px_rgba(255,46,151,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            <Send size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showTerminateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#16052a]/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-[#240e3b] border border-[#b89fff]/30 rounded-[2.5rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-purple-500 to-green-500" />
              
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Close Secure Link?</h2>
              <p className="text-purple-200/50 text-sm mb-8">Please specify the reason for terminating this connection. This helps maintain sector security.</p>
              
              <div className="space-y-3 mb-8">
                {/* 1. Received Item */}
                <button 
                  onClick={() => confirmTerminate("received")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-all text-left group"
                >
                  <div className="p-2 bg-green-500/20 rounded-xl text-green-400 group-hover:scale-110 transition-transform">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Received the Item</h4>
                    <p className="text-[10px] text-green-400/60 uppercase font-black tracking-widest">Handover Complete</p>
                  </div>
                </button>

                {/* 2. Wrong Item */}
                <button 
                  onClick={() => confirmTerminate("wrong_item")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group"
                >
                  <div className="p-2 bg-white/10 rounded-xl text-purple-200 group-hover:scale-110 transition-transform">
                    <XCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Wrong Item</h4>
                    <p className="text-[10px] text-purple-200/30 uppercase font-black tracking-widest">Mismatch Detected</p>
                  </div>
                </button>

                {/* 3. Misbehaving */}
                <button 
                  onClick={() => confirmTerminate("misbehaving")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all text-left group"
                >
                  <div className="p-2 bg-red-500/20 rounded-xl text-red-400 group-hover:animate-pulse">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-400">Person is misbehaving</h4>
                    <p className="text-[10px] text-red-400/60 uppercase font-black tracking-widest">Conduct Violation</p>
                  </div>
                </button>
              </div>

              <button 
                onClick={() => setShowTerminateModal(false)}
                className="w-full py-4 rounded-2xl text-purple-200/40 hover:text-purple-200 font-bold text-xs uppercase tracking-[0.2em] transition-all"
              >
                Back to Communication
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRules && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#16052a]/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-sm w-full bg-[#240e3b] border border-[#b89fff]/30 rounded-[2.5rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] text-center relative overflow-hidden"
            >
              {/* Highlight Background */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#6200EE] to-[#ff2e97]" />
              
              <div className="w-16 h-16 bg-[#b89fff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-[#4af8e3] w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-black text-white font-['Plus_Jakarta_Sans'] mb-4 tracking-tight">Code of Conduct</h2>
              
              <div className="space-y-4 text-left mb-8">
                <div className="flex gap-3">
                  <div className="p-2 h-fit bg-white/5 rounded-xl border border-white/5 text-[#b89fff]"><Shield size={16} /></div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Be Responsible</h4>
                    <p className="text-xs text-purple-200/50 leading-relaxed">Coordinate handovers in safe, public campus locations.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="p-2 h-fit bg-white/5 rounded-xl border border-white/5 text-[#4af8e3]"><CheckCircle size={16} /></div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Be Polite</h4>
                    <p className="text-xs text-purple-200/50 leading-relaxed">Respect each other's time and circumstances.</p>
                  </div>
                </div>
                <div className="flex gap-3 text-red-400">
                  <div className="p-2 h-fit bg-red-500/10 rounded-xl border border-red-500/10"><AlertTriangle size={16} /></div>
                  <div>
                    <h4 className="text-sm font-bold">No Spam</h4>
                    <p className="text-xs opacity-50 leading-relaxed">Harassment or spam leads to immediate link termination.</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={closeRules}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#6200EE] to-[#ff2e97] text-white font-bold text-lg hover:shadow-[0_10px_30px_rgba(255,46,151,0.4)]"
              >
                I Understand
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatRoom;
