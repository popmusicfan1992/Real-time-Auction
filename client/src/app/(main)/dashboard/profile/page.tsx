"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, error: profileError } = useSWR("/users/me/profile", fetcher);
  const { data: stats } = useSWR("/users/me/dashboard", fetcher);
  const { data: auctions } = useSWR("/users/me/auctions", fetcher);

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormName(profile.name || "");
      setFormPhone(profile.phone || "");
      setFormAddress(profile.address || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put("/users/me/profile", {
        name: formName,
        phone: formPhone,
        address: formAddress,
      });
      setIsEditing(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (profileError) return (
    <div className="text-center pt-24 text-error">Failed to load profile data.</div>
  );

  if (!profile) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
    </div>
  );

  const memberSince = new Date(profile.createdAt).getFullYear();

  return (
    <div className="max-w-5xl mx-auto w-full px-6 space-y-8 pb-20">

      {/* Profile Header */}
      <div className="bg-surface-container rounded-xl p-8 border border-outline-variant flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="relative">
          <img
            alt="User avatar"
            className="w-24 h-24 rounded-full border-2 border-secondary shadow-lg object-cover"
            src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=2BD4CE&color=fff&size=96`}
          />
          <span className="absolute -bottom-1 -right-1 bg-primary w-6 h-6 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[14px]">verified</span>
          </span>
        </div>

        <div className="flex-grow text-center md:text-left">
          {isEditing ? (
            <div className="space-y-3 max-w-sm">
              <input
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full Name"
              />
              <input
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="Phone Number"
              />
              <input
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Address"
              />
            </div>
          ) : (
            <>
              <h1 className="font-headline-lg text-3xl font-bold text-on-surface mb-1">{profile.name}</h1>
              <p className="font-body-md text-sm text-on-surface-variant mb-1">{profile.email}</p>
              {profile.phone && <p className="font-body-md text-sm text-on-surface-variant mb-1">📞 {profile.phone}</p>}
              {profile.address && <p className="font-body-md text-sm text-on-surface-variant mb-3">📍 {profile.address}</p>}
              <p className="font-body-md text-sm text-on-surface-variant mb-3">Collector since {memberSince}</p>
            </>
          )}

          {stats && (
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
              <div className="bg-surface-variant px-4 py-2 rounded-full">
                <span className="font-label-bold text-sm text-primary">🏆 {stats.won} Won</span>
              </div>
              <div className="bg-surface-variant px-4 py-2 rounded-full">
                <span className="font-label-bold text-sm text-on-surface-variant">{stats.lost} Lost</span>
              </div>
              <div className="bg-surface-variant px-4 py-2 rounded-full">
                <span className="font-label-bold text-sm text-tertiary">⚡ {stats.activeParticipations} Active</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-transparent border border-outline text-on-surface font-label-bold text-sm px-6 py-3 rounded-full hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-transparent border border-outline text-on-surface font-label-bold text-sm px-6 py-3 rounded-full hover:bg-surface-variant transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* My Auctions (Seller section) */}
      {auctions && auctions.length > 0 && (
        <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
            <h2 className="font-headline-md text-2xl font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">gavel</span>
              My Listings
            </h2>
            <Link href="/dashboard/seller/create" className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-bold text-xs hover:bg-primary/90 transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">add</span>
              New Auction
            </Link>
          </div>
          <div className="divide-y divide-outline-variant">
            {auctions.map((auction: any) => (
              <Link href={`/auctions/${auction.id}`} key={auction.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-high/50 transition-colors block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-variant flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={auction.images[0] || ""} alt={auction.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-body-md text-sm font-semibold text-on-surface line-clamp-1">{auction.title}</p>
                    <p className="font-body-md text-xs text-on-surface-variant">{auction._count.bids} bids</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-price-display text-base font-bold text-tertiary">${parseFloat(auction.currentPrice).toLocaleString()}</p>
                  <span className={`text-[10px] font-label-bold uppercase tracking-wider ${
                    auction.status === "ACTIVE" ? "text-primary animate-pulse" :
                    auction.status === "ENDED" ? "text-on-surface-variant" : "text-secondary"
                  }`}>{auction.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bid History from dashboard */}
      {stats && stats.recentBids && stats.recentBids.length > 0 && (
        <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant">
            <h2 className="font-headline-md text-2xl font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Recent Bid History
            </h2>
          </div>
          <div className="divide-y divide-outline-variant">
            {stats.recentBids.map((bid: any) => (
              <Link href={`/auctions/${bid.auctionId}`} key={bid.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-high/50 transition-colors block">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-variant flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bid.auction.images[0]} alt={bid.auction.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <p className="font-body-md text-sm font-semibold text-on-surface line-clamp-1">{bid.auction.title}</p>
                  <p className="font-body-md text-xs text-on-surface-variant">{new Date(bid.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-price-display text-base font-bold text-tertiary">${parseFloat(bid.amount).toLocaleString()}</p>
                  <span className={`text-[10px] font-label-bold uppercase ${
                    bid.auction.status === "ACTIVE" ? "text-primary animate-pulse" : "text-on-surface-variant"
                  }`}>{bid.auction.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
