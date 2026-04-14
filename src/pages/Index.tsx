import { useEffect, useState, useMemo } from "react";
import { Search, Plus, Package, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ParticlesBackground from "@/components/ParticlesBackground";
import { useAuth } from "@/contexts/AuthContext";

import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import { api } from "@/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "category">("newest");

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/items");
        setItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // CATEGORY list from backend items (fallback to "Other")
  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category || "Other"));
    return Array.from(cats);
  }, [items]);

  // FILTERING + SORTING
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category || "other").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === "all" || item.type === filterType;

      const matchesCategory =
        filterCategory === "all" ||
        (item.category || "Other") === filterCategory;

      return matchesSearch && matchesType && matchesCategory;
    });

    filtered.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "category") return (a.category || "Other").localeCompare(b.category || "Other");
      return 0;
    });

    return filtered;
  }, [items, searchQuery, filterType, filterCategory, sortBy]);

  return (
    <div className="min-h-screen flex flex-col animate-fade-in font-['Inter']">
      <Navbar />

      <main className="flex-1 pt-16 pb-32">
        {/* HERO SECTION */}
        <section className="px-6 mb-20 max-w-7xl mx-auto mt-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#240e3b]/40 backdrop-blur-2xl border border-[#b89fff]/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] min-h-[550px] flex flex-col md:flex-row items-center">
            
            <div className="w-full md:w-3/5 p-8 md:p-16 z-10">
              {isAdmin ? (
                // ===== ADMIN HERO =====
                <>
                  <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-[#a70138]/20 border border-[#ff6e84]/30">
                    <span className="w-2 h-2 rounded-full bg-[#ff6e84] shadow-[0_0_8px_#ff6e84] animate-pulse"></span>
                    <span className="text-[#ff6e84] font-bold text-[10px] tracking-[0.2em] uppercase">System Overseer · Active</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.05] font-['Plus_Jakarta_Sans']">
                    Command <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b89fff] to-[#4af8e3] italic font-black pr-2">Center.</span>
                  </h1>
                  <p className="text-purple-100/70 text-lg md:text-xl max-w-lg mb-12 leading-relaxed font-medium">
                    Your oversight ensures every item finds its way home and every user remains verified. Maintain the integrity of the campus ecosystem.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <button
                      onClick={() => navigate("/admin")}
                      className="bg-gradient-to-r from-[#b89fff] to-[#ac8eff] text-[#2a0070] px-10 py-5 rounded-full font-bold shadow-[0_10px_30px_rgba(184,159,255,0.3)] active:scale-95 transition-all text-center group flex items-center justify-center gap-2"
                    >
                      Open Command Center <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button
                      onClick={() => navigate("/directory")}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-5 rounded-full font-bold active:scale-95 transition-all flex justify-center items-center backdrop-blur-md"
                    >
                      View All Reports
                    </button>
                  </div>
                </>
              ) : (
                // ===== REGULAR USER HERO =====
                <>
                  <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 text-[#4af8e3] text-[10px] font-bold tracking-[0.2em] uppercase mb-8 border border-white/10 backdrop-blur-md">
                    Smart Campus Concierge
                  </span>
                  <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.05] font-['Plus_Jakarta_Sans']">
                    Find Your <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b89fff] to-[#4af8e3] italic font-black pr-2">Belongings</span> with Ease.
                  </h1>
                  <p className="text-purple-100/70 text-lg md:text-xl max-w-lg mb-12 leading-relaxed font-medium">
                    The centralized digital hub for modern campuses. Reclaim what's yours with verified security and instant matching.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Link
                      to="/directory"
                      className="bg-gradient-to-r from-[#6200EE] to-[#ff2e97] text-white px-10 py-5 rounded-full font-bold shadow-[0_10px_30px_rgba(255,46,151,0.3)] active:scale-95 transition-all text-center group flex items-center justify-center gap-2"
                    >
                      Search Items <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                    <Link to="/post" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-5 rounded-full font-bold active:scale-95 transition-all flex justify-center items-center backdrop-blur-md">
                      Report Found
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Desktop Hero Image */}
            <div className="hidden md:block w-2/5 h-[550px] relative p-12">
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500 border-4 border-white/5">
                <img alt="Campus Life" className="w-full h-full object-cover grayscale-[0.2]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByRc6sM6srdiHjSPBs-SQduHppTXBTCsK4DfbDG1BQ_kUacca2HdAVTxSQmcJ9ltYcUjwtn72F-69IeBrLsGLqjh5MNGe-Tr3_ZqXdWZC49DZGAhvm9QH8qPa73mnfMrONo2Z1RINKRQwqoYmve0HSl9HfSUk8w0adyKTs51W7RtY4632jDRzxGoYj_rY2MkwCXe-xsIoqwbFMA8HKGzmn0QFihR5yoVpPU5WsNKWdtC96JPWaO6jjYzdHHZ6BSLnGgYw8j5hqRctO"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#16052a]/90 to-transparent"></div>
                
                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl animate-fade-in animate-duration-[2000ms]">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#4af8e3] rounded-full p-2 flex items-center shadow-[0_0_15px_rgba(74,248,227,0.4)]">
                      <span className="material-symbols-outlined text-[#16052a] text-sm font-bold">check_circle</span>
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Verified by Security</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* ADMIN OATH PANEL — only for admins */}
        {isAdmin && (
          <section className="px-6 mb-16 max-w-7xl mx-auto">
            <div
              className="rounded-[2rem] p-8 md:p-12 relative overflow-hidden"
              style={{
                background: "rgba(167, 1, 56, 0.1)",
                border: "1px solid rgba(255, 110, 132, 0.2)",
                boxShadow: "inset 0 0 30px rgba(255, 110, 132, 0.05)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Background gavel icon */}
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[9rem] text-[#ff6e84]" style={{fontVariationSettings:"'FILL' 1"}}>gavel</span>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-[#a70138]/40 flex items-center justify-center border border-[#ff6e84]/30">
                    <span className="material-symbols-outlined text-[#ff6e84] text-4xl" style={{fontVariationSettings:"'FILL' 1"}}>policy</span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-[#ff6e84] font-['Plus_Jakarta_Sans'] font-bold text-xs tracking-[0.3em] uppercase mb-4">The Administrator's Oath</h3>
                  <p className="text-2xl md:text-3xl font-['Plus_Jakarta_Sans'] font-semibold text-white italic leading-snug mb-4">
                    "Integrity in every claim, fairness in every resolution."
                  </p>
                  <p className="text-purple-200/60 text-sm leading-relaxed">
                    The campus's trust is in your hands. Your oversight ensures the integrity of the global inventory and the verification of all personnel. Your actions within the Command Center maintain the safety standards of BMSCE.
                  </p>
                </div>

                <div className="flex gap-3 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#ff6e84]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#ff6e84]/30"></div>
                  <div className="w-2 h-2 rounded-full bg-[#ff6e84]/30"></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats Bento Grid - Stitch Design */}
        <section className="px-6 mb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-[#240e3b]/60 backdrop-blur-xl border border-white/5 p-10 flex flex-col justify-between relative overflow-hidden group rounded-[2.5rem]">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[150px] text-[#b89fff]">group</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-6 text-white font-['Plus_Jakarta_Sans']">Trust is our Protocol</h3>
                <p className="text-purple-200/60 leading-relaxed mb-10 max-w-md text-lg">Our automated verification engine ensures items meet their true owners. Built by students, for the community.</p>
              </div>
              <div className="flex gap-16 relative z-10">
                <div>
                  <span className="block text-3xl font-black text-[#4af8e3] font-['Plus_Jakarta_Sans'] mb-1">Safe &amp; Secure</span>
                  <span className="text-sm text-purple-200/40 font-bold uppercase tracking-widest">Platform</span>
                </div>
                <div>
                  <span className="block text-3xl font-black text-[#b89fff] font-['Plus_Jakarta_Sans'] mb-1">Highly Reliable</span>
                  <span className="text-sm text-purple-200/40 font-bold uppercase tracking-widest">Network</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#6200EE] to-[#ff2e97] p-10 rounded-[2.5rem] text-white flex flex-col items-center justify-center text-center shadow-[0_20px_40px_rgba(255,46,151,0.2)] hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 mix-blend-overlay"></div>
               <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-full p-6 mb-6 z-10">
                 <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
               </div>
               <h3 className="text-2xl font-bold mb-4 font-['Plus_Jakarta_Sans'] z-10">Secure Handover</h3>
               <p className="text-white/80 text-sm leading-relaxed z-10">Multifactor identification required for all high-value item claims to ensure 100% security.</p>
            </div>
          </div>
        </section>

        {/* Features Section - How it works */}
        <section className="px-6 mb-16 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="w-full lg:w-1/2">
               <div className="relative">
                 <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#6200EE]/30 rounded-full blur-3xl"></div>
                 <img alt="Happy Campus" className="rounded-[3rem] shadow-2xl w-full aspect-square object-cover grayscale-[0.2] border-4 border-white/5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw41vxvqNsezz5TCQ3dD3EFqyrdfklnOxOgdQU4X09pUwGjIDbmtpT4KNcqX9HiJ5d7-Ci5tsanEv8MdF0jc-VIurWZZlpHg3ODc4sxdKDpong5wkY9y5sHQSE-dwbyUouJLSavYjaMCjVXPct__mszL-7rEHXV6hLfDRkIdWE18hlBiCg_dLf0_mybBmEIp4-oN3yLg4y7ZxC-zrd7ybvmbJbgXVjdA-1Qgrb5Y5y5l6YnP94SopgXwwN7fTNA972XHqv-RhUczSc"/>
                 <div className="absolute -bottom-8 -right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl max-w-[280px] hidden sm:block transform hover:-translate-y-2 transition-transform">
                   <span className="material-symbols-outlined text-[#4af8e3] text-4xl mb-4">handshake</span>
                   <p className="text-lg font-bold italic text-white leading-tight">"Integrity is the heartbeat of our campus."</p>
                 </div>
               </div>
            </div>
            <div className="w-full lg:w-1/2">
               <h2 className="text-4xl md:text-5xl font-extrabold mb-12 tracking-tight text-white font-['Plus_Jakarta_Sans']">How it Works</h2>
                <div className="space-y-10">
                  <div className="flex gap-8 group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#6200EE]/20 group-hover:border-[#b89fff] transition-all duration-300 shadow-xl">
                      <span className="material-symbols-outlined text-[#b89fff] text-3xl">hub</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-2 text-white font-['Plus_Jakarta_Sans']">Neural Alignment</h4>
                      <p className="text-purple-200/50 leading-relaxed text-sm">Our matching engine triggers instant alerts the moment a biological connection is detected between lost and found signatures.</p>
                    </div>
                  </div>
                  <div className="flex gap-8 group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#4af8e3]/20 group-hover:border-[#4af8e3] transition-all duration-300 shadow-xl">
                      <span className="material-symbols-outlined text-[#4af8e3] text-3xl">inventory_2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-2 text-white font-['Plus_Jakarta_Sans']">Digital Dossier</h4>
                      <p className="text-purple-200/50 leading-relaxed text-sm">A centralized inventory to track anomaly reports. Manage your personal dossier and monitor active signatures in real-time.</p>
                    </div>
                  </div>
                  <div className="flex gap-8 group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#ff2e97]/20 group-hover:border-[#ff2e97] transition-all duration-300 shadow-xl">
                      <span className="material-symbols-outlined text-[#ff2e97] text-3xl">forum</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-2 text-white font-['Plus_Jakarta_Sans']">Secure Handover</h4>
                      <p className="text-purple-200/50 leading-relaxed text-sm">Coordinate returns through encrypted peer-to-peer secure links. Verify ownership and verify identities without intermediaries.</p>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </section>
      </main>

      {/* Remove the Footer, as Navbar mobile-bottom-nav will overlap it anyway, or hide it on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
