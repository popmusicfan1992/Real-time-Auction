"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import CountdownTimer from "@/components/ui/CountdownTimer";

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

interface HomeStats {
  totalBids: number;
  totalVolume: number;
  activeBidders: number;
  recentBids: { userName: string; userAvatar: string | null; amount: number; auctionTitle: string; createdAt: string }[];
  topCollectors: { name: string; avatar: string | null; totalWins: number; totalSpent: number }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  WATCHES: "Watches", ART: "Fine Art", TECHNOLOGY: "Tech", JEWELRY: "Jewelry",
  FASHION: "Fashion", COLLECTIBLES: "Collectibles", VEHICLES: "Vehicles",
  REAL_ESTATE: "Real Estate", OTHER: "Other",
};

const CATEGORY_ICONS: Record<string, string> = {
  ALL: "apps", WATCHES: "watch", ART: "palette", TECHNOLOGY: "devices",
  JEWELRY: "diamond", FASHION: "checkroom", COLLECTIBLES: "star",
  VEHICLES: "directions_car", REAL_ESTATE: "home", OTHER: "category",
};

// formatTimeLeft moved to CountdownTimer component

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickBidLoading, setQuickBidLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // New state for 6 features
  const [homeStats, setHomeStats] = useState<HomeStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [watchlistSet, setWatchlistSet] = useState<Set<string>>(new Set());
  const [watchlistLoading, setWatchlistLoading] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Countdown is now handled by isolated CountdownTimer components
  // This prevents re-rendering the entire page every second

  // Fetch active auctions - limited to recent items for homepage performance
  useEffect(() => {
    api.get("/auctions?status=ACTIVE,SCHEDULED")
      .then((res) => setAuctions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch home stats
  useEffect(() => {
    api.get("/auctions/stats").then((res) => setHomeStats(res.data)).catch(console.error);
  }, []);

  // Fetch user watchlist
  useEffect(() => {
    if (user) {
      api.get("/users/me/watchlist")
        .then((res) => {
          const ids = new Set<string>(res.data.map((w: any) => w.auction.id));
          setWatchlistSet(ids);
        })
        .catch(console.error);
    }
  }, [user]);

  // Check newsletter subscription
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("gallery_newsletter")) {
      setNewsletterSubscribed(true);
    }
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
      const res = await api.get("/auctions?status=ACTIVE,SCHEDULED,ENDED");
      setAuctions(res.data);
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || "Failed to place bid", type: "error" });
    } finally {
      setQuickBidLoading(null);
    }
  };

  const handleToggleWatchlist = async (auctionId: string) => {
    if (!user) { router.push("/login"); return; }
    setWatchlistLoading(auctionId);
    try {
      const res = await api.post("/users/me/watchlist", { auctionId });
      setWatchlistSet((prev) => {
        const next = new Set(prev);
        if (res.data.isWatched) next.add(auctionId); else next.delete(auctionId);
        return next;
      });
      setToast({ message: res.data.message, type: "success" });
    } catch (err: any) {
      setToast({ message: err.response?.data?.message || "Failed", type: "error" });
    } finally {
      setWatchlistLoading(null);
    }
  };

  const handleNewsletter = () => {
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setToast({ message: "Please enter a valid email", type: "error" }); return;
    }
    localStorage.setItem("gallery_newsletter", newsletterEmail);
    setNewsletterSubscribed(true);
    setToast({ message: "Subscribed successfully! 🎉", type: "success" });
    setNewsletterEmail("");
  };

  // Split auctions
  const activeAuctions = auctions.filter((a) => a.status === "ACTIVE");
  const featuredAuction = activeAuctions[0] || null;
  const filteredLots = selectedCategory === "ALL"
    ? auctions.slice(0, 8)
    : auctions.filter((a) => a.category === selectedCategory).slice(0, 8);

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
              {activeAuctions.length > 0 ? `${activeAuctions.length} ${t("home.liveNow")}` : t("home.comingSoon")}
            </span>
          </div>

          <h1 className="font-display-auction text-5xl font-extrabold text-on-surface leading-tight">
            {t("home.heroTitle")} <span className="text-secondary italic pr-2">{t("home.heroTitleHighlight")}</span>
          </h1>

          <p className="font-body-lg text-lg text-on-surface-variant max-w-md leading-relaxed">
            {t("home.heroSubtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Link href="/auctions" className="bg-secondary text-on-secondary font-label-bold text-sm px-6 py-4 rounded-full shadow-[0_10px_30px_rgba(238,152,0,0.3)] hover:bg-secondary-fixed hover:scale-105 hover:shadow-[0_15px_35px_rgba(238,152,0,0.4)] transition-all duration-300">
              {t("home.startBidding")}
            </Link>
            <Link href="/auctions" className="bg-transparent border border-outline text-on-surface font-label-bold text-sm px-6 py-4 rounded-full hover:bg-surface-variant hover:scale-105 transition-all duration-300">
              {t("home.viewCatalog")}
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
                  <p className="font-label-bold text-sm text-on-surface-variant uppercase tracking-wider">{t("home.currentBid")}</p>
                  <p className="font-price-display text-3xl text-secondary mt-1">${parseFloat(featuredAuction.currentPrice).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-label-bold text-[10px] text-error uppercase tracking-wider">{t("home.endsIn")}</p>
                  <CountdownTimer
                    endTime={featuredAuction.endTime}
                    className="font-headline-md text-2xl text-on-surface mt-1 font-mono tracking-tighter animate-pulse-glow block"
                  />
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
                  <><div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> {t("home.placing")}</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">gavel</span> {t("home.quickBid")} ${(parseFloat(featuredAuction.currentPrice) + parseFloat(featuredAuction.minIncrement)).toLocaleString()}</>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== 1. LIVE STATS BAR ===== */}
      {homeStats && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "trending_up", label: t("home.totalBidsPlaced"), value: homeStats.totalBids.toLocaleString(), suffix: "+", color: "from-primary/20 to-primary/5", iconColor: "text-primary" },
              { icon: "payments", label: t("home.totalVolume"), value: `$${(homeStats.totalVolume / 1000).toFixed(1)}K`, suffix: "+", color: "from-secondary/20 to-secondary/5", iconColor: "text-secondary" },
              { icon: "group", label: t("home.activeBidders"), value: homeStats.activeBidders.toLocaleString(), suffix: "+", color: "from-tertiary/20 to-tertiary/5", iconColor: "text-tertiary" },
            ].map((stat, idx) => (
              <div key={stat.label} className="bg-surface-container/80 backdrop-blur-xl border border-white/5 rounded-xl p-5 flex items-center gap-4 hover:border-white/15 transition-all duration-300 group hover-scale animate-count-up" style={{ animationDelay: `${200 + idx * 150}ms` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                  <span className={`material-symbols-outlined ${stat.iconColor} text-2xl`}>{stat.icon}</span>
                </div>
                <div>
                  <p className="text-[11px] font-label-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
                  <p className="font-price-display text-2xl font-bold text-on-surface leading-tight">{stat.value}<span className="text-sm text-on-surface-variant">{stat.suffix}</span></p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== 5. INTERACTIVE HOW IT WORKS ===== */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-6">{t("home.theGalleryProcess")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[calc(33.33%_-_16px)] w-[calc(33.33%_+_32px)] h-0.5 bg-gradient-to-r from-primary/40 via-secondary/40 to-tertiary/40 animate-glow-line z-0" />
          <div className="hidden md:block absolute top-16 left-[calc(66.66%_-_16px)] w-[calc(33.33%_+_32px)] h-0.5 bg-gradient-to-r from-secondary/40 via-tertiary/40 to-tertiary/40 animate-glow-line z-0" style={{ animationDelay: '1s' }} />
          {[
            { icon: "shield_person", color: "text-primary", borderColor: "group-hover:border-primary/40", glowColor: "bg-primary/5 group-hover:bg-primary/15", title: t("home.step1Title"), desc: t("home.step1Desc"), cta: t("home.step1Cta"), ctaHref: "/login", ctaColor: "text-primary border-primary/30 hover:bg-primary/10" },
            { icon: "gavel", color: "text-secondary", borderColor: "group-hover:border-secondary/40", glowColor: "bg-secondary/5 group-hover:bg-secondary/15", title: t("home.step2Title"), desc: t("home.step2Desc"), cta: t("home.step2Cta"), ctaHref: "/auctions", ctaColor: "text-secondary border-secondary/30 hover:bg-secondary/10" },
            { icon: "workspace_premium", color: "text-tertiary", borderColor: "group-hover:border-tertiary/40", glowColor: "bg-tertiary/5 group-hover:bg-tertiary/15", title: t("home.step3Title"), desc: t("home.step3Desc"), cta: t("home.step3Cta"), ctaHref: "/dashboard/profile", ctaColor: "text-tertiary border-tertiary/30 hover:bg-tertiary/10" },
          ].map((step, idx) => (
            <div key={step.title} className="flex flex-col md:px-3 mb-4 md:mb-0">
              <div className={`bg-surface-container rounded-xl p-6 border border-outline-variant ${step.borderColor} transition-all duration-300 group relative overflow-hidden hover-scale hover-glow animate-slide-up z-10 flex flex-col h-full`} style={{ animationDelay: `${400 + idx * 150}ms` }}>
                <div className={`absolute -right-8 -top-8 w-32 h-32 ${step.glowColor} rounded-full blur-2xl transition-colors duration-500`} />
                <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center mb-4 border border-white/5 relative z-10">
                  <span className={`material-symbols-outlined ${step.color} text-2xl`}>{step.icon}</span>
                </div>
                <h3 className="font-headline-md text-xl font-semibold text-on-surface mb-2">{step.title}</h3>
                <p className="font-body-md text-sm text-on-surface-variant mb-4 flex-grow">{step.desc}</p>
                <Link href={step.ctaHref} className={`inline-flex items-center gap-1.5 border ${step.ctaColor} px-4 py-2 rounded-lg font-label-bold text-xs transition-all duration-200 w-max`}>
                  {step.cta} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 2. CATEGORY QUICK FILTERS + CURATED LOTS ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in" style={{ animationDelay: '600ms' }}>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="font-headline-lg text-3xl font-bold text-on-surface">{t("home.curatedLots")}</h2>
            <p className="text-on-surface-variant text-sm mt-1">{t("home.curatedLotsDesc")}</p>
          </div>
          <Link href="/auctions" className="font-label-bold text-sm text-secondary hover:text-secondary-fixed transition-colors flex items-center gap-1 hover:translate-x-1 duration-300">
            {t("home.viewAll")} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Category Tabs */}
        <div ref={categoryScrollRef} className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {["ALL", ...Object.keys(CATEGORY_LABELS)].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-tab flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-label-bold whitespace-nowrap shrink-0 transition-all ${
                selectedCategory === cat
                  ? "category-tab-active"
                  : "border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{CATEGORY_ICONS[cat] || "category"}</span>
              {cat === "ALL" ? t("home.allCategories") : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">{t("auctions.noAuctionsFound")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLots.map((auction, idx) => (
              <article
                key={auction.id}
                className="bg-surface-container rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 group hover-scale hover-glow animate-slide-up"
                style={{ animationDelay: `${700 + idx * 100}ms` }}
              >
                <div className="relative h-52 w-full bg-surface-dim">
                  <Link href={`/auctions/${auction.id}`} className="block w-full h-full">
                    <img
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${auction.status === "ENDED" ? "grayscale opacity-70" : ""}`}
                      alt={auction.title}
                      src={auction.images[0] || "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=400"}
                      loading="lazy"
                    />
                  </Link>
                  {/* Status + Hot badges */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {auction.status === "ACTIVE" && (
                      <div className="bg-red-500/90 text-white px-2 py-0.5 rounded flex items-center gap-1 font-label-bold text-[10px] uppercase shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {t("home.liveNow")}
                      </div>
                    )}
                    {auction.status === "SCHEDULED" && (
                      <div className="bg-blue-500/90 text-white px-2 py-0.5 rounded flex items-center gap-1 font-label-bold text-[10px] uppercase shadow">
                        <span className="material-symbols-outlined text-[10px]">schedule</span> Soon
                      </div>
                    )}
                    {auction.status === "ENDED" && (
                      <div className="bg-surface-variant/90 text-on-surface px-2 py-0.5 rounded font-label-bold text-[10px] uppercase shadow">{t("home.ended")}</div>
                    )}
                    {auction._count.bids >= 5 && auction.status === "ACTIVE" && (
                      <div className="bg-orange-600/90 text-white px-2 py-0.5 rounded font-label-bold text-[10px] uppercase shadow flex items-center gap-0.5">
                        🔥 {t("home.hot")}
                      </div>
                    )}
                  </div>
                  {/* Buy Now badge */}
                  {auction.buyNowPrice && auction.status === "ACTIVE" && (
                    <div className="absolute bottom-2 left-2 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded font-label-bold text-[10px] uppercase shadow">
                      ⚡ Buy Now
                    </div>
                  )}
                  {/* Watchlist button */}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleWatchlist(auction.id); }}
                    disabled={watchlistLoading === auction.id}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 ${
                      watchlistSet.has(auction.id)
                        ? "bg-red-500/30 border-red-500/50 text-red-400 animate-heart-pop"
                        : "bg-black/40 border-white/10 text-white/70 hover:text-red-400 hover:border-red-500/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: watchlistSet.has(auction.id) ? "'FILL' 1" : "'FILL' 0" }}>
                      favorite
                    </span>
                  </button>
                </div>
                <div className={`p-4 flex flex-col gap-2 ${auction.status === "ENDED" ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-label-bold text-tertiary uppercase">{CATEGORY_LABELS[auction.category] || auction.category}</span>
                    <span className="text-[10px] text-on-surface-variant">• {auction._count.bids} {t("home.bids")}</span>
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
                        {auction.status === "ENDED" ? t("home.finalPrice") : t("home.currentBid")}
                      </p>
                      <p className="font-price-display text-lg font-bold text-on-surface leading-none">
                        ${parseFloat(auction.currentPrice).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {auction.status === "ACTIVE" ? (
                        <CountdownTimer endTime={auction.endTime} className="font-body-md text-error font-mono text-[13px] leading-none" />
                      ) : auction.status === "ENDED" ? (
                        <span className="material-symbols-outlined text-outline text-lg">gavel</span>
                      ) : (
                        <p className="text-[11px] text-blue-400">{t("home.upcoming")}</p>
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
                          {t("home.quickBid")} ${(parseFloat(auction.currentPrice) + parseFloat(auction.minIncrement)).toLocaleString()}
                        </>
                      )}
                    </button>
                  )}
                  {auction.status === "SCHEDULED" && (
                    <Link href={`/auctions/${auction.id}`} className="w-full mt-1 border border-blue-500/40 text-blue-400 py-2 rounded-lg font-label-bold text-sm hover:bg-blue-500/10 transition-colors flex justify-center items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">visibility</span> {t("home.viewDetails")}
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ===== TOP COLLECTORS & RECENT ACTIVITY ===== */}
      {homeStats && (homeStats.topCollectors.length > 0 || homeStats.recentBids.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in" style={{ animationDelay: '800ms' }}>
          <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-6">{t("home.community")}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Collectors */}
            <div className="bg-surface-container rounded-xl border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-secondary text-2xl">emoji_events</span>
                <h3 className="font-headline-md text-xl font-semibold text-on-surface">{t("home.topCollectors")}</h3>
              </div>
              {homeStats.topCollectors.length === 0 ? (
                <p className="text-on-surface-variant text-sm">{t("home.noDataYet")}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {homeStats.topCollectors.map((collector, idx) => (
                    <div key={collector.name + idx} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-high/50 transition-colors">
                      <span className={`font-price-display text-lg font-bold w-6 text-center ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-700' : 'text-on-surface-variant'}`}>
                        {idx + 1}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                        {collector.avatar ? (
                          <img src={collector.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant">person</span>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-label-bold text-sm text-on-surface truncate">{collector.name}</p>
                        <p className="text-[11px] text-on-surface-variant">{collector.totalWins} {t("home.wins")}</p>
                      </div>
                      <p className="font-price-display text-sm font-bold text-secondary shrink-0">
                        ${collector.totalSpent.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-surface-container rounded-xl border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-tertiary text-2xl">bolt</span>
                <h3 className="font-headline-md text-xl font-semibold text-on-surface">{t("home.liveActivity")}</h3>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-green-400 font-label-bold uppercase">{t("home.live")}</span>
                </div>
              </div>
              {homeStats.recentBids.length === 0 ? (
                <p className="text-on-surface-variant text-sm">{t("home.noRecentActivity")}</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {homeStats.recentBids.map((bid, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low/50 animate-ticker-item" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                        {bid.userAvatar ? (
                          <img src={bid.userAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm text-on-surface truncate">
                          <span className="font-label-bold">{bid.userName}</span>
                          {` ${t("home.bid")} `}
                          <span className="text-secondary font-label-bold">${bid.amount.toLocaleString()}</span>
                        </p>
                        <p className="text-[11px] text-on-surface-variant truncate">{t("home.on")} {bid.auctionTitle}</p>
                      </div>
                      <span className="text-[10px] text-on-surface-variant whitespace-nowrap shrink-0">{timeAgo(bid.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== NEWS & EDITORIAL ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in" style={{ animationDelay: '900ms' }}>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-lg text-3xl font-bold text-on-surface">{t("home.journalTitle")}</h2>
            <p className="text-on-surface-variant text-sm mt-1">{t("home.journalSubtitle")}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              slug: "heritage-watches-2026",
              img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=600",
              tag: t("home.article1Tag"),
              tagColor: "text-secondary",
              title: t("home.article1Title"),
              excerpt: t("home.article1Excerpt"),
              date: "Apr 28, 2026",
              readTime: `5 ${t("home.minRead")}`,
            },
            {
              slug: "modern-art-investment",
              img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600",
              tag: t("home.article2Tag"),
              tagColor: "text-primary",
              title: t("home.article2Title"),
              excerpt: t("home.article2Excerpt"),
              date: "Apr 25, 2026",
              readTime: `7 ${t("home.minRead")}`,
            },
            {
              slug: "classic-cars-future",
              img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=600",
              tag: t("home.article3Tag"),
              tagColor: "text-tertiary",
              title: t("home.article3Title"),
              excerpt: t("home.article3Excerpt"),
              date: "Apr 22, 2026",
              readTime: `6 ${t("home.minRead")}`,
            },
          ].map((article, idx) => (
            <Link 
              key={idx} 
              href={`/journal/${article.slug}`}
              className="bg-surface-container rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 group hover-scale hover-glow animate-slide-up flex flex-col cursor-pointer" 
              style={{ animationDelay: `${950 + idx * 100}ms` }}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={article.title}
                  src={article.img}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className={`font-label-bold text-[10px] ${article.tagColor} uppercase tracking-wider bg-surface-container/80 backdrop-blur-sm px-2 py-1 rounded`}>
                    {article.tag}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3 flex-grow">
                <h3 className="font-headline-md text-lg font-semibold text-on-surface leading-snug group-hover:text-secondary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed line-clamp-3 flex-grow">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {article.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== NEWSLETTER SUBSCRIPTION ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full animate-fade-in" style={{ animationDelay: '1000ms' }}>
        <div className="relative rounded-2xl overflow-hidden animate-newsletter-glow">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low" />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-transparent to-primary/10" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-8 md:p-12">
            <div className="flex-grow text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-secondary/15 border border-secondary/25 px-3 py-1 rounded-full mb-3">
                <span className="material-symbols-outlined text-secondary text-[16px]">mail</span>
                <span className="font-label-bold text-[11px] text-secondary uppercase tracking-wider">{t("home.exclusiveAccess")}</span>
              </div>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface mb-2">
                {t("home.beFirstToKnow")}
              </h2>
              <p className="font-body-md text-sm text-on-surface-variant max-w-lg">
                {t("home.newsletterDesc")}
              </p>
            </div>
            <div className="w-full md:w-auto shrink-0">
              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-400 px-6 py-4 rounded-xl">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span className="font-label-bold text-sm">{t("home.youreSubscribed")}</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder={t("home.enterEmail")}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNewsletter()}
                    className="bg-surface-container-lowest/60 border border-outline-variant text-on-surface px-4 py-3 rounded-xl font-body-md text-sm placeholder:text-outline focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/30 transition-all min-w-[260px]"
                  />
                  <button
                    onClick={handleNewsletter}
                    className="bg-secondary text-on-secondary font-label-bold text-sm px-6 py-3 rounded-xl shadow-[0_8px_24px_rgba(238,152,0,0.3)] hover:bg-secondary-fixed hover:scale-105 hover:shadow-[0_12px_28px_rgba(238,152,0,0.4)] transition-all duration-300 whitespace-nowrap"
                  >
                    {t("home.subscribeNow")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
