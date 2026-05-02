"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function WalletGuidePage() {
  const { t } = useLanguage();

  const sections = [
    {
      title: "Funding Your Account",
      icon: "account_balance",
      content: "Gallery X supports bank transfers, major credit cards, and premium crypto-wallets. For high-value transactions, we recommend Wire Transfers to ensure immediate liquidity for live bidding."
    },
    {
      title: "Understanding Deposits",
      icon: "lock",
      content: "Most auctions require a temporary hold (deposit) to verify bidding intent. This amount is automatically released if you don't win, or applied toward your final purchase if successful."
    },
    {
      title: "Transaction Limits",
      icon: "verified",
      content: "New accounts have a standard bidding limit. To increase your purchasing power, complete the KYC (Know Your Customer) verification in your profile settings."
    },
    {
      title: "Settlement & Fees",
      icon: "receipt_long",
      content: "All payments must be settled within 48 hours of auction closing. Final prices include the hammer price, buyer's premium, and applicable local taxes."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-16 animate-fade-in">
        <h1 className="font-display-auction text-5xl font-extrabold text-on-surface mb-4">
          {t("walletGuide.title").split(" ")[0]} <span className="text-secondary italic">{t("walletGuide.title").split(" ").slice(1).join(" ")}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          {t("walletGuide.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {sections.map((section, idx) => (
          <div 
            key={idx} 
            className="bg-surface-container rounded-3xl p-8 border border-white/5 hover:border-secondary/20 transition-all group animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="w-14 h-14 rounded-2xl bg-surface-variant flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-secondary text-3xl">{section.icon}</span>
            </div>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface mb-4 group-hover:text-secondary transition-colors">
              {section.title}
            </h3>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-surface-container-high to-surface-container rounded-3xl p-8 md:p-12 border border-secondary/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
        <div className="flex-grow">
          <h2 className="font-display-auction text-3xl font-bold text-on-surface mb-4">{t("walletGuide.readyToStart")}</h2>
          <p className="font-body-md text-on-surface-variant max-w-xl leading-relaxed">
            {t("walletGuide.readyToStartDesc")}
          </p>
        </div>
        <div className="flex gap-4">
          <a href="/dashboard/wallet" className="bg-secondary text-on-secondary font-label-bold px-8 py-4 rounded-full hover:bg-secondary-fixed transition-all shadow-lg shadow-secondary/20 whitespace-nowrap">
            {t("walletGuide.goToWallet")}
          </a>
        </div>
      </div>
    </div>
  );
}
