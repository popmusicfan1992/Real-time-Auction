"use client";

import useSWR from "swr";
import api from "@/lib/api";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function WatchlistPage() {
  const { data: watchlist, error, mutate } = useSWR("/users/me/watchlist", fetcher);

  const removeWatchlist = async (auctionId: string) => {
    try {
      await api.post("/users/me/watchlist", { auctionId });
      mutate(); // Tự động load lại danh sách sau khi xoá
    } catch (err) {
      console.error(err);
    }
  };

  if (error) return <div className="text-center pt-24 text-error">Failed to load watchlist</div>;
  if (!watchlist) return <div className="text-center pt-24">Loading watchlist...</div>;

  return (
    <div className="max-w-5xl mx-auto w-full px-6 space-y-8 pb-20">
      <div>
        <h1 className="font-display-auction text-5xl font-extrabold text-on-surface mb-2">My Watchlist</h1>
        <p className="font-body-lg text-lg text-on-surface-variant">Keep an eye on the items you love.</p>
      </div>

      {watchlist.length === 0 ? (
        <div className="bg-surface-container rounded-xl p-12 text-center border border-outline-variant">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 opacity-50">visibility_off</span>
          <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Your watchlist is empty</h3>
          <p className="text-on-surface-variant mb-6">Browse our catalog and click the heart icon to save items here.</p>
          <Link href="/auctions" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-bold text-sm shadow-md hover:bg-primary-fixed transition-colors">
            Explore Auctions
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((item: any) => (
            <div key={item.id} className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant group hover:border-outline transition-all duration-300">
              <div className="relative aspect-[4/3] bg-surface-variant overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.auction.images[0]} 
                  alt={item.auction.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    removeWatchlist(item.auction.id);
                  }}
                  className="absolute top-3 right-3 w-10 h-10 bg-surface-container-high/80 backdrop-blur rounded-full flex items-center justify-center text-error hover:bg-error hover:text-on-error transition-colors shadow-lg"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </button>
                <div className="absolute top-3 left-3 bg-surface-container-high/80 backdrop-blur px-3 py-1 rounded-full font-label-bold text-[12px] text-on-surface border border-white/10">
                  {item.auction.status}
                </div>
              </div>
              <div className="p-5 space-y-4">
                <Link href={`/auctions/${item.auction.id}`} className="block">
                  <h3 className="font-headline-sm text-xl font-bold text-on-surface leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {item.auction.title}
                  </h3>
                </Link>
                <div className="flex items-end justify-between pt-2 border-t border-outline-variant/50">
                  <div>
                    <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider mb-1">Current Bid</p>
                    <p className="font-price-display text-2xl font-bold text-tertiary">
                      ${parseFloat(item.auction.currentPrice).toLocaleString()}
                    </p>
                  </div>
                  <Link href={`/auctions/${item.auction.id}`} className="font-label-bold text-sm text-primary hover:text-primary-fixed transition-colors flex items-center gap-1">
                    View
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
