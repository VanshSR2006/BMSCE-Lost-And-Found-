import { useEffect, useState, useMemo } from "react";
import { Search, Package, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
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

const Directory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      <main className="flex-1 pt-24 pb-32">
        {/* The Hub Divider */}
        <div id="search-hub" className="mb-10 lg:mt-8">
          <div className="flex items-center gap-4 max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white font-['Plus_Jakarta_Sans'] py-2">Global Directory</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#b89fff]/30 to-transparent ml-4"></div>
          </div>
          <p className="max-w-7xl mx-auto px-6 mt-4 text-purple-200/60 text-lg">Scan the neural net for actively reported items bounding the campus coordinates.</p>
        </div>

        {/* SEARCH BOX & DIRECTORY - Retained Logic */}
        <section className="px-6 max-w-7xl mx-auto mb-16">
          <div className="bg-[#240e3b]/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/10 p-4 md:p-6 animate-scale-in transition-all focus-within:ring-2 focus-within:ring-[#b89fff]/30">
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              {/* SEARCH INPUT */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-300/40" />
                <Input
                  placeholder="Query item signature..."
                  className="pl-12 h-14 text-base bg-[#16052a]/50 border-white/10 text-white placeholder:text-purple-300/30 rounded-xl focus-visible:ring-[#b89fff]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-row gap-4">
                {/* TYPE FILTER */}
                <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                  <SelectTrigger className="w-full md:w-48 h-14 text-base bg-[#16052a]/50 border-white/10 text-white rounded-xl focus:ring-[#b89fff]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#240e3b] border-white/10 text-white">
                    <SelectItem value="all">All Anomalies</SelectItem>
                    <SelectItem value="lost">Lost Priority</SelectItem>
                    <SelectItem value="found">Found Objects</SelectItem>
                  </SelectContent>
                </Select>

                {/* CATEGORY FILTER */}
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-48 h-14 text-base bg-[#16052a]/50 border-white/10 text-white rounded-xl focus:ring-[#b89fff]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#240e3b] border-white/10 text-white max-h-[300px]">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* ITEMS LIST */}
        <section className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
             <div>
               {loading ? (
                 <p className="text-purple-300/50 text-sm">Scanning neural net...</p>
               ) : (
                 <p className="text-purple-300/50 text-sm font-bold uppercase tracking-widest">
                   {filteredAndSortedItems.length} match{filteredAndSortedItems.length !== 1 ? "es" : ""} located
                 </p>
               )}
             </div>

             <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
               <SelectTrigger className="w-44 h-10 bg-transparent border border-white/10 hover:bg-white/5 rounded-xl text-[#4af8e3] font-bold focus:ring-0">
                 <ArrowUpDown className="h-4 w-4 mr-2" />
                 <SelectValue placeholder="Sort" />
               </SelectTrigger>
               <SelectContent className="bg-[#16052a] border-white/10 text-white">
                 <SelectItem value="newest">Chronological</SelectItem>
                 <SelectItem value="oldest">Historical</SelectItem>
                 <SelectItem value="category">Sector Filter</SelectItem>
               </SelectContent>
             </Select>
          </div>

          {/* GRID */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4af8e3]"></div>
            </div>
          ) : filteredAndSortedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {filteredAndSortedItems.map((item, index) => (
                <div
                  key={item._id}
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
                  className="animate-slide-up opacity-0 relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-teal-400 rounded-3xl blur opacity-0 transition duration-500 group-hover:opacity-20 z-0"></div>
                  <div className="relative z-10 w-full h-full">
                    <ItemCard
                      id={item._id}
                      title={item.title}
                      description={item.description}
                      category={item.category || "Other"}
                      location={item.location}
                      date={item.date}
                      type={item.type}
                      imageUrl={item.image || undefined}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5">
              <Package className="h-16 w-16 text-purple-300/20 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">Sector Clear</h3>
              <p className="text-purple-200/50">No items match your specific query parameters.</p>
            </div>
          )}
        </section>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default Directory;
