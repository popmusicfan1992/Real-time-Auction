"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import useSWR from "swr";
import { io, Socket } from "socket.io-client";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedDescription } from "@/lib/description-parser";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function LiveBiddingRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  
  // SWR fetches the initial auction data
  const { data: auction, error, mutate } = useSWR(`/auctions/${id}`, fetcher);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [bidsHistory, setBidsHistory] = useState<any[]>([]);
  const [isBidding, setIsBidding] = useState(false);
  const [selectedIncrement, setSelectedIncrement] = useState<number>(500);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [participantCount, setParticipantCount] = useState(0);

  // Buy Now state
  const [showBuyNowConfirm, setShowBuyNowConfirm] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [auctionEndedData, setAuctionEndedData] = useState<any>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(true);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Watchlist state
  const [isWatched, setIsWatched] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current && chatEndRef.current.parentElement) {
      const parent = chatEndRef.current.parentElement;
      parent.scrollTo({ top: parent.scrollHeight, behavior: "smooth" });
    }
  }, [chatMessages, isBotTyping]);

  // Sync state when auction data is loaded
  useEffect(() => {
    if (auction) {
      setCurrentBid(parseFloat(auction.currentPrice));
      setBidsHistory(auction.bids || []);
      setSelectedIncrement(parseFloat(auction.minIncrement));
      if (auction.status === "ENDED") setIsAuctionEnded(true);
    }
  }, [auction]);

  // Check if auction is in user's watchlist
  useEffect(() => {
    if (user && id) {
      api.get("/users/me/watchlist")
        .then((res) => {
          const ids = res.data.map((w: any) => w.auction.id);
          setIsWatched(ids.includes(id));
        })
        .catch(() => {});
    }
  }, [user, id]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleToggleWatchlist = async () => {
    if (!user) {
      setToast({ message: "Please login to use Watchlist", type: "error" });
      return;
    }
    setWatchlistLoading(true);
    try {
      const res = await api.post("/users/me/watchlist", { auctionId: id });
      setIsWatched(res.data.isWatched);
      setToast({ message: res.data.message, type: "success" });
    } catch (e: any) {
      setToast({ message: e.response?.data?.message || "Failed", type: "error" });
    } finally {
      setWatchlistLoading(false);
    }
  };

  // Load existing chat messages from DB
  useEffect(() => {
    async function loadChat() {
      try {
        const res = await api.get(`/auctions/${id}/chat`);
        setChatMessages(res.data.map((msg: any) => ({
          id: msg.id,
          user: msg.sender,
          message: msg.message,
          isBot: msg.isBot,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } catch {
        // If no chat endpoint exists yet, start with welcome message
        setChatMessages([{
          id: "welcome",
          user: "Auctioneer Bot",
          message: "Welcome to the live auction! Bidding is now open. Good luck!",
          isBot: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } finally {
        setIsChatLoading(false);
      }
    }
    loadChat();
  }, [id]);

  // Socket.io connection for real-time updates
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      transports: ["websocket"]
    });

    socketInstance.on("connect", () => {
      console.log("Connected to bidding server");
      socketInstance.emit("join_auction", id, user?.id);
    });

    // Real-time bid updates — data IS the payload directly (no wrapping object)
    socketInstance.on("new_bid", (data) => {
      setCurrentBid(parseFloat(data.newPrice));
      setBidsHistory((prev) => {
        const newBid = data.bid;
        // Prevent duplicates
        const exists = prev.some((b: any) => b.id === newBid.id);
        if (exists) return prev;
        return [newBid, ...prev].slice(0, 10);
      });
    });

    socketInstance.on("new_message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socketInstance.on("bot_typing", (data) => {
      setIsBotTyping(data.isTyping);
    });

    socketInstance.on("countdown_sync", (data) => {
      if (data.auctionId === id) {
        setRemainingMs(data.remainingMs);
      }
    });

    socketInstance.on("participant_count", (data) => {
      setParticipantCount(data.count);
    });

    socketInstance.on("outbid_alert", (data) => {
      alert(`⚠️ You've been outbid! New price: $${parseFloat(data.newAmount).toLocaleString()} on "${data.auctionTitle}".`);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    });

    socketInstance.on("auction_ended", (data) => {
      setIsAuctionEnded(true);
      setAuctionEndedData(data);
      setRemainingMs(0);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [id, user?.id]);

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
      // Socket will receive the "new_bid" event and update UI automatically
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to place bid");
    } finally {
      setIsBidding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      alert("Please log in to use Buy Now.");
      return;
    }
    setIsBuyingNow(true);
    try {
      await api.post("/bids/buy-now", { auctionId: id });
      setShowBuyNowConfirm(false);
      // Socket will emit auction_ended event
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to process Buy Now");
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !socket || !user) return;

    socket.emit("send_message", {
      auctionId: id,
      message: chatInput.trim(),
      user: user.name
    });

    setChatInput("");
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (error) {
    if (error.response?.status === 404) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-6 pt-24 pb-20 px-4 text-center">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/50">search_off</span>
          <h1 className="text-display-sm text-on-surface font-light tracking-tight">{t("auctionDetail.auctionNotFound")}</h1>
          <p className="text-body-lg text-on-surface-variant max-w-md">{t("auctionDetail.auctionNotFoundDesc")}</p>
          <Link href="/auctions" className="mt-8 px-8 py-3 bg-primary text-on-primary rounded-full font-label-lg hover:bg-primary/90 transition-colors shadow-glow-primary">
            {t("auctionDetail.browseCatalog")}
          </Link>
        </div>
      );
    }
    return <div className="min-h-screen flex items-center justify-center pt-24 text-error">{t("auctionDetail.failedToLoad")}</div>;
  }
  if (!auction) return <div className="min-h-screen pt-24 text-center text-on-surface">{t("auctionDetail.loadingRoom")}</div>;

  const minInc = parseFloat(auction.minIncrement);
  const bidOptions = [minInc, minInc * 2, minInc * 5, minInc * 10];
  const nextBidAmount = currentBid + selectedIncrement;
  const depositRequired = nextBidAmount * 0.1;

  return (
    <div className="max-w-7xl mx-auto w-full pt-24 pb-20 px-4 md:px-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 animate-slide-in ${
          toast.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === "success" ? "check_circle" : "error"}</span>
          <span className="font-label-bold text-sm">{toast.message}</span>
        </div>
      )}
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link href="/auctions" className="hover:text-on-surface transition-colors">{t("auctionDetail.catalog")}</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-semibold">{t("auctionDetail.liveBiddingRoom")}</span>
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
              {participantCount || "..."} {t("auctionDetail.watching")}
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
                onClick={handleToggleWatchlist}
                disabled={watchlistLoading}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isWatched
                    ? "bg-red-500/20 border border-red-500/50 text-red-400 animate-heart-pop"
                    : "bg-surface-variant hover:bg-surface-container-high text-on-surface hover:text-red-400 border border-transparent hover:border-red-500/30"
                } disabled:opacity-50`}
                title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isWatched ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
              </button>
            </div>
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface mb-2 pr-12">{auction.title}</h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              {getLocalizedDescription(auction.description, locale)}
            </p>
          </div>
        </div>

        {/* Center: Bidding Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Countdown & Current Bid */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant text-center">
            <p className="font-label-bold text-sm text-error uppercase tracking-widest mb-2">{t("auctionDetail.timeRemaining")}</p>
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
                <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider">{t("auctionDetail.currentBid")}</p>
                <p className="font-price-display text-3xl text-secondary mt-1">${currentBid.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider">{t("auctionDetail.startingPrice")}</p>
                <p className="font-body-md text-lg text-on-surface-variant mt-1">${parseFloat(auction.startingPrice).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Bid Increment Selector */}
          <div className="bg-surface-container rounded-xl p-5 border border-outline-variant">
            <p className="font-label-bold text-sm text-on-surface-variant mb-3 uppercase tracking-wider">{t("auctionDetail.bidIncrement")}</p>
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
              disabled={isBidding || remainingMs <= 0 || isAuctionEnded}
              className="w-full bg-amber-500 text-slate-950 py-4 rounded-lg font-bold text-lg hover:bg-amber-400 transition-colors shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBidding ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  Placing bid...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[24px]">gavel</span>
                  {t("auctionDetail.placeBid")} — ${nextBidAmount.toLocaleString()}
                </>
              )}
            </button>

            <div className="flex justify-between items-center mt-3">
              <p className="font-body-md text-xs text-on-surface-variant">{t("auctionDetail.minIncrement")}: ${minInc.toLocaleString()}</p>
              <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary">verified</span>
                {t("auctionDetail.depositRequired")}: ${depositRequired.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Buy Now */}
          {auction.buyNowPrice && !isAuctionEnded && (
            <button 
              onClick={() => setShowBuyNowConfirm(true)}
              className="w-full bg-transparent border-2 border-tertiary text-tertiary py-3 rounded-lg font-bold hover:bg-tertiary/10 transition-colors flex justify-center items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              {t("auctionDetail.buyNow")} — ${parseFloat(auction.buyNowPrice).toLocaleString()}
            </button>
          )}

          {/* Auction Ended Banner */}
          {isAuctionEnded && (
            <div className="bg-surface-container rounded-xl p-5 border border-error/30 text-center space-y-2">
              <span className="material-symbols-outlined text-[40px] text-error">gavel</span>
              <h3 className="font-headline-md text-xl font-bold text-on-surface">{t("auctionDetail.auctionEnded")}</h3>
              {auctionEndedData?.isBuyNow ? (
                <p className="text-on-surface-variant text-sm">This item was purchased via <span className="text-tertiary font-bold">Buy Now</span> for ${parseFloat(auctionEndedData.finalPrice).toLocaleString()}</p>
              ) : (
                <p className="text-on-surface-variant text-sm">Final price: <span className="text-secondary font-bold">${currentBid.toLocaleString()}</span></p>
              )}
              {auctionEndedData?.winnerId === user?.id && (
                <p className="text-green-400 font-bold flex items-center justify-center gap-1"><span className="material-symbols-outlined text-[18px]">emoji_events</span> {t("auctionDetail.youWon")}</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Leaderboard + Chat */}
        <div className="lg:col-span-3 space-y-4">
          {/* Leaderboard */}
          <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">leaderboard</span>
              <h3 className="font-label-bold text-sm text-on-surface uppercase tracking-wider">{t("auctionDetail.topBidders")}</h3>
              <span className="ml-auto text-[10px] font-label-bold text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full">
                {bidsHistory.length} bids
              </span>
            </div>
            <div className="divide-y divide-outline-variant">
              {bidsHistory.length === 0 ? (
                <div className="p-4 text-center text-on-surface-variant text-sm">{t("auctionDetail.noBidsYet")}</div>
              ) : (
                bidsHistory.map((bid: any, index: number) => {
                  const isYou = user && bid.userId === user.id;
                  return (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between px-4 py-3 transition-all ${
                        index === 0 ? "animate-[slideDown_0.3s_ease-out]" : ""
                      } ${isYou ? "bg-secondary/5 border-l-2 border-secondary" : ""}`}
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
                          {bid.user?.name || "Anonymous"} {isYou && <span className="text-[10px]">(You)</span>}
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

          {/* Live Chat + AI Assistant */}
          <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden flex flex-col h-96">
            <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-xl">smart_toy</span>
              <div>
                <h3 className="font-label-bold text-sm text-on-surface uppercase tracking-wider">{t("auctionDetail.aiChat")}</h3>
                <p className="text-[10px] text-on-surface-variant -mt-0.5">{t("auctionDetail.typeAiToAsk")}</p>
              </div>
              <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Connected" />
            </div>
            <div className="flex-grow overflow-y-auto p-3 space-y-2">
              {isChatLoading ? (
                <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">
                  {t("auctionDetail.loadingChat")}
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant text-sm gap-2 text-center px-4">
                  <span className="material-symbols-outlined text-[32px] text-tertiary/50">smart_toy</span>
                  <p>{t("auctionDetail.welcomeChat")}</p>
                  <p className="text-[11px] text-outline">{t("auctionDetail.typeAiHint")}</p>
                </div>
              ) : (
                chatMessages.map((msg: any) => (
                  <div key={msg.id} className={`${msg.isBot ? "bg-tertiary/5 border border-tertiary/10" : ""} rounded-lg p-2`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`font-label-bold text-[11px] ${msg.isBot ? "text-tertiary" : "text-on-surface-variant"}`}>
                        {msg.isBot && <span className="material-symbols-outlined text-[12px] mr-0.5 align-middle">smart_toy</span>}
                        {msg.user}
                      </span>
                      <span className="text-[10px] text-outline">{msg.time}</span>
                    </div>
                    <p className="font-body-md text-sm text-on-surface">{msg.message}</p>
                  </div>
                ))
              )}
              {isBotTyping && (
                <div className="bg-tertiary/5 border border-tertiary/10 rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-label-bold text-[11px] text-tertiary">
                      <span className="material-symbols-outlined text-[12px] mr-0.5 align-middle">smart_toy</span>
                      GalleryX AI
                    </span>
                  </div>
                  <div className="flex items-center gap-1 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary/60 animate-bounce" style={{animationDelay: '0ms'}} />
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary/60 animate-bounce" style={{animationDelay: '150ms'}} />
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary/60 animate-bounce" style={{animationDelay: '300ms'}} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-outline-variant">
              {user ? (
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    className="flex-grow bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-tertiary"
                    placeholder={t("auctionDetail.chatPlaceholder")}
                    maxLength={500}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="bg-tertiary text-on-tertiary p-2 rounded-lg hover:opacity-90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login"
                  className="block text-center text-sm text-on-surface-variant hover:text-secondary transition-colors py-2"
                >
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">login</span>
                  {t("auctionDetail.signInToChat")}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buy Now Confirmation Modal */}
      {showBuyNowConfirm && auction.buyNowPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface-container-high rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant space-y-5 animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-tertiary">bolt</span>
              </div>
              <h2 className="font-headline-md text-2xl font-bold text-on-surface">{t("auctionDetail.confirmBuyNow")}</h2>
              <p className="text-on-surface-variant text-sm">{t("auctionDetail.confirmBuyNowDesc")}</p>
            </div>

            {/* Item Details */}
            <div className="bg-surface-container rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img 
                  src={auction.images[0]} 
                  alt={auction.title} 
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-label-bold text-sm text-on-surface truncate">{auction.title}</p>
                  <p className="text-xs text-on-surface-variant">{auction.category}</p>
                </div>
              </div>
              <div className="border-t border-outline-variant/50 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-on-surface-variant">{t("auctionDetail.buyNowPrice")}</span>
                  <span className="font-price-display text-lg font-bold text-tertiary">${parseFloat(auction.buyNowPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-on-surface-variant">{t("auctionDetail.currentBid")}</span>
                  <span className="text-sm text-on-surface-variant line-through">${currentBid.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0 mt-0.5">info</span>
              <p className="text-xs text-amber-200/80">{t("auctionDetail.buyNowWarning")}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBuyNowConfirm(false)}
                disabled={isBuyingNow}
                className="flex-1 py-3 rounded-lg font-label-bold text-sm text-on-surface-variant bg-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isBuyingNow}
                className="flex-1 py-3 rounded-lg font-label-bold text-sm text-on-tertiary bg-tertiary hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isBuyingNow ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-tertiary/30 border-t-on-tertiary rounded-full animate-spin" />
                    {t("auctionDetail.processing")}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    {t("auctionDetail.confirm")} — ${parseFloat(auction.buyNowPrice).toLocaleString()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
