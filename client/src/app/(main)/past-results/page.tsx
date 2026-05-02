"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PastResultsPage() {
  const { t } = useLanguage();

  const results = [
    {
      img: "https://images.unsplash.com/photo-1474722883778-792e7990302f?q=80&w=800",
      title: "Vintage Bordeaux Grand Cru Collection",
      finalPrice: "$18,200",
      category: t("marketplacePages.collectiblesLabel"),
      date: "Apr 2026",
    },
    {
      img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800",
      title: "Apple Macintosh 128K (1984)",
      finalPrice: "$8,500",
      category: t("marketplacePages.technologyLabel"),
      date: "Apr 2026",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-20 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-tertiary/15 border border-tertiary/30 px-4 py-2 rounded-full mb-6">
          <span className="material-symbols-outlined text-tertiary text-lg">history</span>
          <span className="text-tertiary font-label-bold text-xs uppercase tracking-widest">{t("marketplacePages.archiveBadge")}</span>
        </div>
        <h1 className="font-display-auction text-5xl md:text-6xl font-extrabold text-on-surface mb-6">
          {t("marketplacePages.pastResultsTitle").split(" ")[0]}{" "}
          <span className="text-secondary italic">{t("marketplacePages.pastResultsTitle").split(" ").slice(1).join(" ")}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
          {t("marketplacePages.pastResultsSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {results.map((result, idx) => (
          <div
            key={idx}
            className="bg-surface-container rounded-2xl overflow-hidden border border-white/5 hover:border-secondary/20 transition-all group animate-slide-up flex flex-col"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="relative h-64 w-full overflow-hidden">
              <img
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                alt={result.title}
                src={result.img}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="bg-surface-variant/90 text-on-surface px-2 py-1 rounded font-label-bold text-[10px] uppercase shadow">
                  {t("marketplacePages.soldLabel")}
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-3 flex-grow">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-label-bold text-tertiary uppercase tracking-wider">{result.category}</span>
                <span className="text-[10px] text-on-surface-variant">• {result.date}</span>
              </div>
              <h3 className="font-headline-md text-xl font-semibold text-on-surface leading-tight">
                {result.title}
              </h3>
              <div className="flex justify-between items-end pt-3 border-t border-white/5 mt-auto">
                <div>
                  <p className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                    {t("marketplacePages.hammerPrice")}
                  </p>
                  <p className="font-price-display text-2xl font-bold text-secondary">{result.finalPrice}</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-2xl">gavel</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-high rounded-3xl p-12 flex flex-col items-center text-center">
        <span className="material-symbols-outlined text-secondary text-5xl mb-6">query_stats</span>
        <h2 className="font-display-auction text-3xl font-bold text-on-surface mb-4">{t("marketplacePages.marketInsights")}</h2>
        <p className="font-body-md text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
          {t("marketplacePages.marketInsightsDesc")}
        </p>
        <Link href="/auctions" className="border border-secondary text-secondary hover:bg-secondary/10 font-label-bold px-8 py-4 rounded-full transition-all">
          {t("marketplacePages.browseCatalog")}
        </Link>
      </div>
    </div>
  );
}
