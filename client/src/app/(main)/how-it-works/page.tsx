"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HowItWorksPage() {
  const { t } = useLanguage();

  const steps = [
    {
      number: "01",
      icon: "shield_person",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      title: t("marketplacePages.step1Title"),
      desc: t("marketplacePages.step1Desc"),
      details: [
        t("marketplacePages.step1Detail1"),
        t("marketplacePages.step1Detail2"),
        t("marketplacePages.step1Detail3"),
      ],
    },
    {
      number: "02",
      icon: "account_balance_wallet",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20",
      title: t("marketplacePages.step2Title"),
      desc: t("marketplacePages.step2Desc"),
      details: [
        t("marketplacePages.step2Detail1"),
        t("marketplacePages.step2Detail2"),
        t("marketplacePages.step2Detail3"),
      ],
    },
    {
      number: "03",
      icon: "gavel",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/20",
      title: t("marketplacePages.step3Title"),
      desc: t("marketplacePages.step3Desc"),
      details: [
        t("marketplacePages.step3Detail1"),
        t("marketplacePages.step3Detail2"),
        t("marketplacePages.step3Detail3"),
      ],
    },
    {
      number: "04",
      icon: "workspace_premium",
      color: "text-tertiary",
      bgColor: "bg-tertiary/10",
      borderColor: "border-tertiary/20",
      title: t("marketplacePages.step4Title"),
      desc: t("marketplacePages.step4Desc"),
      details: [
        t("marketplacePages.step4Detail1"),
        t("marketplacePages.step4Detail2"),
        t("marketplacePages.step4Detail3"),
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-20 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-secondary/15 border border-secondary/30 px-4 py-2 rounded-full mb-6">
          <span className="material-symbols-outlined text-secondary text-lg">info</span>
          <span className="text-secondary font-label-bold text-xs uppercase tracking-widest">{t("marketplacePages.guideBadge")}</span>
        </div>
        <h1 className="font-display-auction text-5xl md:text-6xl font-extrabold text-on-surface mb-6">
          {t("marketplacePages.howItWorksTitle").split(" ")[0]}{" "}
          <span className="text-secondary italic">{t("marketplacePages.howItWorksTitle").split(" ").slice(1).join(" ")}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
          {t("marketplacePages.howItWorksSubtitle")}
        </p>
      </div>

      <div className="space-y-8 mb-20">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`bg-surface-container rounded-3xl p-8 md:p-10 border border-white/5 hover:${step.borderColor} transition-all group animate-slide-up relative overflow-hidden`}
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <div className={`absolute -right-8 -top-8 w-40 h-40 ${step.bgColor} rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-700`} />
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-price-display text-5xl font-bold text-on-surface-variant/20">{step.number}</span>
                <div className={`w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center border border-white/10`}>
                  <span className={`material-symbols-outlined ${step.color} text-3xl`}>{step.icon}</span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-headline-md text-2xl font-bold text-on-surface mb-3">{step.title}</h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed mb-4">{step.desc}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className={`material-symbols-outlined text-[16px] ${step.color}`}>check_circle</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-surface-container-high to-surface-container rounded-3xl p-8 md:p-12 border border-secondary/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
        <div className="flex-grow text-center md:text-left">
          <h2 className="font-display-auction text-3xl font-bold text-on-surface mb-4">{t("marketplacePages.readyToStart")}</h2>
          <p className="font-body-md text-on-surface-variant max-w-xl leading-relaxed">
            {t("marketplacePages.readyToStartDesc")}
          </p>
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/register" className="bg-secondary text-on-secondary font-label-bold px-8 py-4 rounded-full hover:bg-secondary-fixed transition-all shadow-lg shadow-secondary/20 whitespace-nowrap">
            {t("marketplacePages.createAccount")}
          </Link>
          <Link href="/auctions" className="border border-outline text-on-surface font-label-bold px-8 py-4 rounded-full hover:bg-surface-variant transition-all whitespace-nowrap">
            {t("marketplacePages.browseCatalog")}
          </Link>
        </div>
      </div>
    </div>
  );
}
