"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CuratedCollectionsPage() {
  const { t } = useLanguage();

  const collections = [
    {
      img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800",
      category: t("marketplacePages.collectionWatches"),
      title: t("marketplacePages.collectionWatchesTitle"),
      count: "12 lots",
    },
    {
      img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800",
      category: t("marketplacePages.collectionArt"),
      title: t("marketplacePages.collectionArtTitle"),
      count: "8 lots",
    },
    {
      img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800",
      category: t("marketplacePages.collectionVehicles"),
      title: t("marketplacePages.collectionVehiclesTitle"),
      count: "5 lots",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-20 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-secondary/15 border border-secondary/30 px-4 py-2 rounded-full mb-6">
          <span className="material-symbols-outlined text-secondary text-lg">auto_awesome</span>
          <span className="text-secondary font-label-bold text-xs uppercase tracking-widest">{t("marketplacePages.expertPicked")}</span>
        </div>
        <h1 className="font-display-auction text-5xl md:text-6xl font-extrabold text-on-surface mb-6">
          {t("marketplacePages.curatedCollectionsTitle").split(" ")[0]}{" "}
          <span className="text-secondary italic">{t("marketplacePages.curatedCollectionsTitle").split(" ").slice(1).join(" ")}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
          {t("marketplacePages.curatedCollectionsSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {collections.map((collection, idx) => (
          <Link
            key={idx}
            href="/auctions"
            className="bg-surface-container rounded-2xl overflow-hidden border border-white/5 hover:border-secondary/30 transition-all duration-500 group hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-slide-up flex flex-col"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="relative h-64 w-full overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                alt={collection.title}
                src={collection.img}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="font-label-bold text-[10px] text-secondary uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {collection.category}
                </span>
                <span className="font-label-bold text-[10px] text-on-surface-variant uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {collection.count}
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-3 flex-grow">
              <h2 className="font-headline-md text-2xl font-semibold text-on-surface leading-tight group-hover:text-secondary transition-colors">
                {collection.title}
              </h2>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-br from-surface-container-high to-surface-container rounded-3xl p-8 md:p-12 border border-secondary/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
        <div className="flex-grow">
          <h2 className="font-display-auction text-3xl font-bold text-on-surface mb-4">{t("marketplacePages.exploreFull")}</h2>
          <p className="font-body-md text-on-surface-variant max-w-xl leading-relaxed">
            {t("marketplacePages.exploreFullDesc")}
          </p>
        </div>
        <Link href="/auctions" className="bg-secondary text-on-secondary font-label-bold px-8 py-4 rounded-full hover:bg-secondary-fixed transition-all shadow-lg shadow-secondary/20 whitespace-nowrap">
          {t("marketplacePages.viewAllCollections")}
        </Link>
      </div>
    </div>
  );
}
