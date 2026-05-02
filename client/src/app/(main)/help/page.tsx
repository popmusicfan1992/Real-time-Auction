"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function HelpCenterPage() {
  const { t } = useLanguage();

  const faqs = [
    {
      q: "How do I participate in a live auction?",
      a: "To bid in a live auction, you must first create an account and verify your identity. Once verified, ensure your wallet has sufficient funds for the required deposit of the specific lot you're interested in. When the auction starts, you can place bids in real-time through our interactive bidding room."
    },
    {
      q: "What is the 'Buyer's Premium'?",
      a: "The Buyer's Premium is an additional fee on top of the hammer price (winning bid) that covers administrative costs, insurance, and the platform's service fee. Our standard premium is 15% for items under $100k and 12.5% for items above $100k."
    },
    {
      q: "How are items authenticated?",
      a: "Every item on Gallery X undergoes a rigorous multi-stage verification process by independent specialists. We partner with world-renowned experts in horology, fine art, and collectibles to provide a comprehensive certificate of authenticity for every sale."
    },
    {
      q: "Can I cancel a bid?",
      a: "Bids placed on Gallery X are legally binding contracts. Once a bid is submitted, it cannot be canceled or retracted. This ensures the integrity and fairness of the auction process for all participants."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-16 animate-fade-in">
        <h1 className="font-display-auction text-5xl font-extrabold text-on-surface mb-4">
          {t("help.title").split(" ")[0]} <span className="text-secondary italic">{t("help.title").split(" ").slice(1).join(" ")}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          {t("help.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">quiz</span>
            {t("help.faqs")}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-surface-container rounded-2xl p-6 border border-white/5 hover:border-secondary/20 transition-all group animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <h3 className="font-headline-sm text-lg font-semibold text-on-surface mb-3 group-hover:text-secondary transition-colors">
                  {faq.q}
                </h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-high rounded-3xl p-8 border border-secondary/20 shadow-2xl">
            <h3 className="font-display-auction text-xl font-bold text-on-surface mb-4">{t("help.stillNeedHelp")}</h3>
            <p className="font-body-md text-sm text-on-surface-variant mb-6 leading-relaxed">
              {t("help.conciergeDesc")}
            </p>
            <div className="space-y-4">
              <a href="mailto:popmusicfan1992@gmail.com" className="flex items-center gap-3 p-4 rounded-xl bg-surface-container hover:bg-secondary/10 transition-colors border border-white/5 group">
                <span className="material-symbols-outlined text-secondary">mail</span>
                <div>
                  <p className="font-label-bold text-xs text-on-surface-variant uppercase">{t("footer.emailSupport")}</p>
                  <p className="text-sm text-on-surface font-medium">popmusicfan1992@gmail.com</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container border border-white/5">
                <span className="material-symbols-outlined text-secondary">support_agent</span>
                <div>
                  <p className="font-label-bold text-xs text-on-surface-variant uppercase">Live Concierge</p>
                  <p className="text-sm text-on-surface font-medium">Available for Verified Members</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container rounded-3xl p-8 border border-white/5">
            <h3 className="font-label-bold text-xs text-secondary uppercase tracking-widest mb-4">{t("help.quickResources")}</h3>
            <ul className="space-y-3">
              <li><a href="/wallet-guide" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">{t("footer.walletGuide")}</a></li>
              <li><a href="/shipping" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">{t("footer.shippingLogistics")}</a></li>
              <li><a href="/security" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">{t("footer.securityAuth")}</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
