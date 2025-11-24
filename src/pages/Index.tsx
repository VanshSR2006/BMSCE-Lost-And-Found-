import { useEffect, useState, useMemo } from "react";
import { Search, Plus, Package, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ParticlesBackground from "@/components/ParticlesBackground";

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
    <div className="min-h-screen flex flex-col animate-fade-in">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        {/* HERO SECTION — PREMIUM UI */}
<section className="relative overflow-hidden py-24 px-4">
<ParticlesBackground />
  {/* Background subtle glow */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />

  <div className="container mx-auto text-center relative z-10">

    {/* HEADLINE */}
    <h1
      className="
        text-4xl md:text-6xl font-extrabold tracking-tight mb-6 
        bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
        animate-slide-down
      "
    >
      Lost Something? Found Something?
    </h1>

    {/* SUBTITLE */}
    <p
      className="
        text-lg md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto
        animate-fade-in animate-delay-200
      "
    >
      Reconnect items and owners — powered by the BMSCE community.
    </p>

    {/* ACTION BUTTONS */}
    <div
      className="
        flex flex-col sm:flex-row gap-4 justify-center mb-12 
        animate-fade-in animate-delay-300
      "
    >
      <Link to="/post">
        <Button
          size="lg"
          className="
            w-full sm:w-auto gap-2 px-8 py-6 text-lg 
            hover:scale-[1.04] transition-transform shadow-lg
          "
        >
          <Plus className="h-5 w-5" />
          Post Lost Item
        </Button>
      </Link>

      <Link to="/post">
        <Button
          size="lg"
          variant="outline"
          className="
            w-full sm:w-auto gap-2 px-8 py-6 text-lg 
            hover:scale-[1.04] transition-transform border-primary/40
          "
        >
          <Package className="h-5 w-5" />
          Post Found Item
        </Button>
      </Link>
    </div>

    {/* SEARCH BOX */}
    <div
      className="
        max-w-3xl mx-auto bg-card rounded-xl shadow-xl p-6
        animate-scale-in animate-delay-400
      "
    >
      <div className="flex flex-col md:flex-row gap-4">

        {/* SEARCH INPUT */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by item name, category, or location..."
            className="pl-10 h-12 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* TYPE FILTER */}
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="w-full md:w-40 h-12 text-base">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="lost">Lost Only</SelectItem>
            <SelectItem value="found">Found Only</SelectItem>
          </SelectContent>
        </Select>

        {/* CATEGORY FILTER */}
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-40 h-12 text-base">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
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


        {/* ITEMS */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Recent Items</h2>
              {loading ? (
                <p className="text-muted-foreground mt-1">Loading items...</p>
              ) : (
                <p className="text-muted-foreground mt-1">
                  {filteredAndSortedItems.length} item
                  {filteredAndSortedItems.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-40">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* GRID */}
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : filteredAndSortedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedItems.map((item, index) => (
                <div
                  key={item._id}
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
                  className="animate-slide-up opacity-0"
                >
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
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No items found</h3>
              <p className="text-muted-foreground">Try adjusting filters or search</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
