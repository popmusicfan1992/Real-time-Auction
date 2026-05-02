"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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

interface AuctionCounts {
  total: number;
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  WATCHES: "Watches",
  ART: "Fine Art",
  TECHNOLOGY: "Tech & Gadgets",
  JEWELRY: "Jewelry",
  FASHION: "Fashion",
  COLLECTIBLES: "Collectibles",
  VEHICLES: "Vehicles",
  REAL_ESTATE: "Real Estate",
  OTHER: "Other",
};

const STATUS_MAP: Record<string, string> = {
  "Live Now": "ACTIVE",
  Upcoming: "SCHEDULED",
  Ended: "ENDED",
};

function formatTimeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "ENDED";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (hours > 0) return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function formatStartsIn(startTime: string): string {
  const diff = new Date(startTime).getTime() - Date.now();
  if (diff <= 0) return "Starting...";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `Starts in ${days}d ${hours}h`;
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `Starts in ${hours}h ${minutes}m`;
}

export default function AuctionsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [counts, setCounts] = useState<AuctionCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"live" | "upcoming">("live");
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set(["ACTIVE"]));
  const [quickBidLoading, setQuickBidLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [, setTick] = useState(0); // for countdown re-renders

  // Countdown ticker - updates every second
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch counts
  useEffect(() => {
    api.get("/auctions/counts").then((res) => setCounts(res.data)).catch(console.error);
  }, []);

  // Fetch auctions whenever filters change
  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Use statusFilters set for multi-status filtering
      if (statusFilters.size > 0) {
        params.set("status", Array.from(statusFilters).join(","));
      }

      if (activeCategory !== "ALL") {
        params.set("category", activeCategory);
      }

      const res = await api.get(`/auctions?${params.toString()}`);
      setAuctions(res.data);
    } catch (err) {
      console.error("Failed to fetch auctions:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilters, activeCategory]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle tab change (shortcut for status filters)
  const handleTabChange = (tab: "live" | "upcoming") => {
    setActiveTab(tab);
    // Tabs are shortcuts: set the corresponding status filter
    if (tab === "live") {
      setStatusFilters(new Set(["ACTIVE"]));
    } else {
      setStatusFilters(new Set(["SCHEDULED"]));
    }
  };

  // Handle status checkbox change (supports multi-select)
  const handleStatusToggle = (statusLabel: string) => {
    const statusEnum = STATUS_MAP[statusLabel];
    const newFilters = new Set(statusFilters);
    if (newFilters.has(statusEnum)) {
      // Don't allow deselecting all filters
      if (newFilters.size > 1) {
        newFilters.delete(statusEnum);
      }
    } else {
      newFilters.add(statusEnum);
    }
    setStatusFilters(newFilters);

    // Sync tab indicator with the selected statuses
    if (newFilters.has("ACTIVE") && !newFilters.has("SCHEDULED")) {
      setActiveTab("live");
    } else if (newFilters.has("SCHEDULED") && !newFilters.has("ACTIVE")) {
      setActiveTab("upcoming");
    }
    // If both or neither match a single tab, keep the current tab highlight
  };

  // Quick Bid handler
  const handleQuickBid = async (auction: Auction) => {
    if (!user) {
      router.push("/login");
      return;
    }

    const bidAmount = parseFloat(auction.currentPrice) + parseFloat(auction.minIncrement);
    setQuickBidLoading(auction.id);

    try {
      await api.post("/bids", {
        auctionId: auction.id,
        amount: bidAmount,
      });
      setToast({ message: `Bid placed! $${bidAmount.toLocaleString()}`, type: "success" });
      // Refresh auctions to get updated prices
      fetchAuctions();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to place bid";
      setToast({ message: msg, type: "error" });
    } finally {
      setQuickBidLoading(null);
    }
  };

  // Build categories list from counts
  const categoryList = [
    { key: "ALL", label: "All Categories", count: counts?.total ?? 0 },
    ...Object.entries(CATEGORY_LABELS)
      .map(([key, label]) => ({
        key,
        label,
        count: counts?.byCategory.find((c) => c.category === key)?.count ?? 0,
      }))
      .filter((c) => c.count > 0),
  ];

  // Get first ACTIVE auction as featured (show featured card when active auctions are visible)
  const firstActive = auctions.find((a) => a.status === "ACTIVE");
  const featured = firstActive && statusFilters.has("ACTIVE") ? firstActive : null;
  const standardItems = featured ? auctions.filter((a) => a.id !== featured.id) : auctions;

  return (
    <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row gap-8">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 animate-slide-in ${
            toast.type === "success"
              ? "bg-green-500/20 border-green-500/30 text-green-400"
              : "bg-red-500/20 border-red-500/30 text-red-400"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-label-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Left Sidebar (Filters) */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-28 space-y-8">
          <div>
            <h3 className="font-headline-md text-2xl font-semibold text-on-surface mb-6">Categories</h3>
            <ul className="space-y-2">
              {categoryList.map((cat) => (
                <li key={cat.key}>
                  <button
                    onClick={() => setActiveCategory(cat.key)}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-lg font-label-bold text-sm transition-colors ${
                      activeCategory === cat.key
                        ? "bg-surface-container-high text-amber-500 border-l-2 border-amber-500"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-xs text-on-surface-variant">{cat.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-headline-md text-2xl font-semibold text-on-surface mb-6">Status</h3>
            <div className="space-y-3">
              {Object.keys(STATUS_MAP).map((statusLabel) => {
                const statusEnum = STATUS_MAP[statusLabel];
                const statusCount = counts?.byStatus.find((s) => s.status === statusEnum)?.count ?? 0;
                return (
                  <label key={statusLabel} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={statusFilters.has(statusEnum)}
                      onChange={() => handleStatusToggle(statusLabel)}
                      className="h-5 w-5 rounded border-outline bg-surface-container text-tertiary focus:ring-tertiary accent-amber-500"
                    />
                    <span className="font-body-md text-base text-on-surface-variant group-hover:text-on-surface transition-colors flex-grow">
                      {statusLabel}
                    </span>
                    <span className="text-xs text-on-surface-variant">{statusCount}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Right Content Area */}
      <div className="flex-grow space-y-8">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant pb-4 animate-fade-in">
          <div>
            <h1 className="font-display-auction text-5xl font-extrabold text-on-surface mb-2">Explore Catalog</h1>
            <p className="font-body-lg text-lg text-on-surface-variant">Discover extraordinary items from around the globe.</p>
          </div>
          <div className="flex bg-surface-container-high rounded-lg p-1">
            <button
              onClick={() => handleTabChange("live")}
              className={`px-6 py-2 rounded-md font-label-bold text-sm flex items-center gap-2 transition-colors ${
                activeTab === "live" ? "bg-surface-variant text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Now
            </button>
            <button
              onClick={() => handleTabChange("upcoming")}
              className={`px-6 py-2 rounded-md font-label-bold text-sm transition-colors ${
                activeTab === "upcoming" ? "bg-surface-variant text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Upcoming
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        {counts && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
            <div className="bg-surface-container rounded-lg p-3 border border-outline-variant/50 hover-glow">
              <p className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-wider">Total Auctions</p>
              <p className="font-price-display text-2xl text-on-surface">{counts.total}</p>
            </div>
            <div className="bg-surface-container rounded-lg p-3 border border-outline-variant/50 hover-glow">
              <p className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-wider">🔴 Active Now</p>
              <p className="font-price-display text-2xl text-red-400">{counts.byStatus.find(s => s.status === "ACTIVE")?.count ?? 0}</p>
            </div>
            <div className="bg-surface-container rounded-lg p-3 border border-outline-variant/50 hover-glow">
              <p className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-wider">📅 Upcoming</p>
              <p className="font-price-display text-2xl text-blue-400">{counts.byStatus.find(s => s.status === "SCHEDULED")?.count ?? 0}</p>
            </div>
            <div className="bg-surface-container rounded-lg p-3 border border-outline-variant/50 hover-glow">
              <p className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-wider">✅ Completed</p>
              <p className="font-price-display text-2xl text-tertiary">{counts.byStatus.find(s => s.status === "ENDED")?.count ?? 0}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-on-surface-variant font-label-bold text-sm">Loading auctions...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && auctions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30">search_off</span>
            <h3 className="font-headline-md text-2xl text-on-surface-variant">No auctions found</h3>
            <p className="text-on-surface-variant/60 text-sm">
              {activeTab === "live" ? "No live auctions right now. Check upcoming!" : "No upcoming auctions scheduled."}
            </p>
            <button
              onClick={() => handleTabChange(activeTab === "live" ? "upcoming" : "live")}
              className="mt-2 px-6 py-2 border border-amber-500 text-amber-500 rounded-lg font-label-bold text-sm hover:bg-amber-500/10 transition-colors"
            >
              View {activeTab === "live" ? "Upcoming" : "Live"} Auctions
            </button>
          </div>
        )}

        {/* Catalog Grid */}
        {!loading && auctions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Featured Card (only for Live tab) */}
            {featured && (
              <div className="lg:col-span-2 bg-surface-container-high/40 backdrop-blur-sm border border-outline/10 rounded-xl overflow-hidden group relative flex flex-col md:flex-row hover:border-outline/30 transition-all animate-pop-in hover-glow">
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <div className="bg-red-500/90 text-white px-3 py-1 rounded-full flex items-center gap-2 font-label-bold text-[12px] shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ACTIVE
                  </div>
                  <div className="bg-surface-container-high/80 backdrop-blur border border-outline/30 text-on-surface px-3 py-1 rounded-full flex items-center gap-1 font-label-bold text-[12px]">
                    <span className="material-symbols-outlined text-[14px] text-blue-400">verified_user</span>
                    Verified
                  </div>
                </div>
                <Link href={`/auctions/${featured.id}`} className="w-full md:w-3/5 h-64 md:h-96 relative overflow-hidden bg-surface-container block">
                  <img alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={featured.images[0]} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                </Link>
                <div className="w-full md:w-2/5 p-6 flex flex-col justify-between bg-surface-container-high/50">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-label-bold text-on-surface-variant uppercase tracking-wider border border-outline/30 px-2 py-0.5 rounded">
                        {featured._count.bids} bids
                      </span>
                      <span className="text-xs font-label-bold text-tertiary uppercase tracking-wider">
                        {CATEGORY_LABELS[featured.category] || featured.category}
                      </span>
                    </div>
                    <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-2 leading-tight">{featured.title}</h2>
                    <p className="font-body-md text-base text-on-surface-variant line-clamp-2">{featured.description}</p>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-end border-b border-outline/20 pb-4">
                      <div>
                        <p className="font-label-bold text-sm text-on-surface-variant mb-1">Current Bid</p>
                        <p className="font-price-display text-3xl text-secondary-container">
                          ${parseFloat(featured.currentPrice).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-label-bold text-sm text-on-surface-variant mb-1">Ends In</p>
                        <p className="font-headline-md text-2xl text-red-400 font-mono">{formatTimeLeft(featured.endTime)}</p>
                      </div>
                    </div>
                    <Link
                      href={`/auctions/${featured.id}`}
                      className="w-full bg-amber-500 text-slate-950 py-4 rounded-lg font-bold text-lg hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)] flex justify-center items-center gap-2"
                    >
                      Bid ${(parseFloat(featured.currentPrice) + parseFloat(featured.minIncrement)).toLocaleString()}
                      <span className="material-symbols-outlined text-[20px]">gavel</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Cards */}
            {standardItems.map((auction) => (
              <div
                key={auction.id}
                className="bg-surface-container-high/40 backdrop-blur-sm border border-outline/10 rounded-xl overflow-hidden group flex flex-col hover:border-outline/30 transition-all hover-scale hover-glow animate-fade-in"
              >
                <Link href={`/auctions/${auction.id}`} className="relative h-64 overflow-hidden bg-surface-container block">
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    {auction.status === "ACTIVE" ? (
                      <div className="bg-red-500/90 text-white px-2 py-1 rounded flex items-center gap-1.5 font-label-bold text-[10px] uppercase shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Live
                      </div>
                    ) : auction.status === "SCHEDULED" ? (
                      <div className="bg-blue-500/90 text-white px-2 py-1 rounded flex items-center gap-1.5 font-label-bold text-[10px] uppercase shadow">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        Upcoming
                      </div>
                    ) : (
                      <div className="bg-surface-variant/90 text-on-surface px-2 py-1 rounded flex items-center gap-1.5 font-label-bold text-[10px] uppercase shadow">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                        Ended
                      </div>
                    )}
                  </div>
                  <img
                    alt={auction.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
                      auction.status === "ENDED" ? "grayscale opacity-70" : ""
                    }`}
                    src={auction.images[0] || "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080"}
                  />
                </Link>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-wider border border-outline/30 px-1.5 py-0.5 rounded">
                        {auction._count.bids} bids
                      </span>
                      <span className="text-[10px] font-label-bold text-tertiary uppercase tracking-wider">
                        {CATEGORY_LABELS[auction.category] || auction.category}
                      </span>
                      {auction.buyNowPrice && auction.status === "ACTIVE" && (
                        <span className="text-[10px] font-label-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded">
                          ⚡ Buy Now
                        </span>
                      )}
                    </div>
                    <Link href={`/auctions/${auction.id}`}>
                      <h3 className="font-headline-md text-2xl font-semibold text-on-surface leading-snug line-clamp-2 hover:text-amber-500 transition-colors">
                        {auction.title}
                      </h3>
                    </Link>
                    <p className="font-body-md text-sm text-on-surface-variant line-clamp-2 mt-1.5">{auction.description}</p>
                    {/* Seller info */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-outline/20">
                        {auction.seller.avatar ? (
                          <img src={auction.seller.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                        )}
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-label-bold">{auction.seller.name}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="font-label-bold text-xs text-on-surface-variant mb-0.5">
                          {auction.status === "ENDED" ? "Final Price" : "Current Bid"}
                        </p>
                        <p className="font-price-display text-2xl text-secondary-container">
                          ${parseFloat(auction.currentPrice).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {auction.status === "ACTIVE" ? (
                          <>
                            <p className="font-label-bold text-xs text-on-surface-variant mb-0.5">Ends In</p>
                            <p className="font-headline-md text-xl text-red-400 font-mono">{formatTimeLeft(auction.endTime)}</p>
                          </>
                        ) : auction.status === "SCHEDULED" ? (
                          <>
                            <p className="font-label-bold text-xs text-on-surface-variant mb-0.5">Starts</p>
                            <p className="font-headline-md text-sm text-blue-400">{formatStartsIn(auction.startTime)}</p>
                          </>
                        ) : (
                          <span className="material-symbols-outlined text-outline text-2xl">gavel</span>
                        )}
                      </div>
                    </div>
                    {/* Extra info row */}
                    <div className="flex justify-between items-center mb-3 text-[11px] text-on-surface-variant border-t border-outline/10 pt-2">
                      <span>Start: ${parseFloat(auction.startingPrice).toLocaleString()}</span>
                      <span>Deposit: ${parseFloat(auction.depositAmount).toLocaleString()}</span>
                      {auction.buyNowPrice && <span className="text-amber-400">Buy Now: ${parseFloat(auction.buyNowPrice).toLocaleString()}</span>}
                    </div>

                    {auction.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleQuickBid(auction)}
                        disabled={quickBidLoading === auction.id}
                        className="w-full border border-amber-500 text-amber-500 py-3 rounded-lg font-bold hover:bg-amber-500/10 transition-colors flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {quickBidLoading === auction.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                            Placing bid...
                          </>
                        ) : (
                          <>
                            Quick Bid ${(parseFloat(auction.currentPrice) + parseFloat(auction.minIncrement)).toLocaleString()}
                          </>
                        )}
                      </button>
                    ) : auction.status === "SCHEDULED" ? (
                      <Link
                        href={`/auctions/${auction.id}`}
                        className="w-full border border-blue-500/50 text-blue-400 py-3 rounded-lg font-bold hover:bg-blue-500/10 transition-colors flex justify-center items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">notifications</span>
                        View Details
                      </Link>
                    ) : (
                      <Link
                        href={`/auctions/${auction.id}`}
                        className="w-full border border-outline/30 text-on-surface-variant py-3 rounded-lg font-bold hover:bg-surface-variant transition-colors flex justify-center items-center gap-2"
                      >
                        View Results
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
