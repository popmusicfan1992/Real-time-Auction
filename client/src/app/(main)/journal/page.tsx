"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function JournalPage() {
  const { t } = useLanguage();

  const articles = [
    {
      slug: "heritage-watches-2026",
      img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800",
      tag: "Heritage",
      tagColor: "text-secondary",
      title: "The Renaissance of Heritage Timepieces",
      excerpt: "Why vintage movements are outperforming modern complications in the 2026 secondary market. A deep dive into the world of mechanical mastery.",
      date: "Apr 28, 2026",
      readTime: "5 min read",
    },
    {
      slug: "modern-art-investment",
      img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800",
      tag: "Investment",
      tagColor: "text-primary",
      title: "Digital Provenance in Modern Art",
      excerpt: "How blockchain technology is revolutionizing authentication and ownership in the fine art world, ensuring lifetime value for collectors.",
      date: "Apr 25, 2026",
      readTime: "7 min read",
    },
    {
      slug: "classic-cars-future",
      img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800",
      tag: "Vehicles",
      tagColor: "text-tertiary",
      title: "The Electric Shift in Classic Collecting",
      excerpt: "Can an EV-converted Porsche still be considered a classic? We explore the growing trend of sustainable luxury in automotive auctions.",
      date: "Apr 22, 2026",
      readTime: "6 min read",
    },
    {
      slug: "rare-diamonds-market",
      img: "https://images.unsplash.com/photo-1588444650733-d0c51d7f6494?q=80&w=800",
      tag: "Jewelry",
      tagColor: "text-amber-400",
      title: "The Rarity Factor: Pink Diamonds",
      excerpt: "Analyzing the exponential growth in value of Argyle pink diamonds following the mine closure. Is now the time to sell or hold?",
      date: "Apr 18, 2026",
      readTime: "4 min read",
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-12 animate-fade-in">
        <h1 className="font-display-auction text-5xl font-extrabold text-on-surface mb-4">
          The <span className="text-secondary italic">Journal</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          {t("journal.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, idx) => (
          <Link 
            key={article.slug} 
            href={`/journal/${article.slug}`}
            className="bg-surface-container rounded-2xl overflow-hidden border border-white/5 hover:border-secondary/30 transition-all duration-500 group hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-slide-up flex flex-col"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="relative h-64 w-full overflow-hidden">
              <img
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                alt={article.title}
                src={article.img}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className={`font-label-bold text-[10px] ${article.tagColor} uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10`}>
                  {article.tag}
                </span>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4 flex-grow">
              <h2 className="font-headline-md text-2xl font-semibold text-on-surface leading-tight group-hover:text-secondary transition-colors">
                {article.title}
              </h2>
              <p className="font-body-md text-on-surface-variant leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-xs text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  {article.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  {article.readTime}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
