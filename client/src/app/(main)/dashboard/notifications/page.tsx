"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data: any;
  createdAt: string;
}

const NOTIFICATION_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  BID_OUTBID: { icon: "trending_up", color: "text-red-400", bg: "bg-red-500/10" },
  AUCTION_WON: { icon: "emoji_events", color: "text-amber-400", bg: "bg-amber-500/10" },
  AUCTION_LOST: { icon: "sentiment_dissatisfied", color: "text-on-surface-variant", bg: "bg-surface-variant" },
  AUCTION_STARTING: { icon: "schedule", color: "text-blue-400", bg: "bg-blue-500/10" },
  PAYMENT_SUCCESS: { icon: "account_balance_wallet", color: "text-green-400", bg: "bg-green-500/10" },
  DEPOSIT_RELEASED: { icon: "lock_open", color: "text-tertiary", bg: "bg-tertiary/10" },
  SYSTEM: { icon: "info", color: "text-primary", bg: "bg-primary/10" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get("/notifications")
      .then((res) => setNotifications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // ignore
    }
  };

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-20 text-center">
        <p className="text-on-surface-variant">Please log in to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-display-auction text-4xl font-extrabold text-on-surface mb-1">
            Notifications
          </h1>
          <p className="font-body-lg text-base text-on-surface-variant">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-label-bold text-tertiary hover:text-tertiary-fixed transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                done_all
              </span>
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-surface-container-high rounded-lg p-1 w-max">
        <button
          onClick={() => setFilter("all")}
          className={`px-5 py-2 rounded-md font-label-bold text-sm transition-colors ${
            filter === "all"
              ? "bg-surface-variant text-on-surface shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-5 py-2 rounded-md font-label-bold text-sm transition-colors flex items-center gap-1.5 ${
            filter === "unread"
              ? "bg-surface-variant text-on-surface shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-on-surface-variant text-sm">
              Loading notifications...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-[56px] text-on-surface-variant/20 block mb-3">
              notifications_off
            </span>
            <h3 className="font-headline-md text-xl text-on-surface-variant mb-1">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-on-surface-variant/60 text-sm">
              {filter === "unread"
                ? "You've read all your notifications."
                : "Notifications about your bids, auctions, and wallet will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {filtered.map((notif) => {
              const iconConfig =
                NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.SYSTEM;
              const auctionId = notif.data?.auctionId;

              return (
                <div
                  key={notif.id}
                  className={`flex gap-4 px-5 py-4 transition-colors group ${
                    !notif.isRead
                      ? "bg-surface-container-low/50 hover:bg-surface-container-low"
                      : "hover:bg-surface-container-high/50"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${iconConfig.bg}`}
                  >
                    <span
                      className={`material-symbols-outlined text-[22px] ${iconConfig.color}`}
                    >
                      {iconConfig.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-label-bold text-base leading-tight ${
                              !notif.isRead
                                ? "text-on-surface"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="font-body-md text-sm text-on-surface-variant mt-1">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-outline flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">
                              schedule
                            </span>
                            {timeAgo(notif.createdAt)}
                          </span>
                          {auctionId && (
                            <Link
                              href={`/auctions/${auctionId}`}
                              className="text-xs font-label-bold text-tertiary hover:text-tertiary-fixed transition-colors"
                            >
                              View Auction →
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="p-1.5 rounded-lg hover:bg-surface-variant text-on-surface-variant hover:text-tertiary transition-colors"
                            title="Mark as read"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              done
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            close
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
