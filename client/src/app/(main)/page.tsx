import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GALLERY X | Premium Real-Time Auction Platform",
  description:
    "Gain exclusive access to the world's most coveted assets. Real-time bidding, verified provenance, and uncompromising security.",
};

const auctionLots = [
  {
    id: 1,
    title: "Patek Philippe Nautilus",
    lot: "Lot 42",
    currentBid: "$185,000",
    closesIn: "45m 12s",
    status: "live",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDs2Rn5uPcpbqrLFZzisY4odO-L9spVLdg6DKsSsonC1RDnmhi5sYICKKHFrvYKO4yuFKZm5TNuel50XobZ9k_9_0q2m0Z4Kv-Q7NwZp9gctKz5K1K70T-sexxB-zjx63-147y8BMCPE8hVIwNVVkqbZ4SWowaKNWTCxhgJew9QBNjSmtrTTV-wrHn0RQWwPZ-hhPcuDzRcxrIL3UI53pWOtUNy1wKbZjt4Y4eMefI8ZbJFXeALwvynFUGaajeglNcuJ9eEBIAU-80",
    verified: true,
  },
  {
    id: 2,
    title: "Modernist Bronze II",
    lot: "Lot 88",
    currentBid: "$42,500",
    closesIn: "2h 15m",
    status: "live",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDsHZbLHBuON6dYRmbMccPxAPSMf7LAxd1YSs3hK3_UsTGvA5VnsKzjOYEBN4K2Nw99x43OLRLGUW9NY4bLaqePfHa4jE5WqGgSKqWochDHmw2wgsPcPNxo_taVct3x5wvRBzWL6HZLT1tSkCcsfzVzTqM6Bbr4hTSrFVuL_5Z4s8XKoTX5yQA6BIP5A0KVbM6XVxXHOpuAb4FCWBpYMLaMM4XviBWOcsox1wJjXXm6oL3Ffs8t89jl2MrTgcmLEAsyx9KQYSON5z4",
    verified: true,
  },
  {
    id: 3,
    title: "Flawless 5ct Diamond",
    lot: "Lot 12",
    currentBid: "$210,000",
    closesIn: "5h 30m",
    status: "live",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBnRBsh-t8fmync8d-4JdvtGrx9YlOpkccvDHBpGrO9t_jtHYgKKnEMXPHUgJC-Z-pb0aQnQokWeBVqFIjTT6WAhG5gmlc9I6FnDFXdIjWPll8Q34ghJDRkNTdc2z2HVc9XIrIcSyZAYFgQVY16bv3IJqSHY2EML7WtjQVZIcrpFX3Aow22bmEo8iTWw5qrCpM6Bg_cDzMRIjfBE4ZjJ1dcXdmr8WvCNjvjcifRE-6etYXO4ou1k9bmGDCBAEGVJuz3uhJYNkgJBN0",
    verified: false,
  },
  {
    id: 4,
    title: "Vintage Bordeaux Set",
    lot: "Lot 04",
    currentBid: "$18,200",
    closesIn: "",
    status: "ended",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuANV6R8-xH2XZxQpIwZMoneNNQn3-dBGEeyQif8pOx44bf2HzhaBO-41AppZbqyPPH_XYHId6Xyb7U1juX5_5jxpjzPcKmSu1ZlAuMkZvvK-y1yjofx0C4qAOA_svu2NNwMUJXaKfPXUCL18b3naasUMGYsJC7lgMglEU0SJGmeEp_eH9oD7jIMJU2IaGJCBOdj8iBDpwxckPJs5_47ybJn0Wo-WMjq7yDZf8g9AxWdHbVsJ3iV9SxkA479zCHZKvOKOSfdm0nUYy8",
    verified: false,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="max-w-7xl w-full mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative">
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="lg:col-span-5 flex flex-col gap-4 z-10">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-1 bg-error-container/20 border border-error/30 px-3 py-1.5 rounded-full w-max backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <span className="text-error font-label-bold text-sm tracking-widest uppercase">
              Live Now
            </span>
          </div>

          <h1 className="font-display-auction text-5xl font-extrabold text-on-surface leading-tight">
            Own the{" "}
            <span className="text-secondary italic pr-2">Exceptional.</span>
          </h1>

          <p className="font-body-lg text-lg text-on-surface-variant max-w-md leading-relaxed">
            Gain exclusive access to the world&apos;s most coveted assets.
            Real-time bidding, verified provenance, and uncompromising security.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Link
              href="/auctions"
              className="bg-secondary text-on-secondary font-label-bold text-sm px-6 py-4 rounded-full shadow-[0_10px_30px_rgba(238,152,0,0.3)] hover:bg-secondary-fixed transition-colors"
            >
              Start Bidding
            </Link>
            <Link
              href="/auctions"
              className="bg-transparent border border-outline text-on-surface font-label-bold text-sm px-6 py-4 rounded-full hover:bg-surface-variant transition-colors"
            >
              View Catalog
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="lg:col-span-7 relative w-full aspect-[4/3] lg:aspect-auto lg:h-[600px] rounded-xl overflow-hidden group">
          <img
            className="w-full h-full object-cover rounded-xl"
            alt="Premium luxury sports car in a dark automotive gallery with dramatic spotlighting"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYHKJal6gtIfWz3Y_Wy1Cy4LbBliFTiWx16aZgOAdqdE2B37BXKyGaq83sZFH1sJm9e3C3XAr4iQ5H9-ejRFxwC2u3B9T9Nmdk1qIp42K6zRLwE58sZg-JAnnuhZm1Bl3efITrkZnxiatxalmyfOSW-o1nGNN0xBmoy0pzLqzi3NeQR49Gwc8Ako3cIVuPIXR6M6V-nk6vNM7FDFubLTM9_DqMGUbbbYgf4VhEpggmU5CrBpKaEKec8nnFQMTbLuZfZMOXP-9Frh8"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Floating Bid Panel (Glassmorphism) */}
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-surface-container-high/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-label-bold text-sm text-on-surface-variant uppercase tracking-wider">
                  Current Bid
                </p>
                <p className="font-price-display text-3xl text-secondary mt-1">
                  $2.45M
                </p>
              </div>
              <div className="text-right">
                <p className="font-label-bold text-[10px] text-error uppercase tracking-wider">
                  Ends In
                </p>
                <p className="font-headline-md text-2xl text-on-surface mt-1 font-mono tracking-tighter">
                  02:14:59
                </p>
              </div>
            </div>
            <div className="h-1 w-full bg-surface-variant rounded-full mt-2 mb-4 overflow-hidden">
              <div className="h-full bg-error w-3/4 rounded-full" />
            </div>
            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-on-surface font-label-bold text-sm py-2 rounded-lg transition-colors flex justify-center items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">
                gavel
              </span>{" "}
              Quick Bid +$50k
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-6">
          The Gallery Process
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "shield_person",
              color: "text-primary",
              glowColor: "bg-primary/5 group-hover:bg-primary/10",
              title: "1. Register & Verify",
              desc: "Complete our rigorous vetting process to gain access to the bidding floor. Security and anonymity are guaranteed.",
            },
            {
              icon: "gavel",
              color: "text-secondary",
              glowColor: "bg-secondary/5 group-hover:bg-secondary/10",
              title: "2. Enter the Floor",
              desc: "Engage in real-time, high-stakes auctions. Our ultra-low latency platform ensures your bids are executed instantly.",
            },
            {
              icon: "workspace_premium",
              color: "text-tertiary",
              glowColor: "bg-tertiary/5 group-hover:bg-tertiary/10",
              title: "3. Claim the Asset",
              desc: "Secure your acquisition. We handle white-glove logistics, provenance transfer, and secure vaulting upon request.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-surface-container rounded-xl p-6 border border-outline-variant hover:border-outline transition-colors group relative overflow-hidden"
            >
              <div
                className={`absolute -right-8 -top-8 w-32 h-32 ${step.glowColor} rounded-full blur-2xl transition-colors`}
              />
              <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center mb-4 border border-white/5">
                <span
                  className={`material-symbols-outlined ${step.color} text-2xl`}
                >
                  {step.icon}
                </span>
              </div>
              <h3 className="font-headline-md text-2xl font-semibold text-on-surface mb-2">
                {step.title}
              </h3>
              <p className="font-body-md text-base text-on-surface-variant">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Lots */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-headline-lg text-3xl font-bold text-on-surface">
            Curated Lots
          </h2>
          <Link
            href="/auctions"
            className="font-label-bold text-sm text-secondary hover:text-secondary-fixed transition-colors flex items-center gap-1"
          >
            View All{" "}
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {auctionLots.map((lot) => (
            <article
              key={lot.id}
              className="bg-surface-container rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="relative h-64 w-full bg-surface-dim">
                <img
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${
                    lot.status === "ended" ? "grayscale opacity-80" : ""
                  }`}
                  alt={lot.title}
                  src={lot.image}
                />
                {lot.verified && (
                  <div className="absolute top-2 left-2 bg-surface-container-highest/90 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-tertiary">
                      verified
                    </span>
                    <span className="font-label-bold text-[10px] text-on-surface uppercase tracking-wider">
                      Verified
                    </span>
                  </div>
                )}
                {lot.status === "ended" && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-surface-container-high px-4 py-2 rounded-full border border-white/10 font-label-bold text-sm text-on-surface-variant">
                      Auction Closed
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`p-4 flex flex-col gap-2 ${
                  lot.status === "ended" ? "opacity-60" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-body-lg text-lg text-on-surface font-semibold truncate pr-2">
                    {lot.title}
                  </h3>
                  <span className="bg-surface-variant text-on-surface-variant text-[10px] px-2 py-0.5 rounded font-label-bold uppercase">
                    {lot.lot}
                  </span>
                </div>
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/5">
                  <div>
                    <p className="text-[10px] font-label-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                      {lot.status === "ended" ? "Winning Bid" : "Current Bid"}
                    </p>
                    <p className="font-price-display text-[20px] font-bold text-on-surface leading-none">
                      {lot.currentBid}
                    </p>
                  </div>
                  <div className="text-right">
                    {lot.status === "ended" ? (
                      <span className="material-symbols-outlined text-outline">
                        gavel
                      </span>
                    ) : (
                      <>
                        <p className="text-[10px] font-label-bold text-error uppercase tracking-wider mb-0.5">
                          Closes In
                        </p>
                        <p className="font-body-md text-error font-mono text-[14px] leading-none">
                          {lot.closesIn}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
