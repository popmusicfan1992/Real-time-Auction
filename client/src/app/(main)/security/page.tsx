"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function SecurityPage() {
  const { locale } = useLanguage();
  const vi = locale === "vi";

  const pillars = vi ? [
    {
      title: "Kiểm Tra Vật Lý",
      icon: "microscope",
      desc: "Mỗi tài sản được kiểm tra bởi ít nhất hai chuyên gia độc lập. Chúng tôi sử dụng pháp y tiên tiến, bao gồm xác định niên đại Carbon và phân tích quang phổ khi áp dụng được."
    },
    {
      title: "Nguồn Gốc Kỹ Thuật Số",
      icon: "qr_code_2",
      desc: "Nền tảng của chúng tôi tận dụng blockchain để duy trì hồ sơ quyền sở hữu bất biến, đảm bảo lịch sử tài sản không bao giờ bị mất hoặc giả mạo."
    },
    {
      title: "Giao Dịch Được Mã Hóa",
      icon: "enhanced_encryption",
      desc: "Mã hóa cấp quân sự bảo vệ dữ liệu tài chính và hoạt động đặt giá. Danh tính chỉ được tiết lộ cho các bên cần thiết trong thanh toán cuối."
    },
    {
      title: "Lưu Ký Có Bảo Hiểm",
      icon: "health_and_safety",
      desc: "Trong thời gian lưu giữ, tất cả tài sản được bảo quản trong kho an ninh, kiểm soát khí hậu và được bảo hiểm đầy đủ theo giá trị thị trường ước tính."
    }
  ] : [
    {
      title: "Physical Inspection",
      icon: "microscope",
      desc: "Every asset is inspected by a minimum of two independent experts. We utilize advanced forensics, including carbon dating and spectroscopic analysis where applicable."
    },
    {
      title: "Digital Provenance",
      icon: "qr_code_2",
      desc: "Our platform leverages blockchain-backed tracking to maintain an immutable record of ownership, ensuring the history of your asset is never lost or forged."
    },
    {
      title: "Encrypted Transactions",
      icon: "enhanced_encryption",
      desc: "Military-grade encryption protects your financial data and bidding activity. Your identity is only revealed to necessary parties during final settlement."
    },
    {
      title: "Insured Custody",
      icon: "health_and_safety",
      desc: "While in our possession, all assets are stored in ultra-secure, climate-controlled vaults and fully insured at the estimated market value."
    }
  ];

  const guaranteeItems = vi
    ? ["Nguồn Gốc Được Chứng Nhận", "Xác Minh Thủ Công Bởi Chuyên Gia", "Hồ Sơ Blockchain"]
    : ["Certified Provenance", "Expert Hand-Verification", "Blockchain Record"];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-20 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-secondary/15 border border-secondary/30 px-4 py-2 rounded-full mb-6">
          <span className="material-symbols-outlined text-secondary text-lg">verified_user</span>
          <span className="text-secondary font-label-bold text-xs uppercase tracking-widest">
            {vi ? "Không Thỏa Hiệp" : "Uncompromising"}
          </span>
        </div>
        <h1 className="font-display-auction text-5xl md:text-6xl font-extrabold text-on-surface mb-6">
          {vi ? "Bảo Mật " : "Security "}<span className="text-secondary italic">{vi ? "& Xác Thực" : "& Authentication"}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
          {vi
            ? "Mọi tài sản trên Gallery X đều trải qua quy trình xác thực nghiêm ngặt. Cam kết của chúng tôi là tính xác thực tuyệt đối."
            : "Every asset on Gallery X undergoes a rigorous authentication process. Our commitment to absolute authenticity is unwavering."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {pillars.map((pillar, idx) => (
          <div
            key={idx}
            className="flex gap-6 animate-slide-up"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 border border-white/5 shadow-xl">
              <span className="material-symbols-outlined text-secondary text-3xl">{pillar.icon}</span>
            </div>
            <div>
              <h3 className="font-headline-md text-2xl font-bold text-on-surface mb-3">{pillar.title}</h3>
              <p className="font-body-md text-on-surface-variant leading-relaxed">{pillar.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-high rounded-3xl p-8 md:p-16 border border-white/5 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="lg:w-1/2">
          <h2 className="font-display-auction text-3xl font-bold text-on-surface mb-6">
            {vi ? "Cam Kết Của Gallery X" : "The Gallery X Guarantee"}
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed mb-6">
            {vi
              ? "Chúng tôi đảm bảo tính xác thực của mọi mặt hàng được bán trên nền tảng. Nếu bạn mua một mặt hàng và sau đó phát hiện không xác thực, chúng tôi sẽ hoàn tiền đầy đủ."
              : "We guarantee the authenticity of every item sold on our platform. If you purchase an item and it is later found to be inauthentic, we will provide a full refund."}
          </p>
          <ul className="space-y-4">
            {guaranteeItems.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-label-bold text-on-surface">
                <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-4 bg-surface-container rounded-full flex items-center justify-center border border-secondary/30 shadow-[0_0_50px_rgba(238,152,0,0.2)]">
              <span className="material-symbols-outlined text-secondary text-[100px]">verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
