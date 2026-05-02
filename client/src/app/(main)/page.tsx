"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Auction {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  startingPrice: string;
  currentPrice: string;
  buyNowPrice: string | null;
  minIncrement: string;
  depositAmount: string;
  startTime: string;
  endTime: string;
  status: string;
  seller: { name: string; avatar: string | null };
  _count: { bids: number };
}

const CATEGORY_LABELS: Record<string, string> = {
  WATCHES: "Watches", ART: "Fine Art", TECHNOLOGY: "Tech", JEWELRY: "Jewelry",
  FASHION: "Fashion", COLLECTIBLES: "Collectibles", VEHICLES: "Vehicles",
  REAL_ESTATE: "Real Estate", OTHER: "Other",
};

function formatTimeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "ENDED";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickBidLoading, setQuickBidLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [, setTick] = useState(0);

  // Countdown ticker
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch active auctions
  useEffect(() => {
    api.get("/auctions?status=ACTIVE,SCHEDULED,ENDED")
      .then((res) => setAuctions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Toast dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleQuickBid = async (auction: Auction) => {
    if (!user) { router.push("/login"); return; }
    const bidAmount = parseFloat(auction.currentPrice) + parseFloat(auction.minIncrement);
    setQuickBidLoading(auction.id);
    try {
      await api.post("/bids", { auctionId: auction.id, amount: bidAmount });
      setToast({ message: `Bid placed! $${bidAmount.toLocaleString()}`, type: "success" });
      // Refresh
      const res = await api.get("/auctions?status=ACTIVE,SCHEDULED,ENDED");
      setAuctions(res.data);
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || "Failed to place bid", type: "error" });
    } finally {
      setQuickBidLoading(null);
    }
  };

  // Split auctions
  const activeAuctions = auctions.filter((a) => a.status === "ACTIVE");
  const featuredAuction = activeAuctions[0] || null;
  const curatedLots = auctions.slice(0, 8);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 animate-slide-in ${
          toast.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === "success" ? "check_circle" : "error"}</span>
          <span className="font-label-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl w-full mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative animate-fade-in">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-glow" />

        <div className="lg:col-span-5 flex flex-col gap-4 z-10 animate-slide-up">
          <div className="inline-flex items-center gap-1 bg-error-container/20 border border-error/30 px-3 py-1.5 rounded-full w-max backdrop-blur-md animate-bounce-subtle">
            <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <span className="text-error font-label-bold text-sm tracking-widest uppercase">
              {activeAuctions.length > 0 ? `${activeAuctions.length} Live Now` : "Coming Soon"}
            </span>
          </div>

          <h1 className="font-display-auction text-5xl font-extrabold text-on-surface leading-tight">
            Own the <span className="text-secondary italic pr-2">Exceptional.</span>
          </h1>

          <p className="font-body-lg text-lg text-on-surface-variant max-w-md leading-relaxed">
            Gain exclusive access to the world&apos;s most coveted assets.
            Real-time bidding, verified provenance, and uncompromising security.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Link href="/auctions" className="bg-secondary text-on-secondary font-label-bold text-sm px-6 py-4 rounded-full shadow-[0_10px_30px_rgba(238,152,0,0.3)] hover:bg-secondary-fixed hover:scale-105 hover:shadow-[0_15px_35px_rgba(238,152,0,0.4)] transition-all duration-300">
              Start Bidding
            </Link>
            <Link href="/auctions" className="bg-transparent border border-outline text-on-surface font-label-bold text-sm px-6 py-4 rounded-full hover:bg-surface-variant hover:scale-105 transition-all duration-300">
              View Catalog
            </Link>
          </div>
        </div>

        {/* Hero Image + Floating Bid Panel with real data */}
        <div className="lg:col-span-7 relative w-full aspect-[4/3] lg:aspect-auto lg:h-[600px] rounded-xl overflow-hidden group animate-pop-in hover-glow">
          <img
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700"
            alt={featuredAuction?.title || "Gallery X Auction"}
            src={featuredAuction?.images[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuBYHKJal6gtIfWz3Y_Wy1Cy4LbBliFTiWx16aZgOAdqdE2B37BXKyGaq83sZFH1sJm9e3C3XAr4iQ5H9-ejRFxwC2u3B9T9Nmdk1qIp42K6zRLwE58sZg-JAnnuhZm1Bl3efITrkZnxiatxalmyfOSW-o1nGNN0xBmoy0pzLqzi3NeQR49Gwc8Ako3cIVuPIXR6M6V-nk6vNM7FDFubLTM9_DqMGUbbbYgf4VhEpggmU5CrBpKaEKec8nnFQMTbLuZfZMOXP-9Frh8"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

          {featuredAuction && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-surface-container-high/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-float">
              <p className="font-label-bold text-xs text-on-surface-variant mb-1 truncate">{featuredAuction.title}</p>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-label-bold text-sm text-on-surface-variant uppercase tracking-wider">Current Bid</p>
                  <p className="font-price-display text-3xl text-secondary mt-1">${parseFloat(featuredAuction.currentPrice).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-label-bold text-[10px] text-error uppercase tracking-wider">Ends In</p>
                  <p className="font-headline-md text-2xl text-on-surface mt-1 font-mono tracking-tighter animate-pulse-glow">
                    {formatTimeLeft(featuredAuction.endTime)}
                  </p>
                </div>
              </div>
              <div className="h-1 w-full bg-surface-variant rounded-full mt-2 mb-4 overflow-hidden">
                <div className="h-full bg-error rounded-full" style={{
                  width: `${Math.max(5, Math.min(100, 100 - ((new Date(featuredAuction.endTime).getTime() - Date.now()) / (new Date(featuredAuction.endTime).getTime() - new Date(featuredAuction.startTime).getTime())) * 100))}%`
                }} />
              </div>
              <button
                onClick={() => handleQuickBid(featuredAuction)}
                disabled={quickBidLoading === featuredAuction.id}
                className="w-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-label-bold text-sm py-2.5 rounded-lg transition-all flex justify-center items-center gap-1.5 active:scale-[0.97] disabled:opacity-50"
              >
                {quickBidLoading === featuredAuction.id ? (
                  <><div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> Placing...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">gavel</span> Quick Bid ${(parseFloat(featuredAuction.currentPrice) + parseFloat(featuredAuction.minIncrement)).toLocaleString()}</>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-6">The Gallery Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "shield_person", color: "text-primary", glowColor: "bg-primary/5 group-hover:bg-primary/10", title: "1. Register & Verify", desc: "Complete our rigorous vetting process to gain access to the bidding floor. Security and anonymity are guaranteed." },
            { icon: "gavel", color: "text-secondary", glowColor: "bg-secondary/5 group-hover:bg-secondary/10", title: "2. Enter the Floor", desc: "Engage in real-time, high-stakes auctions. Our ultra-low latency platform ensures your bids are executed instantly." },
            { icon: "workspace_premium", color: "text-tertiary", glowColor: "bg-tertiary/5 group-hover:bg-tertiary/10", title: "3. Claim the Asset", desc: "Secure your acquisition. We handle white-glove logistics, provenance transfer, and secure vaulting upon request." },
          ].map((step, idx) => (
            <div key={step.title} className="bg-surface-container rounded-xl p-6 border border-outline-variant hover:border-outline transition-all duration-300 group relative overflow-hidden hover-scale hover-glow animate-slide-up" style={{ animationDelay: `${400 + idx * 150}ms` }}>
              <div className={`absolute -right-8 -top-8 w-32 h-32 ${step.glowColor} rounded-full blur-2xl transition-colors`} />
              <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center mb-4 border border-white/5">
                <span className={`material-symbols-outlined ${step.color} text-2xl`}>{step.icon}</span>
              </div>
              <h3 className="font-headline-md text-2xl font-semibold text-on-surface mb-2">{step.title}</h3>
              <p className="font-body-md text-base text-on-surface-variant">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Lots — Real Data */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in" style={{ animationDelay: '600ms' }}>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Curated Lots</h2>
            <p className="text-on-surface-variant text-sm mt-1">Live and upcoming items from our catalog</p>
          </div>
          <Link href="/auctions" className="font-label-bold text-sm text-secondary hover:text-secondary-fixed transition-colors flex items-center gap-1 hover:translate-x-1 duration-300">
            View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : curatedLots.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">No auctions available yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {curatedLots.map((auction, idx) => (
              <article
                key={auction.id}
                className="bg-surface-container rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 group hover-scale hover-glow animate-slide-up"
                style={{ animationDelay: `${700 + idx * 100}ms` }}
              >
                <Link href={`/auctions/${auction.id}`} className="block relative h-52 w-full bg-surface-dim">
                  <img
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${auction.status === "ENDED" ? "grayscale opacity-70" : ""}`}
                    alt={auction.title}
                    src={auction.images[0] || "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=400"}
                  />
                  {/* Status badge */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {auction.status === "ACTIVE" && (
                      <div className="bg-red-500/90 text-white px-2 py-0.5 rounded flex items-center gap-1 font-label-bold text-[10px] uppercase shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                      </div>
                    )}
                    {auction.status === "SCHEDULED" && (
                      <div className="bg-blue-500/90 text-white px-2 py-0.5 rounded flex items-center gap-1 font-label-bold text-[10px] uppercase shadow">
                        <span className="material-symbols-outlined text-[10px]">schedule</span> Soon
                      </div>
                    )}
                    {auction.status === "ENDED" && (
                      <div className="bg-surface-variant/90 text-on-surface px-2 py-0.5 rounded font-label-bold text-[10px] uppercase shadow">Ended</div>
                    )}
                  </div>
                  {auction.buyNowPrice && auction.status === "ACTIVE" && (
                    <div className="absolute top-2 right-2 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded font-label-bold text-[10px] uppercase shadow">
                      ⚡ Buy Now
                    </div>
                  )}
                </Link>
                <div className={`p-4 flex flex-col gap-2 ${auction.status === "ENDED" ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-label-bold text-tertiary uppercase">{CATEGORY_LABELS[auction.category] || auction.category}</span>
                    <span className="text-[10px] text-on-surface-variant">• {auction._count.bids} bids</span>
                  </div>
                  <Link href={`/auctions/${auction.id}`}>
                    <h3 className="font-body-lg text-base text-on-surface font-semibold truncate hover:text-amber-500 transition-colors">{auction.title}</h3>
                  </Link>
                  {/* Seller */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-outline/20">
                      {auction.seller.avatar ? (
                        <img src={auction.seller.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-[12px] text-on-surface-variant">person</span>
                      )}
                    </div>
                    <span className="text-[10px] text-on-surface-variant">{auction.seller.name}</span>
                  </div>
                  {/* Price & Time */}
                  <div className="flex justify-between items-end mt-1 pt-2 border-t border-white/5">
                    <div>
                      <p className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                        {auction.status === "ENDED" ? "Final" : "Current Bid"}
                      </p>
                      <p className="font-price-display text-lg font-bold text-on-surface leading-none">
                        ${parseFloat(auction.currentPrice).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {auction.status === "ACTIVE" ? (
                        <p className="font-body-md text-error font-mono text-[13px] leading-none">{formatTimeLeft(auction.endTime)}</p>
                      ) : auction.status === "ENDED" ? (
                        <span className="material-symbols-outlined text-outline text-lg">gavel</span>
                      ) : (
                        <p className="text-[11px] text-blue-400">Upcoming</p>
                      )}
                    </div>
                  </div>
                  {/* Action button */}
                  {auction.status === "ACTIVE" && (
                    <button
                      onClick={() => handleQuickBid(auction)}
                      disabled={quickBidLoading === auction.id}
                      className="w-full mt-1 border border-amber-500/60 text-amber-500 py-2 rounded-lg font-label-bold text-sm hover:bg-amber-500/10 transition-colors flex justify-center items-center gap-1.5 active:scale-[0.97] disabled:opacity-50"
                    >
                      {quickBidLoading === auction.id ? (
                        <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">gavel</span>
                          Bid ${(parseFloat(auction.currentPrice) + parseFloat(auction.minIncrement)).toLocaleString()}
                        </>
                      )}
                    </button>
                  )}
                  {auction.status === "SCHEDULED" && (
                    <Link href={`/auctions/${auction.id}`} className="w-full mt-1 border border-blue-500/40 text-blue-400 py-2 rounded-lg font-label-bold text-sm hover:bg-blue-500/10 transition-colors flex justify-center items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">visibility</span> View Details
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
