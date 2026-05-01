"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const CATEGORIES = [
  "WATCHES", "ART", "TECHNOLOGY", "JEWELRY", "FASHION", "COLLECTIBLES", "VEHICLES", "REAL_ESTATE", "OTHER"
];

export default function CreateAuctionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "WATCHES",
    startPrice: "",
    minIncrement: "",
    depositAmount: "",
    startTime: "",
    endTime: ""
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (images.length + filesArray.length > 5) {
        setError("Maximum 5 images allowed");
        return;
      }
      
      setImages((prev) => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setError("");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError("Please upload at least 1 image");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("startPrice", formData.startPrice);
      data.append("minIncrement", formData.minIncrement);
      data.append("depositAmount", formData.depositAmount || String(Number(formData.startPrice) * 0.1));
      data.append("startTime", new Date(formData.startTime).toISOString());
      data.append("endTime", new Date(formData.endTime).toISOString());

      images.forEach((img) => {
        data.append("images", img);
      });

      const response = await api.post("/auctions", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Auction created successfully!");
      router.push(`/auctions/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to create auction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 space-y-8 pb-20">
      <div>
        <h1 className="font-display-auction text-5xl font-extrabold text-on-surface mb-2">Create New Auction</h1>
        <p className="font-body-lg text-lg text-on-surface-variant">List your valuable item on Gallery X.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg font-label-bold text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* 1. Image Upload Section */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant">
          <h2 className="font-headline-md text-xl font-bold text-on-surface mb-4">Item Images</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-outline-variant group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-error text-on-error rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-outline hover:border-tertiary hover:bg-tertiary/5 cursor-pointer flex flex-col items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-3xl mb-2">add_photo_alternate</span>
                <span className="font-label-bold text-xs">Add Image</span>
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
          <p className="font-body-md text-sm text-on-surface-variant">Upload up to 5 images (Max 5MB each).</p>
        </div>

        {/* 2. Details Section */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant space-y-6">
          <h2 className="font-headline-md text-xl font-bold text-on-surface">Item Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Title</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. Vintage 1969 Rolex Daytona"
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-body-md"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Category</label>
              <select 
                required
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-body-md appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.replace("_", " ")}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Description</label>
              <textarea 
                required 
                rows={4}
                placeholder="Describe the condition, history, and authenticity..."
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-body-md"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 3. Pricing Section */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant space-y-6">
          <h2 className="font-headline-md text-xl font-bold text-on-surface">Pricing & Schedule</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Starting Price (USD)</label>
              <input 
                required 
                type="number" min="1"
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-bold"
                value={formData.startPrice}
                onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Minimum Increment (USD)</label>
              <input 
                required 
                type="number" min="1"
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-bold"
                value={formData.minIncrement}
                onChange={(e) => setFormData({ ...formData, minIncrement: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Required Deposit (USD) - Optional</label>
              <input 
                type="number" min="1" placeholder="Defaults to 10% of starting price"
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-bold"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
              />
            </div>
            <div>
              {/* Spacer */}
            </div>
            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Start Time</label>
              <input 
                required 
                type="datetime-local"
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-body-md"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">End Time</label>
              <input 
                required 
                type="datetime-local"
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-body-md"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 border-t border-outline-variant pt-6">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-full font-label-bold text-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-primary text-on-primary px-10 py-3 rounded-full font-label-bold text-sm shadow-[0_10px_30px_rgba(43,212,206,0.3)] hover:bg-primary-fixed transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Publishing..." : "Publish Auction"}
            {!isLoading && <span className="material-symbols-outlined text-[18px]">gavel</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
