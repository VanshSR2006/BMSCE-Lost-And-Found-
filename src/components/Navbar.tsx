import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/contexts/NotificationContext";

import {
  User,
  LogOut,
  Moon,
  Sun,
  Home,
  PlusCircle,
  Shield,
  Bell,
  MessageSquare,
} from "lucide-react";
import { useChat } from "@/contexts/ChatContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications, clearNotification } = useNotifications();
  const { unreadMessagesCount } = useChat();

  const hasNotifications = notifications.length > 0;

  // Helper function to check if a route is active
  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#240e3b]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(241,223,255,0.02)] transition-all duration-300">
        <div className="mx-auto flex justify-between items-center py-4 px-4 h-20 max-w-full lg:max-w-7xl">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="bg-gradient-to-tr from-[#6200EE] to-[#ff2e97] p-1.5 rounded-lg shadow-[0_0_15px_rgba(255,46,151,0.3)] group-hover:shadow-[0_0_20px_rgba(255,46,151,0.5)] transition-all duration-300">
              <span className="material-symbols-outlined text-white text-sm" style={{fontVariationSettings: "'FILL' 1"}}>explore</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tighter text-white font-['Plus_Jakarta_Sans'] group-hover:text-[#b89fff] transition-colors hidden sm:block">
              BMSCE Reconnect
            </span>
          </Link>

          {/* CENTER LINKS (Desktop Only) */}
          <div className="hidden md:flex gap-6 lg:gap-8 text-sm font-medium">
            <Link 
              to="/" 
              className={`font-bold font-['Plus_Jakarta_Sans'] transition-all ${isActive('/') ? 'text-[#4af8e3]' : 'text-purple-200/70 hover:text-white px-3 py-1 hover:bg-white/10 rounded-full'}`}
            >
              Home
            </Link>
            <Link 
              to="/directory" 
              className={`font-medium font-['Plus_Jakarta_Sans'] px-3 py-1 rounded-full transition-all ${isActive('/directory') ? 'text-[#4af8e3] bg-white/10 shadow-[0_0_10px_rgba(74,248,227,0.2)]' : 'text-purple-200/70 hover:text-white hover:bg-white/10'}`}
            >
              Directory
            </Link>
            <Link 
              to="/post" 
              className={`font-medium font-['Plus_Jakarta_Sans'] px-3 py-1 rounded-full transition-all ${isActive('/post') ? 'text-[#4af8e3] bg-white/10 shadow-[0_0_10px_rgba(74,248,227,0.2)]' : 'text-purple-200/70 hover:text-white hover:bg-white/10'}`}
            >
              Report
            </Link>
            {isAuthenticated && (
              <Link 
                to="/chats" 
                className={`relative font-medium font-['Plus_Jakarta_Sans'] px-3 py-1 rounded-full transition-all ${isActive('/chats') ? 'text-[#4af8e3] bg-white/10 shadow-[0_0_10px_rgba(74,248,227,0.2)]' : 'text-purple-200/70 hover:text-white hover:bg-white/10'}`}
              >
                Chats
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff2e97] text-[10px] font-bold text-white shadow-[0_0_10px_rgba(255,46,151,0.6)]">
                    {unreadMessagesCount}
                  </span>
                )}
              </Link>
            )}
            <Link 
              to="/about" 
              className={`font-medium font-['Plus_Jakarta_Sans'] px-3 py-1 rounded-full transition-all ${isActive('/about') ? 'text-[#4af8e3] bg-white/10 shadow-[0_0_10px_rgba(74,248,227,0.2)]' : 'text-purple-200/70 hover:text-white hover:bg-white/10'}`}
            >
              About
            </Link>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {/* SIGN IN WHEN LOGGED OUT */}
            {!isAuthenticated && (
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full px-6 transition-all"
              >
                Sign In
              </Button>
            )}

            {/* 🔔 NOTIFICATIONS (ONLY WHEN LOGGED IN) */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-all">
                    <Bell className="h-5 w-5 text-purple-200" />
                    {hasNotifications && (
                      <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-[#ff2e97] shadow-[0_0_10px_rgba(255,46,151,0.8)] animate-pulse" />
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-80 p-3 shadow-2xl bg-[#16052a]/95 backdrop-blur-3xl border border-white/10 text-white">
                  <p className="text-sm font-bold mb-2 text-[#b89fff] uppercase tracking-wider">
                    {user?.role === "admin" ? "🛡️ Security Alerts" : "Neural Alerts"}
                  </p>

                  {!hasNotifications && (
                    <p className="text-sm text-purple-200/50 italic">
                      {user?.role === "admin" ? "No pending handover requests." : "No anomalies detected in your sector. 🎉"}
                    </p>
                  )}

                  {notifications.map((n) => {
                    // NEW: Unified notification card for matches and claim requests
                    return (
                      <div key={n._id} className={`space-y-3 rounded-xl border p-3 backdrop-blur-md mb-2 ${
                        n.type === "claim_request" ? "border-[#ff2e97]/30 bg-[#ff2e97]/5" : "border-white/10 bg-white/5"
                      }`}>
                        <p className={`text-sm font-bold flex items-center gap-2 ${
                          n.type === "claim_request" ? "text-[#ff2e97]" : "text-[#4af8e3]"
                        }`}>
                          <span className="material-symbols-outlined text-sm">
                            {n.type === "claim_request" ? "handover" : "search_check"}
                          </span> 
                          {n.type === "claim_request" ? "Handover Request" : "Possible match found!"}
                        </p>
                        <p className="text-xs text-white">
                          <b>{n.foundItem?.title || n.lostItem?.title || "Item"}</b>
                          {(n.foundItem?.category || n.lostItem?.category) && (
                            <span className="text-purple-300"> • {n.foundItem?.category || n.lostItem?.category}</span>
                          )}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            className={`w-full py-1 h-8 rounded-lg text-white font-bold ${
                              n.type === "claim_request" || !n.conversationId 
                                ? "bg-white/10 hover:bg-white/20" 
                                : "bg-[#6200EE] hover:bg-[#b89fff]"
                            }`}
                            onClick={async () => {
                              if (n.conversationId) {
                                clearNotification(n._id);
                                navigate(`/chat/${n.conversationId}`);
                              } else {
                                navigate("/notifications");
                              }
                            }}
                          >
                            {n.conversationId ? "Open Chat" : "View Protocol"}
                          </Button>
                          <Button
                            size="sm"
                            className="w-full bg-transparent border border-white/20 text-white hover:bg-white/10 h-8 rounded-lg"
                            onClick={() => clearNotification(n._id)}
                          >
                            Discard
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* USER MENU */}
            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6200EE] to-[#ff2e97] p-[2px] cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(98,0,238,0.4)]">
                    <div className="w-full h-full rounded-full bg-[#16052a] flex items-center justify-center overflow-hidden">
                      <span className="material-symbols-outlined text-sm text-[#b89fff]">person</span>
                    </div>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-[#240e3b] border border-white/10 text-white backdrop-blur-xl shadow-2xl rounded-2xl p-2 font-['Inter']">
                  <DropdownMenuItem className="hover:bg-white/10 rounded-lg cursor-pointer focus:bg-white/10 focus:text-white" onClick={() => navigate("/")}>
                    <Home className="h-4 w-4 mr-3 text-[#b89fff]" /> Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem className="hover:bg-white/10 rounded-lg cursor-pointer focus:bg-white/10 focus:text-white" onClick={() => navigate("/directory")}>
                    <span className="material-symbols-outlined mr-3 text-sm text-[#b89fff]">list</span> Directory
                  </DropdownMenuItem>

                  <DropdownMenuItem className="hover:bg-white/10 rounded-lg cursor-pointer focus:bg-white/10 focus:text-white" onClick={() => navigate("/post")}>
                    <PlusCircle className="h-4 w-4 mr-3 text-[#b89fff]" /> Report Item
                  </DropdownMenuItem>

                  <DropdownMenuItem className="hover:bg-white/10 rounded-lg cursor-pointer focus:bg-white/10 focus:text-white" onClick={() => navigate("/my-posts")}>
                    <User className="h-4 w-4 mr-3 text-[#b89fff]" /> My Dossier
                  </DropdownMenuItem>

                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator className="bg-white/10 my-2" />
                      <DropdownMenuItem className="hover:bg-white/10 rounded-lg cursor-pointer focus:bg-white/10 focus:text-white" onClick={() => navigate("/admin")}>
                        <Shield className="h-4 w-4 mr-3 text-[#ff2e97]" /> Admin Protocol
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-white/10 my-2" />

                  <DropdownMenuItem
                    className="hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer focus:bg-red-500/20 focus:text-red-300"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-3" /> Terminate Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAV — 5 tabs */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md rounded-[2rem] px-1 py-3 bg-[#240e3b]/80 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 flex justify-around items-center z-50">
        <Link to="/" className={`flex flex-col items-center justify-center transition-all ${isActive('/') ? 'bg-[#4af8e3] text-[#16052a] rounded-full px-3 py-2 scale-110 shadow-[0_0_15px_rgba(74,248,227,0.4)]' : 'text-purple-200/50 hover:text-white active:scale-95 px-2 py-2'}`}>
          <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
          <span className="font-['Inter'] text-[8px] uppercase tracking-wider font-bold mt-0.5">Home</span>
        </Link>
        <Link to="/directory" className={`flex flex-col items-center justify-center transition-all ${isActive('/directory') ? 'bg-[#4af8e3] text-[#16052a] rounded-full px-3 py-2 scale-110 shadow-[0_0_15px_rgba(74,248,227,0.4)]' : 'text-purple-200/50 hover:text-white active:scale-95 px-2 py-2'}`}>
          <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>dashboard</span>
          <span className="font-['Inter'] text-[8px] uppercase tracking-wider font-semibold mt-0.5">Items</span>
        </Link>
        <Link to="/post" className={`flex flex-col items-center justify-center transition-all ${isActive('/post') ? 'bg-[#4af8e3] text-[#16052a] rounded-full px-3 py-2 scale-110 shadow-[0_0_15px_rgba(74,248,227,0.4)]' : 'text-purple-200/50 hover:text-white active:scale-95 px-2 py-2'}`}>
          <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>campaign</span>
          <span className="font-['Inter'] text-[8px] uppercase tracking-wider font-semibold mt-0.5">Report</span>
        </Link>
        {isAuthenticated && (
          <Link to="/chats" className={`relative flex flex-col items-center justify-center transition-all ${isActive('/chats') ? 'bg-[#4af8e3] text-[#16052a] rounded-full px-3 py-2 scale-110 shadow-[0_0_15px_rgba(74,248,227,0.4)]' : 'text-purple-200/50 hover:text-white active:scale-95 px-2 py-2'}`}>
            <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>forum</span>
            <span className="font-['Inter'] text-[8px] uppercase tracking-wider font-semibold mt-0.5">Chats</span>
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-2 h-2.5 w-2.5 rounded-full bg-[#ff2e97] border-2 border-[#240e3b]" />
            )}
          </Link>
        )}
        <Link to="/about" className={`flex flex-col items-center justify-center transition-all ${isActive('/about') ? 'bg-[#4af8e3] text-[#16052a] rounded-full px-3 py-2 scale-110 shadow-[0_0_15px_rgba(74,248,227,0.4)]' : 'text-purple-200/50 hover:text-white active:scale-95 px-2 py-2'}`}>
          <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>info</span>
          <span className="font-['Inter'] text-[8px] uppercase tracking-wider font-semibold mt-0.5">About</span>
        </Link>
        <Link to={isAuthenticated ? "/profile" : "/auth"} className={`flex flex-col items-center justify-center transition-all ${(isActive('/profile') || isActive('/auth')) ? 'bg-[#4af8e3] text-[#16052a] rounded-full px-3 py-2 scale-110 shadow-[0_0_15px_rgba(74,248,227,0.4)]' : 'text-purple-200/50 hover:text-white active:scale-95 px-2 py-2'}`}>
          <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
          <span className="font-['Inter'] text-[8px] uppercase tracking-wider font-semibold mt-0.5">Profile</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
