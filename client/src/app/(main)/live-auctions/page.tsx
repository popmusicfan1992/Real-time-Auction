"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LiveAuctionsPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-20 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 px-4 py-2 rounded-full mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-label-bold text-xs uppercase tracking-widest">{t("marketplacePages.liveNowBadge")}</span>
        </div>
        <h1 className="font-display-auction text-5xl md:text-6xl font-extrabold text-on-surface mb-6">
          {t("marketplacePages.liveAuctionsTitle").split(" ")[0]}{" "}
          <span className="text-secondary italic">{t("marketplacePages.liveAuctionsTitle").split(" ").slice(1).join(" ")}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
          {t("marketplacePages.liveAuctionsSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: "speed", title: t("marketplacePages.realTimeBidding"), desc: t("marketplacePages.realTimeBiddingDesc") },
          { icon: "visibility", title: t("marketplacePages.liveTracking"), desc: t("marketplacePages.liveTrackingDesc") },
          { icon: "notifications_active", title: t("marketplacePages.instantAlerts"), desc: t("marketplacePages.instantAlertsDesc") },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-surface-container rounded-3xl p-8 border border-white/5 hover:border-secondary/20 transition-all group animate-slide-up"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <div className="w-14 h-14 rounded-2xl bg-surface-variant flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-secondary text-3xl">{feature.icon}</span>
            </div>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface mb-4 group-hover:text-secondary transition-colors">
              {feature.title}
            </h3>
            <p className="font-body-md text-on-surface-variant leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-surface-container-high to-surface-container rounded-3xl p-8 md:p-12 border border-red-500/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex-grow">
          <h2 className="font-display-auction text-3xl font-bold text-on-surface mb-4">{t("marketplacePages.joinLiveAction")}</h2>
          <p className="font-body-md text-on-surface-variant max-w-xl leading-relaxed">
            {t("marketplacePages.joinLiveActionDesc")}
          </p>
        </div>
        <Link href="/auctions" className="bg-secondary text-on-secondary font-label-bold px-8 py-4 rounded-full hover:bg-secondary-fixed transition-all shadow-lg shadow-secondary/20 whitespace-nowrap">
          {t("marketplacePages.enterAuctionRoom")}
        </Link>
      </div>
    </div>
  );
}
