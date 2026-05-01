"use client";

import useSWR from "swr";
import api from "@/lib/api";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function DashboardOverviewPage() {
  const { data: stats, error } = useSWR("/users/me/dashboard", fetcher);

  if (error) return <div className="text-center pt-24 text-error">Failed to load dashboard</div>;
  if (!stats) return <div className="text-center pt-24">Loading dashboard...</div>;

  return (
    <div className="max-w-5xl mx-auto w-full px-6 space-y-8 pb-20">
      <div>
        <h1 className="font-display-auction text-5xl font-extrabold text-on-surface mb-2">My Dashboard</h1>
        <p className="font-body-lg text-lg text-on-surface-variant">Overview of your bidding activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Bids */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary text-2xl">gavel</span>
            <span className="font-label-bold text-sm text-on-surface-variant uppercase tracking-wider">Active Bids</span>
          </div>
          <p className="font-price-display text-4xl font-bold text-on-surface">{stats.activeParticipations}</p>
          <p className="font-body-md text-sm text-tertiary mt-2">Auctions currently live</p>
        </div>

        {/* Won */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">emoji_events</span>
            <span className="font-label-bold text-sm text-on-surface-variant uppercase tracking-wider">Auctions Won</span>
          </div>
          <p className="font-price-display text-4xl font-bold text-on-surface">{stats.won}</p>
          <p className="font-body-md text-sm text-primary mt-2">Successfully secured</p>
        </div>

        {/* Lost */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-error/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-error text-2xl">cancel</span>
            <span className="font-label-bold text-sm text-on-surface-variant uppercase tracking-wider">Auctions Lost</span>
          </div>
          <p className="font-price-display text-4xl font-bold text-error">{stats.lost}</p>
          <p className="font-body-md text-sm text-on-surface-variant mt-2">Outbid by others</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/wallet" className="bg-secondary text-on-secondary px-6 py-2 rounded-full font-label-bold text-sm shadow-md hover:bg-secondary-fixed transition-colors">
          Manage Wallet
        </Link>
        <Link href="/dashboard/watchlist" className="bg-transparent border border-outline text-on-surface px-6 py-2 rounded-full font-label-bold text-sm hover:bg-surface-variant transition-colors">
          View Watchlist
        </Link>
        <Link href="/dashboard/seller/create" className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-bold text-sm shadow-md hover:bg-primary-fixed transition-colors ml-auto flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Sell an Item
        </Link>
      </div>

      {/* Recent Bids */}
      <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <h2 className="font-headline-md text-2xl font-semibold text-on-surface">Recent Bids</h2>
        </div>
        <div className="divide-y divide-outline-variant">
          {stats.recentBids.length === 0 ? (
            <div className="p-6 text-center text-on-surface-variant">You haven't placed any bids yet.</div>
          ) : (
            stats.recentBids.map((bid: any) => (
              <Link href={`/auctions/${bid.auctionId}`} key={bid.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-high/50 transition-colors block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-variant">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bid.auction.images[0]} alt={bid.auction.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-body-md text-base font-semibold text-on-surface line-clamp-1">{bid.auction.title}</p>
                    <p className="font-body-md text-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-price-display text-lg font-bold text-tertiary">
                    ${parseFloat(bid.amount).toLocaleString()}
                  </span>
                  <div className={`text-[10px] font-label-bold uppercase tracking-wider mt-1 ${
                    bid.auction.status === "ACTIVE" ? "text-error animate-pulse" : "text-on-surface-variant"
                  }`}>
                    {bid.auction.status}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
