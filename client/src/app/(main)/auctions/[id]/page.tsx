"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { io, Socket } from "socket.io-client";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function LiveBiddingRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  
  // SWR fetches the initial auction data
  const { data: auction, error } = useSWR(`/auctions/${id}`, fetcher);

  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [bidsHistory, setBidsHistory] = useState<any[]>([]);
  const [isBidding, setIsBidding] = useState(false);
  const [selectedIncrement, setSelectedIncrement] = useState<number>(500);
  const [remainingMs, setRemainingMs] = useState<number>(0);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      user: "Auctioneer Bot",
      message: "Welcome to the live auction! Bidding starts soon.",
      isBot: true,
      time: "14:00"
    }
  ]);

  // Sync state when auction data is loaded
  useEffect(() => {
    if (auction) {
      setCurrentBid(parseFloat(auction.currentPrice));
      setBidsHistory(auction.bids || []);
      setSelectedIncrement(parseFloat(auction.minIncrement));
    }
  }, [auction]);

  // Socket.io connection for real-time updates
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
      transports: ["websocket"]
    });

    socketInstance.on("connect", () => {
      console.log("Connected to bidding server");
      // Gửi thêm userId (nếu đã đăng nhập) để server thêm vào phòng chat riêng nhận cảnh báo Outbid
      socketInstance.emit("join_auction", id, user?.id);
    });

    socketInstance.on("new_bid", (data) => {
      if (data.auctionId === id) {
        setCurrentBid(parseFloat(data.newPrice));
        setBidsHistory((prev) => [data.bid, ...prev].slice(0, 10)); // Keep top 10 recent bids
      }
    });

    socketInstance.on("new_message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socketInstance.on("countdown_sync", (data) => {
      if (data.auctionId === id) {
        setRemainingMs(data.remainingMs);
      }
    });

    socketInstance.on("outbid_alert", (data) => {
      alert(`⚠️ CẢNH BÁO BỊ VƯỢT GIÁ: Một người dùng khác vừa ra giá $${parseFloat(data.newAmount).toLocaleString()} cho món đồ "${data.auctionTitle}". Tiền cọc của bạn đã được hoàn trả!`);
      // Vibrate nếu điện thoại hỗ trợ
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [id]);

  const handlePlaceBid = async () => {
    if (!user) {
      alert("Please log in to place a bid.");
      return;
    }
    
    const bidAmount = currentBid + selectedIncrement;
    
    setIsBidding(true);
    try {
      await api.post("/bids", {
        auctionId: id,
        amount: bidAmount
      });
      // The socket will receive the update and change the UI automatically
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to place bid");
    } finally {
      setIsBidding(false);
    }
  };

  if (error) {
    if (error.response?.status === 404) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-6 pt-24 pb-20 px-4 text-center">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/50">search_off</span>
          <h1 className="text-display-sm text-on-surface font-light tracking-tight">Auction Not Found</h1>
          <p className="text-body-lg text-on-surface-variant max-w-md">The auction you are looking for does not exist, has been removed, or is currently unavailable.</p>
          <Link href="/auctions" className="mt-8 px-8 py-3 bg-primary text-on-primary rounded-full font-label-lg hover:bg-primary/90 transition-colors shadow-glow-primary">
            Browse Catalog
          </Link>
        </div>
      );
    }
    return <div className="min-h-screen flex items-center justify-center pt-24 text-error">Failed to load auction details. Please try again later.</div>;
  }
  if (!auction) return <div className="min-h-screen pt-24 text-center text-on-surface">Loading live bidding room...</div>;

  const minInc = parseFloat(auction.minIncrement);
  const bidOptions = [minInc, minInc * 2, minInc * 5, minInc * 10];
  const nextBidAmount = currentBid + selectedIncrement;
  const depositRequired = nextBidAmount * 0.1;

  return (
    <div className="max-w-7xl mx-auto w-full pt-24 pb-20 px-4 md:px-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/auctions" className="hover:text-on-surface transition-colors">Catalog</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-semibold">Live Bidding Room</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Image + Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-xl overflow-hidden aspect-square bg-surface-container">
            <img
              alt={auction.title}
              className="w-full h-full object-cover"
              src={auction.images[0] || "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080&auto=format&fit=crop"}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <div className="bg-red-500/90 text-white px-3 py-1 rounded-full flex items-center gap-2 font-label-bold text-[12px] shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ACTIVE
              </div>
              <div className="bg-surface-container-high/80 backdrop-blur px-3 py-1 rounded-full font-label-bold text-[12px] text-on-surface border border-white/10">
                <span className="material-symbols-outlined text-[14px] text-blue-400 mr-1 align-middle">verified_user</span>
                Verified
              </div>
            </div>
            <div className="absolute bottom-3 right-3 bg-surface-container-high/80 backdrop-blur px-3 py-1 rounded-full font-label-bold text-[12px] text-on-surface-variant border border-white/10 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">group</span>
              47 watching
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-5 border border-outline-variant">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-label-bold text-on-surface-variant uppercase tracking-wider border border-outline/30 px-2 py-0.5 rounded">
                  LOT {auction.id.slice(-4)}
                </span>
                <span className="text-xs font-label-bold text-tertiary uppercase tracking-wider">{auction.category}</span>
              </div>
              <button 
                onClick={async () => {
                  try {
                    const res = await api.post("/users/me/watchlist", { auctionId: id });
                    alert(res.data.message);
                  } catch (e: any) {
                    alert("Please login to use Watchlist");
                  }
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-variant hover:bg-surface-container-high transition-colors text-on-surface hover:text-error"
                title="Add to Watchlist"
              >
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
            </div>
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface mb-2 pr-12">{auction.title}</h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              {auction.description}
            </p>
          </div>
        </div>

        {/* Center: Bidding Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Countdown & Current Bid */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant text-center">
            <p className="font-label-bold text-sm text-error uppercase tracking-widest mb-2">Time Remaining</p>
            <p className="font-display-auction text-5xl font-extrabold text-on-surface font-mono tracking-tighter mb-4">
              {remainingMs > 0 
                ? new Date(remainingMs).toISOString().slice(11, 19) 
                : "ENDED"}
            </p>
            <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-error to-secondary w-1/4 rounded-full transition-all duration-1000" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider">Current Bid</p>
                <p className="font-price-display text-3xl text-secondary mt-1">${currentBid.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider">Starting Price</p>
                <p className="font-body-md text-lg text-on-surface-variant mt-1">${parseFloat(auction.startingPrice).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Bid Increment Selector */}
          <div className="bg-surface-container rounded-xl p-5 border border-outline-variant">
            <p className="font-label-bold text-sm text-on-surface-variant mb-3 uppercase tracking-wider">Bid Increment</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {bidOptions.map((inc) => (
                <button
                  key={inc}
                  onClick={() => setSelectedIncrement(inc)}
                  className={`py-2 rounded-lg font-label-bold text-sm transition-all ${
                    selectedIncrement === inc
                      ? "bg-secondary text-on-secondary shadow-md"
                      : "bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  ${inc.toLocaleString()}
                </button>
              ))}
            </div>

            <button 
              onClick={handlePlaceBid}
              disabled={isBidding}
              className="w-full bg-amber-500 text-slate-950 py-4 rounded-lg font-bold text-lg hover:bg-amber-400 transition-colors shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[24px]">gavel</span>
              Place Bid — ${nextBidAmount.toLocaleString()}
            </button>

            <div className="flex justify-between items-center mt-3">
              <p className="font-body-md text-xs text-on-surface-variant">Min increment: ${minInc.toLocaleString()}</p>
              <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary">verified</span>
                Deposit required: ${depositRequired.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Buy Now */}
          {auction.buyNowPrice && (
            <button className="w-full bg-transparent border-2 border-tertiary text-tertiary py-3 rounded-lg font-bold hover:bg-tertiary/10 transition-colors flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              Buy Now — ${parseFloat(auction.buyNowPrice).toLocaleString()}
            </button>
          )}
        </div>

        {/* Right: Leaderboard + Chat */}
        <div className="lg:col-span-3 space-y-4">
          {/* Leaderboard */}
          <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">leaderboard</span>
              <h3 className="font-label-bold text-sm text-on-surface uppercase tracking-wider">Top Bidders</h3>
            </div>
            <div className="divide-y divide-outline-variant">
              {bidsHistory.length === 0 ? (
                <div className="p-4 text-center text-on-surface-variant text-sm">No bids yet</div>
              ) : (
                bidsHistory.map((bid: any, index: number) => {
                  const isYou = user && bid.userId === user.id;
                  return (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between px-4 py-3 ${
                        isYou ? "bg-secondary/5 border-l-2 border-secondary" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? "bg-secondary text-on-secondary" :
                          index === 1 ? "bg-on-surface-variant/20 text-on-surface" :
                          "bg-surface-variant text-on-surface-variant"
                        }`}>
                          {index + 1}
                        </span>
                        <span className={`font-body-md text-sm ${isYou ? "text-secondary font-semibold" : "text-on-surface"}`}>
                          {bid.user.name} {isYou && <span className="text-[10px]">(You)</span>}
                        </span>
                      </div>
                      <span className="font-price-display text-sm font-bold text-on-surface">
                        ${parseFloat(bid.amount).toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Live Chat */}
          <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden flex flex-col h-80">
            <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-xl">chat</span>
              <h3 className="font-label-bold text-sm text-on-surface uppercase tracking-wider">Live Chat</h3>
            </div>
            <div className="flex-grow overflow-y-auto p-3 space-y-3 flex flex-col-reverse">
              {/* flex-col-reverse helps keep chat anchored to bottom if we map backwards, but let's just map normally for now */}
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`${msg.isBot ? "bg-surface-variant/50" : ""} rounded-lg p-2`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-label-bold text-[11px] ${msg.isBot ? "text-tertiary" : "text-on-surface-variant"}`}>
                        {msg.isBot && <span className="material-symbols-outlined text-[12px] mr-0.5 align-middle">smart_toy</span>}
                        {msg.user}
                      </span>
                      <span className="text-[10px] text-outline">{msg.time}</span>
                    </div>
                    <p className="font-body-md text-sm text-on-surface">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-outline-variant">
              <div className="flex gap-2">
                <input
                  className="flex-grow bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-tertiary"
                  placeholder="Type a message..."
                />
                <button className="bg-secondary text-on-secondary p-2 rounded-lg hover:bg-secondary-fixed transition-colors">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
