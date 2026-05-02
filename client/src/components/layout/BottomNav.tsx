"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/", icon: "home", label: t("bottomNav.home") },
    { href: "/auctions", icon: "explore", label: t("bottomNav.explore") },
    { href: "/auctions/live", icon: "gavel", label: t("bottomNav.live") },
    { href: "/dashboard/wallet", icon: "account_balance_wallet", label: t("bottomNav.wallet") },
    { href: "/dashboard/profile", icon: "person", label: t("bottomNav.profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 md:hidden bg-slate-950/90 backdrop-blur-lg border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 rounded-t-2xl">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 transition-transform ${
              isActive
                ? "text-amber-500 scale-110"
                : "text-slate-500 hover:text-amber-400"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {item.icon}
            </span>
            <span className="font-display-auction text-[10px] uppercase font-bold tracking-widest">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

