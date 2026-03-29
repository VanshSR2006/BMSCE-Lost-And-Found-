import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { User, Phone, BookOpen, Mail, Edit2, Check, X, LogOut } from "lucide-react";

const PROFILE_STORAGE_KEY = "bmsce_profile_extra";

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Editable extra fields stored locally
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [usn, setUsn] = useState("");
  const [branch, setBranch] = useState("");
  const [saving, setSaving] = useState(false);

  // Load saved extras from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setPhone(parsed.phone || "");
      setUsn(parsed.usn || "");
      setBranch(parsed.branch || "");
    }
  }, []);

  // Fetch the user's own posts
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetch = async () => {
      try {
        const res = await api.get("/items/mine");
        setItems(res.data);
      } catch {
        toast.error("Could not load your posts");
      } finally {
        setLoadingItems(false);
      }
    };
    fetch();
  }, [isAuthenticated]);

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ phone, usn, branch }));
    setTimeout(() => {
      setSaving(false);
      setEditMode(false);
      toast.success("Profile updated!");
    }, 300);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/items/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Item removed");
    } catch {
      toast.error("Could not remove item");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#16052a] text-white gap-6 px-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#240e3b] border border-white/10 flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-[#b89fff]" />
          </div>
          <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] mb-2">Not Logged In</h2>
          <p className="text-purple-200/60 text-sm mb-8">Sign in to view your profile and posts.</p>
          <button
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-[#6200EE] to-[#ff2e97] text-white px-10 py-4 rounded-full font-bold active:scale-95 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const avatar = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen flex flex-col font-['Inter'] bg-[#16052a]">
      <Navbar />

      <main className="flex-1 pt-24 pb-36 px-4 max-w-2xl mx-auto w-full">

        {/* ─── PROFILE CARD ─── */}
        <div className="relative bg-[#240e3b]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Glow blob */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#b89fff]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-5 mb-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6200EE] to-[#ff2e97] p-[2px] shadow-[0_0_20px_rgba(98,0,238,0.5)] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#16052a] flex items-center justify-center font-extrabold text-[#f1dfff] text-2xl font-['Plus_Jakarta_Sans']">
                {avatar}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-extrabold text-white font-['Plus_Jakarta_Sans'] truncate">{user?.name}</h1>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                user?.role === "admin"
                  ? "bg-[#ff6e84]/15 text-[#ffb2b9] border-[#ff6e84]/40"
                  : "bg-[#4af8e3]/10 text-[#dcfff8] border-[#4af8e3]/30"
              }`}>{user?.role}</span>
            </div>

            {/* Edit toggle */}
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              >
                <Edit2 className="w-4 h-4 text-[#b89fff]" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="p-2.5 rounded-xl bg-[#4af8e3]/20 hover:bg-[#4af8e3]/30 transition-all border border-[#4af8e3]/30">
                  <Check className="w-4 h-4 text-[#4af8e3]" />
                </button>
                <button onClick={() => setEditMode(false)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10">
                  <X className="w-4 h-4 text-purple-300" />
                </button>
              </div>
            )}
          </div>

          {/* ─── INFO ROWS ─── */}
          <div className="relative z-10 space-y-3">
            {/* Email (from auth — read only) */}
            <div className="flex items-center gap-4 p-3.5 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-[#b89fff]/15 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-[#b89fff]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-purple-200/50 uppercase tracking-widest font-bold mb-0.5">Email Address</p>
                <p className="text-sm text-white truncate">{user?.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 p-3.5 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-[#4af8e3]/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-[#4af8e3]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-purple-200/50 uppercase tracking-widest font-bold mb-0.5">Phone Number</p>
                {editMode ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none border-b border-[#4af8e3]/40 pb-0.5"
                  />
                ) : (
                  <p className="text-sm text-white">{phone || <span className="text-white/30 italic">Not set — tap edit to add</span>}</p>
                )}
              </div>
            </div>

            {/* USN */}
            <div className="flex items-center gap-4 p-3.5 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-[#ff2e97]/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-[#ff2e97]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-purple-200/50 uppercase tracking-widest font-bold mb-0.5">USN / Student ID</p>
                {editMode ? (
                  <input
                    type="text"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    placeholder="e.g. 1BM22CS123"
                    className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none border-b border-[#ff2e97]/40 pb-0.5"
                  />
                ) : (
                  <p className="text-sm text-white">{usn || <span className="text-white/30 italic">Not set — tap edit to add</span>}</p>
                )}
              </div>
            </div>

            {/* Branch */}
            <div className="flex items-center gap-4 p-3.5 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-[#b89fff]/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#b89fff] text-sm">school</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-purple-200/50 uppercase tracking-widest font-bold mb-0.5">Branch / Department</p>
                {editMode ? (
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none border-b border-[#b89fff]/40 pb-0.5"
                  />
                ) : (
                  <p className="text-sm text-white">{branch || <span className="text-white/30 italic">Not set — tap edit to add</span>}</p>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="relative z-10 w-full mt-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-[#ff6e84] font-bold text-sm bg-[#ff6e84]/10 hover:bg-[#ff6e84]/20 border border-[#ff6e84]/20 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Terminate Link
          </button>
        </div>

        {/* ─── MY POSTS ─── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white">My Reports</h2>
          <span className="text-xs font-bold text-[#b89fff] bg-[#b89fff]/10 px-3 py-1 rounded-full border border-[#b89fff]/20">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        {loadingItems ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[#b89fff]/30 border-t-[#b89fff] animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[#240e3b]/40 rounded-[2rem] border border-white/5 border-dashed">
            <span className="material-symbols-outlined text-5xl text-white/10 mb-3">inventory_2</span>
            <p className="text-purple-200/50 font-medium text-sm">No reports submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
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
                <button
                  onClick={() => handleDelete(item._id)}
                  className="w-full mt-2 py-3 rounded-2xl text-[#ff6e84] font-bold text-xs uppercase tracking-widest bg-[#ff6e84]/10 hover:bg-[#ff6e84]/20 border border-[#ff6e84]/20 transition-all active:scale-95"
                >
                  Remove / Mark as Claimed
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default Profile;
