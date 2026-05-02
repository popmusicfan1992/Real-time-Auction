"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ArticleDetail() {
  const { slug } = useParams();
  const { t } = useLanguage();

  // Mock data mapping (simplified)
  const titles: Record<string, string> = {
    "heritage-watches-2026": "The Renaissance of Heritage Timepieces",
    "modern-art-investment": "Digital Provenance in Modern Art",
    "classic-cars-future": "The Electric Shift in Classic Collecting",
    "rare-diamonds-market": "The Rarity Factor: Pink Diamonds",
  };

  const title = titles[slug as string] || "Exploring Luxury Assets";

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 animate-fade-in">
      <Link 
        href="/journal" 
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors mb-8 group"
      >
        <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-label-bold text-sm uppercase tracking-widest">{t("journal.backToJournal")}</span>
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <span className="font-label-bold text-[10px] text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
            {t("journal.editorial")}
          </span>
          <span className="text-xs text-on-surface-variant">May 01, 2026 • 8 {t("journal.readTime")}</span>
        </div>
        <h1 className="font-display-auction text-4xl md:text-6xl font-extrabold text-on-surface leading-tight mb-8">
          {title}
        </h1>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container border border-white/5">
          <div className="w-12 h-12 rounded-full bg-surface-variant overflow-hidden">
             <img src="https://lh3.googleusercontent.com/a/ACg8ocL8_vO1t_U8_p1L_Y-Z_M_Q=s96-c" alt="Author" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-label-bold text-sm text-on-surface">Gallery X Editorial</p>
            <p className="text-xs text-on-surface-variant">Luxury Market Analyst</p>
          </div>
        </div>
      </header>

      <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200" 
          alt="Featured image" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <article className="prose prose-invert prose-amber max-w-none font-body-lg text-on-surface-variant leading-relaxed space-y-8">
        <p className="text-xl text-on-surface font-medium leading-relaxed italic border-l-4 border-secondary pl-6">
          "The landscape of luxury collecting is undergoing a tectonic shift. What was once defined by physical possession is now being redefined by historical significance and digital transparency."
        </p>

        <p>
          In the ever-evolving world of high-stakes auctions, the definition of value is constantly being rewritten. As we move deeper into 2026, we are witnessing a fascinating convergence of traditional craftsmanship and cutting-edge technology. This intersection is creating new opportunities for collectors while challenging long-held assumptions about asset appreciation.
        </p>

        <h2 className="font-display-auction text-3xl font-bold text-on-surface pt-4">The Shift in Market Sentiment</h2>
        <p>
          Recent data from our internal analytics suggests a 45% increase in interest for assets with verifiable digital provenance. This isn't just about NFTs; it's about a comprehensive digital twin for physical assets that records every service, every previous owner, and every moment of historical significance.
        </p>

        <img 
          src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200" 
          className="w-full h-96 object-cover rounded-2xl my-12"
          alt="Market analysis"
        />

        <h2 className="font-display-auction text-3xl font-bold text-on-surface pt-4">Advice for the Modern Collector</h2>
        <p>
          For those looking to build a resilient portfolio, the key is diversification across asset classes that show low correlation with traditional markets. Fine art, vintage horology, and limited-edition automotive assets continue to serve as excellent hedges against inflation, provided the provenance is impeccable.
        </p>

        <p>
          As always, Gallery X remains at the forefront of this evolution, providing our members with not just a platform for acquisition, but a comprehensive ecosystem for asset management and verification.
        </p>
      </article>

      <footer className="mt-20 pt-12 border-t border-white/5">
        <div className="bg-surface-container rounded-3xl p-8 md:p-12 text-center animate-newsletter-glow">
          <h3 className="font-display-auction text-3xl font-bold text-on-surface mb-4">{t("journal.stayInformed")}</h3>
          <p className="text-on-surface-variant mb-8 max-w-md mx-auto">{t("journal.newsletterDesc")}</p>
          <Link 
            href="/register" 
            className="inline-block bg-secondary text-on-secondary font-label-bold px-8 py-4 rounded-full hover:bg-secondary-fixed transition-all"
          >
            {t("journal.joinCircle")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
