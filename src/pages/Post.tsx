import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Sparkles, FileText, Camera, RefreshCw } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Post = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [postMode, setPostMode] = useState<"ai" | "manual">("ai");

  const [formData, setFormData] = useState({
    type: "lost",
    title: "",
    description: "",
    location: "",
    date: new Date().toISOString().split("T")[0], // Default to today's date
    contactName: user?.name || "",
    contactPhone: user?.phone || "",
    contactEmail: user?.email || "",
    category: "",
    secretDetail: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [imageThumbnail, setImageThumbnail] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiProvider, setAiProvider] = useState<"gemini" | "groq">("gemini");

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

  const triggerDirectAiExtract = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const response = await api.post("/items/analyze-image", {
        image: base64Image
      });
      const data = response.data;
      if (data.needsManualEntry) {
        toast.warning(data.message || "AI scan unavailable. Please fill fields manually.");
        return;
      }
      if (data.provider) {
        setAiProvider(data.provider);
      }
      setFormData((prev) => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        category: data.category || prev.category,
      }));
      toast.success(`${data.provider === "groq" ? "Groq" : "Gemini"} scan complete! Details populated.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "AI scanner failed. Please input manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ---------------- IMAGE ---------------- */
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // AI scan endpoint requires JWT; don't call it for logged-out users
    if (postMode === "ai" && !isAuthenticated) {
      toast.error("Please login first to use AI scan.");
      navigate("/auth");
      return;
    }

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
      if (postMode === "ai") {
        await triggerDirectAiExtract(compressed.base64);
      }
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

  const handleResetMode = () => {
    setImagePreview("");
    setImageThumbnail("");
    setFormData((prev) => ({
      ...prev,
      title: "",
      description: "",
      category: "",
      secretDetail: "",
    }));
  };

  return (
    <div className="min-h-screen flex flex-col font-['Inter']">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto relative group">
          
          {/* Decorative glowing blob */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#6200EE] to-[#4af8e3] rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-[#240e3b]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 sm:p-12 shadow-2xl z-10">
            <div className="mb-8 text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-[#4af8e3] text-xs font-bold tracking-widest uppercase mb-4 border border-white/10">
                Secure Submission
              </span>
              <h2 className="text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight mb-2">Item Details</h2>
              <p className="text-purple-200/50">Provide specific metrics for the neural alignment.</p>
            </div>

            {/* MODE SELECTOR - Super Prominent Tabs */}
            <div className="flex gap-4 mb-8 bg-[#16052a]/50 p-2 rounded-2xl border border-white/5">
              <button
                type="button"
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 ${
                  postMode === "ai"
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-black shadow-[0_4px_15px_rgba(20,184,166,0.3)]"
                    : "text-purple-200/60 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => {
                  setPostMode("ai");
                  handleResetMode();
                }}
              >
                <Sparkles size={16} />
                AI Post (Snap Photo)
              </button>
              <button
                type="button"
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2.5 ${
                  postMode === "manual"
                    ? "bg-gradient-to-r from-[#6200EE] to-[#ff2e97] text-white shadow-[0_4px_15px_rgba(98,0,238,0.3)]"
                    : "text-purple-200/60 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => {
                  setPostMode("manual");
                  handleResetMode();
                }}
              >
                <FileText size={16} />
                Normal Post (Manual)
              </button>
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

              {/* AI MODE: CHOOSE PHOTO FIRST FLOW */}
              {postMode === "ai" && (
                <div className="space-y-8">
                  {/* Image Uploader Card */}
                  <div>
                    <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-3 block">Visual Evidence (Required for AI Scan) <span className="text-[#ff2e97]">*</span></Label>
                    {imagePreview ? (
                      <div className="relative group/img rounded-2xl overflow-hidden border border-white/10 shadow-xl animate-in fade-in zoom-in-95 duration-300">
                        <img
                          src={imagePreview}
                          className="w-full h-56 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20"></div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 rounded-full h-10 w-10 shadow-lg z-20"
                          onClick={handleResetMode}
                        >
                          <X size={18} />
                        </Button>
                      </div>
                    ) : (
                      <label className="border-dashed border-2 border-white/20 hover:border-teal-400 bg-[#16052a]/50 hover:bg-white/5 transition-all p-12 rounded-2xl text-center cursor-pointer block group/upload">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 group-hover/upload:bg-teal-500/10 transition-all">
                          <Camera className="text-teal-400" size={24} />
                        </div>
                        <span className="text-white font-bold block mb-1">Capture or Select Image</span>
                        <span className="text-purple-200/50 text-xs">AI will automatically analyze and fill out the details</span>
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleImageChange}
                          disabled={isCompressing || isAnalyzing}
                        />
                      </label>
                    )}
                  </div>

                  {/* AI Scanning progress visualization */}
                  {isAnalyzing && (
                    <div className="bg-teal-950/20 border border-teal-500/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4 animate-pulse">
                      <RefreshCw className="text-teal-400 h-8 w-8 animate-spin" />
                      <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider">AI Quantum Scanner Engaged</h4>
                        <p className="text-xs text-teal-300/60 mt-1">Extracting descriptors and aligning category indexes...</p>
                      </div>
                    </div>
                  )}

                  {/* If image is uploaded and scan completed, show the prefilled forms */}
                  {imagePreview && !isAnalyzing && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                      
                      <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-4 flex items-center gap-3">
                        <Sparkles className="text-teal-400 h-5 w-5 flex-shrink-0 animate-pulse" />
                        <span className="text-xs text-teal-300/80 font-semibold">
                          {aiProvider === "groq" ? "Groq AI" : "Gemini"} Scanner successfully populated the parameters below. Please verify and refine.
                        </span>
                      </div>

                      {/* TITLE */}
                      <div>
                        <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Item Signature (Title) <span className="text-[#ff2e97]">*</span></Label>
                        <Input
                          className="bg-[#16052a]/80 border-white/10 text-white h-14 rounded-xl focus-visible:ring-teal-400"
                          placeholder="Enter title"
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
                          className="bg-[#16052a]/80 border-white/10 text-white rounded-xl focus-visible:ring-teal-400 resize-none"
                          placeholder="Enter description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* CATEGORY */}
                        <div>
                          <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Category <span className="text-[#ff2e97]">*</span></Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category: value })
                            }
                          >
                            <SelectTrigger className="bg-[#16052a]/80 border-white/10 text-white h-14 rounded-xl focus:ring-teal-400">
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

                        {/* LOCATION */}
                        <div>
                          <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Last Known Sector (Location) <span className="text-[#ff2e97]">*</span></Label>
                          <Input
                            className="bg-[#16052a]/80 border-white/10 text-white h-14 rounded-xl focus-visible:ring-teal-400"
                            placeholder="e.g. BS Narayan Hall"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* SECRET DETAIL (Found only) */}
                      {formData.type === "found" && (
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 border-dashed">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-[#4af8e3] text-sm">lock</span>
                            <Label className="text-[#4af8e3] uppercase text-xs font-black tracking-[0.2em]">Secret Validation Detail <span className="text-[#ff2e97]">*</span></Label>
                          </div>
                          <Textarea
                            rows={2}
                            className="bg-black/40 border-white/10 text-white rounded-xl focus-visible:ring-[#4af8e3] resize-none"
                            placeholder="Describe something hidden (e.g., wallet contents, sticker, etc.)"
                            value={formData.secretDetail}
                            onChange={(e) =>
                              setFormData({ ...formData, secretDetail: e.target.value })
                            }
                            required
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* DATE */}
                        <div>
                          <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Date of Anomaly <span className="text-[#ff2e97]">*</span></Label>
                          <Input
                            type="date"
                            className="bg-[#16052a]/80 border-white/10 text-white h-14 rounded-xl outline-none focus-visible:ring-teal-400 [color-scheme:dark]"
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
                            className="bg-[#16052a]/80 border-white/10 text-white h-14 rounded-xl focus-visible:ring-teal-400"
                            placeholder="+91..."
                            value={formData.contactPhone}
                            onChange={(e) =>
                              setFormData({ ...formData, contactPhone: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MANUAL MODE FLOW */}
              {postMode === "manual" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
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
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 border-dashed">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[#4af8e3] text-sm">lock</span>
                        <Label className="text-[#4af8e3] uppercase text-xs font-black tracking-[0.2em]">Secret Validation Detail <span className="text-[#ff2e97]">*</span></Label>
                      </div>
                      <Textarea
                        rows={2}
                        className="bg-black/40 border-white/10 text-white rounded-xl focus-visible:ring-[#4af8e3] resize-none"
                        placeholder="Describe something hidden"
                        value={formData.secretDetail}
                        onChange={(e) =>
                          setFormData({ ...formData, secretDetail: e.target.value })
                        }
                        required
                      />
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

                  {/* IMAGE UPLOAD (OPTIONAL) */}
                  <div>
                    <Label className="text-purple-200 uppercase text-xs font-bold tracking-wider mb-2 block">Visual Evidence (Optional)</Label>
                    {imagePreview ? (
                      <div className="relative group/img rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                        <img
                          src={imagePreview}
                          className="w-full h-48 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 rounded-full h-10 w-10 shadow-lg z-20"
                          onClick={() => {
                            setImagePreview("");
                            setImageThumbnail("");
                          }}
                        >
                          <X size={18} />
                        </Button>
                      </div>
                    ) : (
                      <label className="border-dashed border-2 border-white/20 hover:border-[#b89fff] bg-[#16052a]/50 hover:bg-white/5 transition-all p-10 rounded-2xl text-center cursor-pointer block group/upload">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 transition-all">
                          <Upload className="text-[#b89fff]" size={24} />
                        </div>
                        <span className="text-white font-bold block mb-1">Upload Image</span>
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
                </div>
              )}

              {/* Submit trigger (Only render if manual or if AI scanning is done and image is present) */}
              {(postMode === "manual" || (postMode === "ai" && imagePreview && !isAnalyzing)) && (
                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#6200EE] to-[#ff2e97] text-white h-16 rounded-2xl font-bold text-lg shadow-[0_10px_30px_rgba(255,46,151,0.3)] hover:shadow-[0_15px_40px_rgba(255,46,151,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
              )}

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
