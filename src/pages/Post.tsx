import { useState, useEffect } from "react";
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
    contactPhone: user?.phone || "",
    contactEmail: user?.email || "",
    category: "", // ✅ IMPORTANT
    secretDetail: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [imageThumbnail, setImageThumbnail] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ title: string; description: string; category: string } | null>(null);

  // Sync contact info when user state is loaded asynchronously
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        contactName: prev.contactName || user.name || "",
        contactPhone: prev.contactPhone || user.phone || "",
        contactEmail: prev.contactEmail || user.email || "",
      }));
    }
  }, [user]);

  const handleAiExtract = async () => {
    if (!imagePreview) {
      toast.error("Please upload an image first.");
      return;
    }
    setIsAnalyzing(true);
    setAiSuggestions(null);
    try {
      const response = await api.post("/items/analyze-image", {
        image: imagePreview
      });
      setAiSuggestions(response.data);
      toast.success("AI extraction complete! Review suggestions below.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to analyze image with AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAiSuggestions = () => {
    if (!aiSuggestions) return;
    setFormData((prev) => ({
      ...prev,
      title: aiSuggestions.title,
      description: aiSuggestions.description,
      category: aiSuggestions.category,
    }));
    toast.success("AI suggestions applied to form!");
    setAiSuggestions(null);
  };


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

    // Date validation
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      toast.error("Date signature invalid: Future dates are not permitted.");
      return;
    }

    // 10-digit validation
    const cleanPhone = formData.contactPhone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast.error("Comm Link (Phone) must be exactly 10 digits");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/items/create", {
        ...formData,
        image: imagePreview || null,
        thumbnail: imageThumbnail || null,
      });

      toast.success("Item posted successfully ✅");
      setTimeout(() => navigate("/"), 1200);
    } catch (err: any) {
      setIsSubmitting(false); // Only reset on error so button stays disabled on success
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

              {/* SECRET DETAIL (Found only) */}
              {formData.type === "found" && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 border-dashed animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[#4af8e3] text-sm">lock</span>
                    <Label className="text-[#4af8e3] uppercase text-xs font-black tracking-[0.2em]">Secret Validation Detail <span className="text-[#ff2e97]">*</span></Label>
                  </div>
                  <Textarea
                    rows={2}
                    className="bg-black/40 border-white/10 text-white rounded-xl focus-visible:ring-[#4af8e3] resize-none"
                    placeholder="Describe something hidden (e.g., 'wallpaper is a cat', 'yellow sticker at bottom', 'broken left button')"
                    value={formData.secretDetail}
                    onChange={(e) =>
                      setFormData({ ...formData, secretDetail: e.target.value })
                    }
                    required
                  />
                  <p className="text-[10px] text-purple-200/40 mt-3 flex items-start gap-2 italic">
                    <span className="material-symbols-outlined text-[12px] mt-0.5">info</span>
                    This detail is HIDDEN from the public directory. It is used to verify the real owner during a handover request.
                  </p>
                </div>
              )}

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
                  <div className="space-y-6">
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
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 rounded-full h-10 w-10 shadow-lg z-20"
                        onClick={() => {
                          setImagePreview("");
                          setAiSuggestions(null);
                        }}
                      >
                        <X size={18} />
                      </Button>
                    </div>

                    {/* AI EXTRACTION OPTIONS */}
                    <div className="bg-[#16052a]/40 border border-white/5 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[#4af8e3]">psychology</span>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider">AI Image Protocol</h4>
                      </div>
                      <p className="text-xs text-purple-200/50">
                        Scan the uploaded image to automatically detect the item's title, description, and category.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          type="button"
                          onClick={handleAiExtract}
                          disabled={isAnalyzing}
                          className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-black font-bold h-12 rounded-xl transition-all shadow-[0_4px_15px_rgba(20,184,166,0.2)] flex items-center justify-center gap-2"
                        >
                          {isAnalyzing ? (
                            <>
                              <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                              Analyzing Image...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-lg">smart_toy</span>
                              Extract Details with AI
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            toast.info("Manual input protocol active. Please fill details below.");
                            setAiSuggestions(null);
                          }}
                          className="border-white/10 bg-white/5 text-white hover:bg-white/10 h-12 rounded-xl"
                        >
                          Keep Manual Entry
                        </Button>
                      </div>
                    </div>

                    {/* SUGGESTIONS DISPLAY CARD */}
                    {aiSuggestions && (
                      <div className="bg-[#0d1f1c]/90 border border-teal-500/30 rounded-2xl p-6 space-y-4 shadow-[0_0_30px_rgba(20,184,166,0.15)] animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
                          <div className="flex items-center gap-2 text-teal-400">
                            <span className="material-symbols-outlined text-lg">temp_preferences_custom</span>
                            <span className="text-xs font-black tracking-[0.2em] uppercase">AI Scanner Results</span>
                          </div>
                          <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">Suggestions Ready</span>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-[10px] text-teal-400/60 uppercase font-bold tracking-wider block mb-1">Detected Title</span>
                            <div className="text-white bg-black/40 px-3 py-2.5 rounded-lg border border-white/5">{aiSuggestions.title}</div>
                          </div>
                          <div>
                            <span className="text-[10px] text-teal-400/60 uppercase font-bold tracking-wider block mb-1">Detected Category</span>
                            <div className="text-white bg-black/40 px-3 py-2.5 rounded-lg border border-white/5 capitalize">{aiSuggestions.category}</div>
                          </div>
                          <div>
                            <span className="text-[10px] text-teal-400/60 uppercase font-bold tracking-wider block mb-1">Detected Description</span>
                            <div className="text-white bg-black/40 px-3 py-2.5 rounded-lg border border-white/5 max-h-24 overflow-y-auto">{aiSuggestions.description}</div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            type="button"
                            onClick={applyAiSuggestions}
                            className="flex-1 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-black font-bold h-11 rounded-xl shadow-[0_4px_15px_rgba(74,248,227,0.3)]"
                          >
                            Apply suggestions to Form
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setAiSuggestions(null)}
                            className="text-gray-400 hover:text-white hover:bg-white/5 h-11 rounded-xl"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    )}
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
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#6200EE] to-[#ff2e97] text-white h-16 rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(255,46,151,0.3)] hover:shadow-[0_15px_40px_rgba(255,46,151,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">upload</span>
                        Engage Protocol
                      </>
                    )}
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
