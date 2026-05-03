"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function JournalPage() {
  const { locale } = useLanguage();
  const vi = locale === "vi";

  const articles = [
    {
      slug: "heritage-watches-2026",
      img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800",
      tag: vi ? "Di Sản" : "Heritage",
      tagColor: "text-secondary",
      title: vi ? "Sự Hồi Sinh Của Đồng Hồ Di Sản" : "The Renaissance of Heritage Timepieces",
      excerpt: vi
        ? "Tại sao các bộ máy vintage đang vượt trội so với các phức hợp hiện đại trên thị trường thứ cấp 2026. Khám phá sâu vào thế giới kiệt tác cơ học."
        : "Why vintage movements are outperforming modern complications in the 2026 secondary market. A deep dive into the world of mechanical mastery.",
      date: "28 tháng 4, 2026",
      readTime: vi ? "5 phút đọc" : "5 min read",
    },
    {
      slug: "modern-art-investment",
      img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800",
      tag: vi ? "Đầu Tư" : "Investment",
      tagColor: "text-primary",
      title: vi ? "Nguồn Gốc Kỹ Thuật Số Trong Nghệ Thuật Hiện Đại" : "Digital Provenance in Modern Art",
      excerpt: vi
        ? "Công nghệ blockchain đang cách mạng hóa xác thực và quyền sở hữu trong thế giới mỹ thuật, đảm bảo giá trị lâu dài cho nhà sưu tầm."
        : "How blockchain technology is revolutionizing authentication and ownership in the fine art world, ensuring lifetime value for collectors.",
      date: "25 tháng 4, 2026",
      readTime: vi ? "7 phút đọc" : "7 min read",
    },
    {
      slug: "classic-cars-future",
      img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800",
      tag: vi ? "Xe Cộ" : "Vehicles",
      tagColor: "text-tertiary",
      title: vi ? "Sự Chuyển Dịch Điện Hóa Trong Sưu Tầm Cổ Điển" : "The Electric Shift in Classic Collecting",
      excerpt: vi
        ? "Một chiếc Porsche chuyển đổi EV có còn được coi là cổ điển không? Chúng tôi khám phá xu hướng xa xỉ bền vững đang phát triển trong đấu giá ô tô."
        : "Can an EV-converted Porsche still be considered a classic? We explore the growing trend of sustainable luxury in automotive auctions.",
      date: "22 tháng 4, 2026",
      readTime: vi ? "6 phút đọc" : "6 min read",
    },
    {
      slug: "rare-diamonds-market",
      img: "https://images.unsplash.com/photo-1588444650733-d0c51d7f6494?q=80&w=800",
      tag: vi ? "Trang Sức" : "Jewelry",
      tagColor: "text-amber-400",
      title: vi ? "Yếu Tố Khan Hiếm: Kim Cương Hồng" : "The Rarity Factor: Pink Diamonds",
      excerpt: vi
        ? "Phân tích sự tăng trưởng vượt bậc của kim cương hồng Argyle sau khi mỏ đóng cửa. Đây có phải thời điểm thích hợp để bán hay giữ lại?"
        : "Analyzing the exponential growth in value of Argyle pink diamonds following the mine closure. Is now the time to sell or hold?",
      date: "18 tháng 4, 2026",
      readTime: vi ? "4 phút đọc" : "4 min read",
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-12 animate-fade-in">
        <h1 className="font-display-auction text-5xl font-extrabold text-on-surface mb-4">
          {vi ? "Tạp " : "The "}<span className="text-secondary italic">{vi ? "Chí" : "Journal"}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          {vi
            ? "Câu chuyện đằng sau những tài sản quý giá nhất thế giới. Phân tích, xu hướng và quan điểm từ đội ngũ chuyên gia của chúng tôi."
            : "Stories and insights from the world of premium collecting. Analysis, trends, and perspectives from our expert team."}
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
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={article.title} src={article.img} />
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
              <p className="font-body-md text-on-surface-variant leading-relaxed line-clamp-3">{article.excerpt}</p>
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
