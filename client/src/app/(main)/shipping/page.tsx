"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function ShippingPage() {
  const { locale } = useLanguage();
  const vi = locale === "vi";

  const services = vi ? [
    {
      title: "Giao Hàng Cao Cấp (White-Glove)",
      desc: "Đối với các tài sản có giá trị đặc biệt cao, chúng tôi cung cấp vận chuyển bọc thép có kiểm soát nhiệt độ cùng dịch vụ xử lý và lắp đặt chuyên nghiệp."
    },
    {
      title: "Xuất Khẩu Toàn Cầu & Hải Quan",
      desc: "Đội logistics xử lý toàn bộ hồ sơ quốc tế, giấy phép CITES và thông quan để đảm bảo trải nghiệm xuyên biên giới liền mạch."
    },
    {
      title: "Vận Chuyển Có Bảo Hiểm",
      desc: "Mỗi lô hàng được bảo hiểm đầy đủ theo giá búa cuối cùng thông qua quan hệ đối tác với Lloyd's of London và AXA Art Insurance."
    }
  ] : [
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
          {vi ? "Vận Chuyển " : "Shipping "}<span className="text-secondary italic">{vi ? "& Logistics" : "& Logistics"}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          {vi
            ? "Vận chuyển đẳng cấp thế giới cho tài sản cao cấp. Mỗi lô hàng được xử lý với sự chính xác và bảo mật tuyệt đối."
            : "World-class logistics for premium assets. Every shipment is handled with absolute precision and security."}
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
          <p className="bg-secondary/90 text-on-secondary px-4 py-1.5 rounded-full w-max text-xs font-label-bold uppercase tracking-widest mb-4">
            {vi ? "Mạng Lưới Toàn Cầu" : "Global Network"}
          </p>
          <h2 className="text-3xl font-bold text-on-surface">
            {vi ? "Phủ Sóng 140+ Quốc Gia" : "140+ Countries Served"}
          </h2>
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
            <p className="font-body-md text-on-surface-variant leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-high rounded-3xl p-12 flex flex-col items-center text-center">
        <span className="material-symbols-outlined text-secondary text-5xl mb-6">package_2</span>
        <h2 className="font-display-auction text-3xl font-bold text-on-surface mb-4">
          {vi ? "Ước Tính Chi Phí Vận Chuyển" : "Shipping Calculator"}
        </h2>
        <p className="font-body-md text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
          {vi
            ? "Chi phí vận chuyển được tính dựa trên kích thước, trọng lượng và điểm đến. Liên hệ đội ngũ logistics để được báo giá chính xác."
            : "Shipping costs are calculated based on dimensions, weight, and destination. Contact our logistics team for an accurate quote."}
        </p>
        <a href="/auctions" className="border border-secondary text-secondary hover:bg-secondary/10 font-label-bold px-8 py-4 rounded-full transition-all">
          {vi ? "Xem Danh Mục" : "View Catalog"}
        </a>
      </div>
    </div>
  );
}
