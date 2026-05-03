"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data: any;
  createdAt: string;
}

const NOTIFICATION_ICONS: Record<string, { icon: string; color: string }> = {
  BID_OUTBID: { icon: "trending_up", color: "text-red-400" },
  AUCTION_WON: { icon: "emoji_events", color: "text-amber-400" },
  AUCTION_LOST: { icon: "sentiment_dissatisfied", color: "text-on-surface-variant" },
  AUCTION_STARTING: { icon: "schedule", color: "text-blue-400" },
  PAYMENT_SUCCESS: { icon: "account_balance_wallet", color: "text-green-400" },
  DEPOSIT_RELEASED: { icon: "lock_open", color: "text-tertiary" },
  SYSTEM: { icon: "info", color: "text-primary" },
};

// Map notification type -> redirect URL
function getNotificationUrl(notif: Notification): string | null {
  const auctionId = notif.data?.auctionId;
  switch (notif.type) {
    case "BID_OUTBID":
    case "AUCTION_WON":
    case "AUCTION_LOST":
    case "AUCTION_STARTING":
      return auctionId ? `/auctions/${auctionId}` : "/auctions";
    case "PAYMENT_SUCCESS":
    case "DEPOSIT_RELEASED":
      return "/wallet";
    default:
      return auctionId ? `/auctions/${auctionId}` : null;
  }
}

// Localize notification content
function localizeNotification(notif: Notification, locale: string): { title: string; message: string } {
  if (locale !== "vi") return { title: notif.title, message: notif.message };

  const auctionTitle = notif.data?.auctionTitle || notif.data?.title || "";
  const amount = notif.data?.amount ? `$${parseFloat(notif.data.amount).toLocaleString()}` : "";

  switch (notif.type) {
    case "BID_OUTBID":
      return {
        title: "Bạn đã bị vượt giá!",
        message: `Có người vừa đặt giá cao hơn bạn${auctionTitle ? ` cho "${auctionTitle}"` : ""}. Hãy đặt lại ngay!`,
      };
    case "AUCTION_WON":
      return {
        title: "🏆 Chúc mừng! Bạn đã thắng!",
        message: `Bạn đã thắng phiên đấu giá${auctionTitle ? ` "${auctionTitle}"` : ""}${amount ? ` với giá ${amount}` : ""}. Xem chi tiết ngay.`,
      };
    case "AUCTION_LOST":
      return {
        title: "Phiên đấu giá đã kết thúc",
        message: `Rất tiếc, bạn không thắng phiên đấu giá${auctionTitle ? ` "${auctionTitle}"` : ""}. Tiền cọc sẽ được hoàn lại.`,
      };
    case "AUCTION_STARTING":
      return {
        title: "⏰ Phiên đấu giá sắp bắt đầu!",
        message: `Phiên đấu giá${auctionTitle ? ` "${auctionTitle}"` : ""} sẽ bắt đầu trong ít phút nữa.`,
      };
    case "PAYMENT_SUCCESS":
      return {
        title: "✅ Nạp tiền thành công",
        message: `Ví của bạn đã được nạp thêm${amount ? ` ${amount}` : ""}. Sẵn sàng tham gia đấu giá!`,
      };
    case "DEPOSIT_RELEASED":
      return {
        title: "🔓 Tiền cọc đã được hoàn trả",
        message: `Tiền cọc của bạn${amount ? ` (${amount})` : ""} đã được giải phóng về ví khả dụng.`,
      };
    default:
      return { title: notif.title, message: notif.message };
  }
}

function timeAgo(dateStr: string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (locale === "vi") {
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  }
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationDropdown() {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count periodically
  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      api.get("/notifications/unread-count")
        .then((res) => setUnreadCount(res.data.count))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications when opening dropdown
  const handleToggle = async () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen && user) {
      setLoading(true);
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  // Mark one as read + navigate
  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch { /* ignore */ }
    }
    const url = getNotificationUrl(notif);
    if (url) {
      setIsOpen(false);
      router.push(url);
    }
  };

  if (!user) {
    return (
      <button className="text-slate-400 hover:text-white transition-colors hover:bg-white/5 duration-300 p-2 rounded-full">
        <span className="material-symbols-outlined">notifications</span>
      </button>
    );
  }

  const headerTitle = locale === "vi" ? "Thông Báo" : "Notifications";
  const markAllReadLabel = locale === "vi" ? "Đánh dấu đã đọc" : "Mark all read";
  const viewAllLabel = locale === "vi" ? "Xem Tất Cả" : "View All";
  const emptyLabel = locale === "vi" ? "Chưa có thông báo nào" : "No notifications yet";

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="text-slate-400 hover:text-white transition-colors hover:bg-white/5 duration-300 p-2 rounded-full relative"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-surface-container-high border border-outline-variant rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-up">
          {/* Header */}
          <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-label-bold text-sm text-on-surface uppercase tracking-wider">
              {headerTitle}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-label-bold text-tertiary hover:text-tertiary-fixed transition-colors"
                >
                  {markAllReadLabel}
                </button>
              )}
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-label-bold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {viewAllLabel}
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30 mb-2 block">
                  notifications_off
                </span>
                <p className="text-on-surface-variant text-sm">{emptyLabel}</p>
              </div>
            ) : (
              notifications.slice(0, 8).map((notif) => {
                const iconConfig = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.SYSTEM;
                const { title, message } = localizeNotification(notif, locale);
                const hasLink = !!getNotificationUrl(notif);

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`px-4 py-3 border-b border-outline-variant/50 transition-colors flex gap-3 ${
                      hasLink ? "cursor-pointer hover:bg-surface-container" : "cursor-default"
                    } ${!notif.isRead ? "bg-surface-container/50" : ""}`}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !notif.isRead ? "bg-surface-variant" : "bg-surface-container-lowest"
                    }`}>
                      <span className={`material-symbols-outlined text-[18px] ${iconConfig.color}`}>
                        {iconConfig.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-label-bold text-sm leading-tight ${
                          !notif.isRead ? "text-on-surface" : "text-on-surface-variant"
                        }`}>
                          {title}
                        </p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                        {message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-outline">{timeAgo(notif.createdAt, locale)}</span>
                        {hasLink && (
                          <span className="text-[10px] font-label-bold text-tertiary">
                            {locale === "vi" ? "Xem ngay →" : "View →"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}


