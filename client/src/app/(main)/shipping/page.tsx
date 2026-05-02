"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function ShippingPage() {
  const { t } = useLanguage();

  const services = [
    {
      title: "White-Glove Delivery",
      desc: "For ultra-high-value assets, we provide temperature-controlled, armored transport with professional handling and installation services."
    },
    {
      title: "Global Export & Customs",
      desc: "Our logistics team handles all international documentation, CITES permits, and customs clearance to ensure a seamless cross-border experience."
    },
    {
      title: "Insured Transit",
      desc: "Every shipment is fully insured at the final hammer price through our partnerships with Lloyd's of London and AXA Art Insurance."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-16 animate-fade-in">
        <h1 className="font-display-auction text-5xl font-extrabold text-on-surface mb-4">
          {t("shipping.title").split(" ")[0]} <span className="text-secondary italic">{t("shipping.title").split(" ").slice(1).join(" ")}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          {t("shipping.subtitle")}
        </p>
      </div>

      <div className="relative rounded-3xl overflow-hidden h-[400px] mb-16 shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200" 
          alt="Logistics background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 max-w-md">
          <p className="bg-secondary/90 text-on-secondary px-4 py-1.5 rounded-full w-max text-xs font-label-bold uppercase tracking-widest mb-4">{t("shipping.globalNetwork")}</p>
          <h2 className="text-3xl font-bold text-on-surface">{t("shipping.countriesServed")}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {services.map((service, idx) => (
          <div 
            key={idx} 
            className="p-8 rounded-3xl bg-surface-container border border-white/5 hover:border-secondary/20 transition-all group animate-slide-up"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <h3 className="font-headline-md text-xl font-bold text-on-surface mb-4 group-hover:text-secondary transition-colors">
              {service.title}
            </h3>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              {service.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-high rounded-3xl p-12 flex flex-col items-center text-center">
        <span className="material-symbols-outlined text-secondary text-5xl mb-6">package_2</span>
        <h2 className="font-display-auction text-3xl font-bold text-on-surface mb-4">{t("shipping.calculator")}</h2>
        <p className="font-body-md text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
          {t("shipping.calculatorDesc")}
        </p>
        <a href="/auctions" className="border border-secondary text-secondary hover:bg-secondary/10 font-label-bold px-8 py-4 rounded-full transition-all">
          {t("home.viewCatalog")}
        </a>
      </div>
    </div>
  );
}
