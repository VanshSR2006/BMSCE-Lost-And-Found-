import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Users, 
  Package, 
  AlertTriangle, 
  Trash2,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Clock
} from "lucide-react";

const Admin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalItems: 0, activeReports: 0 });
  const token = localStorage.getItem("token");

  const loadData = async () => {
    try {
      const [uRes, iRes, sRes] = await Promise.all([
        api.get("/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/admin/items", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/admin/stats", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(uRes.data);
      setItems(iRes.data);
      setStats(sRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateRole = async (id: string, role: string) => {
    await api.put(`/admin/users/${id}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  const deleteUser = async (id: string) => {
    await api.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  const deleteItem = async (id: string) => {
    await api.delete(`/admin/items/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#16052a] text-white font-['Inter'] relative overflow-hidden">
      {/* Background Glows matching Lumina style */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#b89fff]/10 via-[#16052a] to-[#16052a]"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#4af8e3]/10 rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      
      <Navbar />

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-24 flex-1">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-[#b89fff] font-['Plus_Jakarta_Sans'] font-extrabold tracking-tight text-3xl">Command Center</h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#b89fff]/30 to-transparent ml-4 hidden md:block"></div>
        </div>

        {/* STATS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Users Stat */}
          <div className="bg-[#240e3b]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#b89fff]/10 rounded-full blur-3xl group-hover:bg-[#b89fff]/20 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-[#b89fff]/20 rounded-2xl border border-[#b89fff]/30">
                <Users className="text-[#b89fff] w-8 h-8" />
              </div>
            </div>
            <h3 className="text-[#b9a2d0] text-sm font-medium mb-1 font-['Plus_Jakarta_Sans']">Total Personnel</h3>
            <p className="text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans']">{stats.totalUsers}</p>
          </div>

          {/* Items Stat */}
          <div className="bg-[#240e3b]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#4af8e3]/10 rounded-full blur-3xl group-hover:bg-[#4af8e3]/20 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-[#4af8e3]/20 rounded-2xl border border-[#4af8e3]/30">
                <Package className="text-[#4af8e3] w-8 h-8" />
              </div>
            </div>
            <h3 className="text-[#b9a2d0] text-sm font-medium mb-1 font-['Plus_Jakarta_Sans']">Global Inventory</h3>
            <p className="text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans']">{stats.totalItems}</p>
          </div>

          {/* Reports Stat */}
          <div className="bg-[#240e3b]/80 backdrop-blur-2xl border border-[#ff6e84]/30 rounded-[2rem] p-8 relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:shadow-[#ff6e84]/10">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#ff6e84]/10 rounded-full blur-3xl group-hover:bg-[#ff6e84]/20 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-[#ff6e84]/20 rounded-2xl border border-[#ff6e84]/40">
                <AlertTriangle className="text-[#ff6e84] w-8 h-8" />
              </div>
              <div className="flex items-center gap-2 text-[#ff6e84] text-xs font-bold animate-pulse bg-[#ff6e84]/10 px-3 py-1.5 rounded-full border border-[#ff6e84]/30">
                <div className="w-2 h-2 rounded-full bg-[#ff6e84]"></div>
                LIVE
              </div>
            </div>
            <h3 className="text-[#b9a2d0] text-sm font-medium mb-1 font-['Plus_Jakarta_Sans']">Active Reports</h3>
            <p className="text-4xl font-extrabold text-[#ffb2b9] font-['Plus_Jakarta_Sans']">{stats.activeReports}</p>
          </div>
        </section>

        {/* MAIN LAYOUT (Users Left, Items Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* USER MANAGEMENT (Col 5) */}
          <section className="xl:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white tracking-tight">Personnel Directory</h3>
            </div>
            
            <div className="bg-[#240e3b]/80 backdrop-blur-2xl rounded-[2rem] border border-white/5 flex flex-col max-h-[700px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="p-5 border-b border-white/5 bg-black/20">
                <p className="text-xs font-bold text-[#b9a2d0] uppercase tracking-widest">Active Accounts ({users.length})</p>
              </div>
              
              <div className="overflow-y-auto custom-scrollbar flex-1 p-3">
                {users.map(u => (
                  <div key={u._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-[1.5rem] mb-2 border border-transparent hover:border-white/5 group">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6200EE] to-[#ff2e97] p-[2px] shadow-[0_0_15px_rgba(98,0,238,0.4)]">
                         <div className="w-full h-full rounded-full bg-[#16052a] flex items-center justify-center font-extrabold text-[#f1dfff] text-lg uppercase font-['Plus_Jakarta_Sans']">
                            {u.name.charAt(0)}
                         </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white font-['Plus_Jakarta_Sans']">{u.name}</p>
                        <p className="text-[10px] text-[#b9a2d0] tracking-wider mb-1.5">{u.email}</p>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border tracking-widest ${
                          u.role === "admin" 
                            ? "bg-[#ff6e84]/15 text-[#ffb2b9] border-[#ff6e84]/40" 
                            : "bg-[#4af8e3]/10 text-[#dcfff8] border-[#4af8e3]/30"
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    </div>
                    
                    {/* User Actions */}
                    <div className="flex gap-2 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => updateRole(u._id, u.role === "admin" ? "user" : "admin")}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-105"
                        title={u.role === "admin" ? "Demote" : "Promote to Admin"}
                      >
                         {u.role === "admin" ? <ShieldAlert className="w-4 h-4 text-[#ff6e84]" /> : <ShieldCheck className="w-4 h-4 text-[#4af8e3]" />}
                      </button>
                      <button 
                        onClick={() => deleteUser(u._id)}
                        className="p-2.5 rounded-xl bg-[#ff6e84]/10 hover:bg-[#ff6e84]/20 text-[#ff6e84] transition-all hover:scale-105"
                        title="Delete User"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ITEM INVENTORY GALLERY (Col 7) */}
          <section className="xl:col-span-7 space-y-6">
             <div className="flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white tracking-tight">Global Inventory</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar pb-6">
               {items.map(item => (
                 <div key={item._id} className="bg-[#240e3b] backdrop-blur-xl rounded-[2rem] overflow-hidden group border border-white/5 flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_40px_rgba(184,159,255,0.15)] transition-all">
                    
                    {/* Image Area */}
                    <div className="relative h-48 overflow-hidden bg-[#16052a]">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                           <Package className="w-16 h-16 text-[#b9a2d0]/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#16052a] to-transparent opacity-90"></div>
                      
                      {/* Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`backdrop-blur-md px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-lg ${
                          item.type === "lost" 
                            ? "bg-[#ff6e84]/20 text-[#ffb2b9] border-[#ff6e84]/40" 
                            : "bg-[#4af8e3]/20 text-[#dcfff8] border-[#4af8e3]/40"
                        }`}>
                          {item.type} • {item.category}
                        </span>
                      </div>
                      
                      {/* Info Over Image */}
                      <div className="absolute bottom-4 left-5 right-5">
                        <p className="text-white font-extrabold text-xl leading-tight mb-2 truncate font-['Plus_Jakarta_Sans']">{item.title}</p>
                        <div className="flex items-center gap-2 text-[#b9a2d0] text-xs font-medium bg-black/40 backdrop-blur px-2.5 py-1.5 rounded-lg w-max max-w-full">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Area */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-5 bg-gradient-to-b from-[#1c0832] to-[#240e3b]">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-xs text-[#b9a2d0]">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#b89fff] to-[#6d23f9] flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="font-extrabold text-[10px] text-white">UP</span>
                          </div>
                          <span className="truncate font-medium">{item.createdBy?.email || "Unknown Poster"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#b9a2d0]">
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                             <Clock className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium">{item.date}</span>
                        </div>
                      </div>
                      
                      {/* Action */}
                      <div className="pt-4 border-t border-white/5 mt-auto">
                        <button 
                          onClick={() => deleteItem(item._id)}
                          className="w-full py-3 rounded-2xl bg-[#ff6e84]/10 hover:bg-[#ff6e84] hover:text-[#390010] text-[#ff6e84] font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,110,132,0)] hover:shadow-[0_0_20px_rgba(255,110,132,0.4)] border border-[#ff6e84]/20 hover:border-transparent"
                        >
                          Eradicate Entry
                        </button>
                      </div>
                    </div>

                 </div>
               ))}
               
               {items.length === 0 && (
                  <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-16 bg-[#240e3b]/40 backdrop-blur-xl rounded-[2rem] border border-white/5 border-dashed">
                    <Package className="w-16 h-16 text-white/10 mb-4" />
                    <p className="text-[#b9a2d0] font-['Plus_Jakarta_Sans'] font-medium">Inventory is empty.</p>
                  </div>
               )}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
