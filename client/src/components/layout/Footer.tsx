"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const marketplaceLinks = [
    { label: t("footer.liveAuctions"), href: "/live-auctions" },
    { label: t("footer.upcomingLots"), href: "/upcoming-lots" },
    { label: t("footer.curatedCollections"), href: "/curated-collections" },
    { label: t("footer.pastResults"), href: "/past-results" },
    { label: t("footer.howItWorks"), href: "/how-it-works" },
  ];

  return (
    <footer className="w-full bg-surface-container border-t border-outline-variant pt-16 pb-24 md:pb-12 mt-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & About */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black text-on-surface font-display-auction tracking-tighter">
                GALLERY<span className="text-secondary">X</span>
              </span>
            </Link>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              {t("footer.brandDescription")}
            </p>
            <div className="flex items-center gap-4">
              {["facebook", "x", "instagram", "discord"].map((social) => (
                <Link
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-secondary/20 hover:text-secondary transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-xl">
                    {social === "facebook" ? "facebook" : social === "x" ? "close" : social === "instagram" ? "photo_camera" : "forum"}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Marketplace */}
          <div>
            <h4 className="font-label-bold text-xs text-on-surface uppercase tracking-widest mb-6">{t("footer.marketplace")}</h4>
            <ul className="flex flex-col gap-4">
              {marketplaceLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-body-md text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="font-label-bold text-xs text-on-surface uppercase tracking-widest mb-6">{t("footer.resources")}</h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/journal" className="font-body-md text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200">
                  {t("footer.theJournal")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="font-body-md text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200">
                  {t("footer.helpCenter")}
                </Link>
              </li>
              <li>
                <Link href="/wallet-guide" className="font-body-md text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200">
                  {t("footer.walletGuide")}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="font-body-md text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200">
                  {t("footer.shippingLogistics")}
                </Link>
              </li>
              <li>
                <Link href="/security" className="font-body-md text-sm text-on-surface-variant hover:text-secondary transition-colors duration-200">
                  {t("footer.securityAuth")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Office */}
          <div className="flex flex-col gap-6">
            <h4 className="font-label-bold text-xs text-on-surface uppercase tracking-widest">{t("footer.globalConcierge")}</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">mail</span>
                <div>
                  <p className="text-[11px] font-label-bold text-on-surface-variant uppercase">{t("footer.emailSupport")}</p>
                  <p className="font-body-md text-sm text-on-surface">popmusicfan1992@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">location_on</span>
                <div>
                  <p className="text-[11px] font-label-bold text-on-surface-variant uppercase">{t("footer.flagshipOffice")}</p>
                  <p className="font-body-md text-sm text-on-surface leading-snug">
                    14 Nguyen Luong Bang , <br /> Danang , Vietnam
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={scrollToTop}
              className="mt-4 flex items-center gap-2 font-label-bold text-xs text-secondary hover:text-secondary-fixed transition-colors group"
            >
              {t("footer.backToTop")}
              <span className="material-symbols-outlined text-[16px] group-hover:-translate-y-1 transition-transform">arrow_upward</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-[11px] font-label-bold text-on-surface-variant uppercase tracking-wider">
            <p>{t("footer.copyright")}</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-on-surface transition-colors">{t("footer.privacyPolicy")}</Link>
              <Link href="#" className="hover:text-on-surface transition-colors">{t("footer.termsOfService")}</Link>
              <Link href="#" className="hover:text-on-surface transition-colors">{t("footer.cookiePolicy")}</Link>
            </div>
          </div>
          <div className="flex items-center gap-4 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="text-[10px] font-label-bold">{t("footer.securePayment")}</span>
             </div>
             <div className="w-px h-4 bg-outline-variant" />
             <div className="flex items-center gap-1 text-xs">
                <span className="font-bold tracking-tighter">VISA</span>
             </div>
             <div className="flex items-center gap-1 text-xs">
                <span className="font-bold tracking-tighter italic">Stripe</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
