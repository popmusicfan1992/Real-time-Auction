"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useLanguage();

  const navLinks = [
    { href: "/", label: t("nav.explore") },
    { href: "/auctions", label: t("nav.liveAuctions") },
    { href: "#how-it-works", label: t("nav.howItWorks") },
    { href: "/dashboard/wallet", label: t("nav.wallet") },
  ];

  const toggleLocale = () => {
    setLocale(locale === "en" ? "vi" : "en");
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl hidden md:block">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xl font-black italic tracking-tighter text-amber-500 uppercase font-display-auction"
          >
            GALLERY X
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-8 font-display-auction font-medium tracking-tight">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-1 border-b-2 transition-all duration-300 ${
                  isActive
                    ? "text-amber-500 border-amber-500"
                    : "text-slate-400 hover:text-white border-transparent hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-all hover:bg-white/10 duration-300 px-3 py-1.5 rounded-full border border-white/5 hover:border-white/20 bg-white/5"
            title={t("lang.switchTo")}
          >
            <div className="w-5 h-3.5 relative overflow-hidden rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.3)] border border-white/20">
              <img 
                src={locale === "en" ? "https://flagcdn.com/w40/gb.png" : "https://flagcdn.com/w40/vn.png"} 
                alt={locale === "en" ? "UK Flag" : "VN Flag"}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display-auction text-[11px] font-bold uppercase tracking-widest">{t("lang.current")}</span>
          </button>

          {/* Notification Bell */}
          <NotificationDropdown />

          {/* Wallet Button */}
          <Link
            href="/dashboard/wallet"
            className="text-slate-400 hover:text-white transition-colors hover:bg-white/5 duration-300 p-2 rounded-full"
          >
            <span className="material-symbols-outlined">
              account_balance_wallet
            </span>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/auctions"
                className="bg-amber-500 text-slate-950 font-display-auction font-bold text-sm px-6 py-2 rounded-full hover:bg-amber-400 transition-colors active:scale-95 shadow-lg"
              >
                {t("nav.placeBid")}
              </Link>
              <div className="relative group">
                <Link href="/dashboard/profile">
                  <img
                    alt="User profile avatar"
                    className="w-10 h-10 rounded-full border border-white/20 hover:border-amber-500 transition-colors cursor-pointer"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtEsUgPP-7r0ywwFrO4AFHuO51B_jdW9vP46kx6X_XfxBfcogeZNiBsorkE8XWzEU6KY62EWVOw0dGrrma6xq51njkgG8UZdfzxX5lM6Q0IJjv5-5iiPJwYTiRmVp_cQ0zWMl1JA3Iynv3bPeshxrRfh9Af6xmqxS2P7rNUb9iMbC9xzRIgFXThRvTXIc_0AAVTTZjKaiDlMRfcAOXiGdBAORUhiEk1nygEYQrIyRNwaQlRss7bkRDKqWuTS_OeHObrb31WeqGXPg"
                  />
                </Link>
                <div className="absolute right-0 mt-2 w-48 bg-surface-container border border-outline-variant rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="p-3 border-b border-outline-variant">
                    <p className="font-label-bold text-sm text-on-surface truncate">{user.name}</p>
                    <p className="font-body-md text-xs text-on-surface-variant truncate">{user.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link href="/dashboard" className="w-full text-left px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors font-label-bold flex items-center gap-2 block">
                      <span className="material-symbols-outlined text-[16px]">dashboard</span>
                      {t("nav.dashboard")}
                    </Link>
                    <Link href="/dashboard/wallet" className="w-full text-left px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors font-label-bold flex items-center gap-2 block">
                      <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                      {t("nav.wallet")}
                    </Link>
                    <Link href="/dashboard/notifications" className="w-full text-left px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-variant rounded-lg transition-colors font-label-bold flex items-center gap-2 block">
                      <span className="material-symbols-outlined text-[16px]">notifications</span>
                      {t("nav.notifications")}
                    </Link>
                    <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors font-label-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      {t("nav.signOut")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-amber-500 hover:text-amber-400 font-display-auction font-bold text-sm transition-colors"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/register"
                className="bg-amber-500 text-slate-950 font-display-auction font-bold text-sm px-6 py-2 rounded-full hover:bg-amber-400 transition-colors shadow-lg"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

