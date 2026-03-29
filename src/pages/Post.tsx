import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";

import { compressImage } from "@/utils/imageUtils";
import { api } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Post = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    type: "lost",
    title: "",
    description: "",
    location: "",
    date: "",
    contactName: user?.name || "",
    contactPhone: "",
    contactEmail: user?.email || "",
    category: "", // ✅ IMPORTANT
  });

  const [imagePreview, setImagePreview] = useState("");
  const [imageThumbnail, setImageThumbnail] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);

  /* ---------------- IMAGE ---------------- */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsCompressing(true);

    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed.base64);
      setImageThumbnail(compressed.thumbnail);
      toast.success("Image ready");
    } catch {
      toast.error("Failed to process image");
    } finally {
      setIsCompressing(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to post an item");
      navigate("/auth");
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.date ||
      !formData.contactPhone ||
      !formData.category
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await api.post("/items/create", {
        ...formData,
        image: imagePreview || null,
        thumbnail: imageThumbnail || null,
      });

      toast.success("Item posted successfully ✅");
      setTimeout(() => navigate("/"), 1200);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to post item"
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Inter']">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto relative group">
          
          {/* Decorative glowing blob */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#6200EE] to-[#4af8e3] rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-[#240e3b]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl z-10">
            <div className="mb-10 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-[#4af8e3] text-xs font-bold tracking-widest uppercase mb-4 border border-white/10">
                Secure Submission
              </span>
              <h2 className="text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight mb-2">Item Details</h2>
              <p className="text-purple-200/50">Provide specific metrics for the neural alignment.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* ✅ LOST / FOUND */}
              <div className="bg-[#16052a]/50 p-6 rounded-2xl border border-white/5">
                <Label className="text-white font-bold mb-4 block uppercase tracking-wider text-xs">Mission Type <span className="text-[#ff2e97]">*</span></Label>
                <div className="flex gap-6 mt-3">
                  <div 
                    className={`flex items-center gap-3 p-4 rounded-xl border flex-1 cursor-pointer transition-all ${formData.type === 'lost' ? 'bg-[#ff2e97]/10 border-[#ff2e97] shadow-[0_0_15px_rgba(255,46,151,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                    onClick={() => setFormData({ ...formData, type: 'lost' })}
                  >
                    <div className={`flex items-center justify-center w-4 h-4 rounded-full border ${formData.type === 'lost' ? 'border-[#ff2e97]' : 'border-white/30'}`}>
                      {formData.type === 'lost' && <div className="w-2 h-2 rounded-full bg-[#ff2e97]"></div>}
                    </div>
                    <span className="text-white font-bold">Lost</span>
                  </div>
                  
                  <div 
                    className={`flex items-center gap-3 p-4 rounded-xl border flex-1 cursor-pointer transition-all ${formData.type === 'found' ? 'bg-[#4af8e3]/10 border-[#4af8e3] shadow-[0_0_15px_rgba(74,248,227,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                    onClick={() => setFormData({ ...formData, type: 'found' })}
                  >
                    <div className={`flex items-center justify-center w-4 h-4 rounded-full border ${formData.type === 'found' ? 'border-[#4af8e3]' : 'border-white/30'}`}>
                      {formData.type === 'found' && <div className="w-2 h-2 rounded-full bg-[#4af8e3]"></div>}
                    </div>
                    <span className="text-white font-bold">Found</span>
                  </div>
                </div>
              </div>

              {/* TITLE */}
              <div>
                <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Item Signature (Title) <span className="text-[#ff2e97]">*</span></Label>
                <Input
                  className="bg-[#16052a]/80 border-white/10 text-white h-14 rounded-xl focus-visible:ring-[#b89fff]"
                  placeholder="e.g. Blue Hydro Flask"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Visual Description <span className="text-[#ff2e97]">*</span></Label>
                <Textarea
                  rows={4}
                  className="bg-[#16052a]/80 border-white/10 text-white rounded-xl focus-visible:ring-[#b89fff] resize-none"
                  placeholder="Brand, color, visible scratches..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LOCATION */}
                <div>
                  <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Last Known Sector (Location) <span className="text-[#ff2e97]">*</span></Label>
                  <Input
                    className="bg-[#16052a]/80 border-white/10 text-white h-14 rounded-xl focus-visible:ring-[#b89fff]"
                    placeholder="e.g. BS Narayan Hall"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>

                {/* CATEGORY */}
                <div>
                  <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Category <span className="text-[#ff2e97]">*</span></Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="bg-[#16052a]/80 border-white/10 text-white h-14 rounded-xl focus:ring-[#b89fff]">
                      <SelectValue placeholder="Identify category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#240e3b] border-white/10 text-white">
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="id-card">ID Card</SelectItem>
                      <SelectItem value="bottle">Bottle</SelectItem>
                      <SelectItem value="stationery">Stationery</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* DATE */}
                <div>
                  <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Date of Anomaly <span className="text-[#ff2e97]">*</span></Label>
                  <Input
                    type="date"
                    className="bg-[#16052a]/80 border-white/10 text-white h-14 rounded-xl outline-none focus-visible:ring-[#b89fff] [color-scheme:dark]"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                {/* CONTACT */}
                <div>
                  <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Comm Link (Phone) <span className="text-[#ff2e97]">*</span></Label>
                  <Input
                    className="bg-[#16052a]/80 border-white/10 text-white h-14 rounded-xl focus-visible:ring-[#b89fff]"
                    placeholder="+91..."
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* IMAGE */}
              <div>
                <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Visual Evidence (Optional)</Label>
                {imagePreview ? (
                  <div className="relative group/img rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                    <img
                      src={imagePreview}
                      className="w-full h-48 object-cover group-hover/img:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/40 transition-colors"></div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 rounded-full h-10 w-10 shadow-lg"
                      onClick={() => setImagePreview("")}
                    >
                      <X size={18} />
                    </Button>
                  </div>
                ) : (
                  <label className="border-dashed border-2 border-white/20 hover:border-[#4af8e3] bg-[#16052a]/50 hover:bg-white/5 transition-all p-10 rounded-2xl text-center cursor-pointer block group/upload">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 group-hover/upload:bg-[#4af8e3]/10 transition-all">
                      <Upload className="text-[#4af8e3]" size={24} />
                    </div>
                    <span className="text-white font-bold block mb-1">Upload Image</span>
                    <span className="text-purple-200/50 text-xs">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                      disabled={isCompressing}
                    />
                  </label>
                )}
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#6200EE] to-[#ff2e97] text-white h-16 rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(255,46,151,0.3)] hover:shadow-[0_15px_40px_rgba(255,46,151,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">upload</span>
                  Engage Protocol
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default Post;
