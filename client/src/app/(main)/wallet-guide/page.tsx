"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function WalletGuidePage() {
  const { locale } = useLanguage();
  const vi = locale === "vi";

  const sections = vi ? [
    {
      title: "Nạp Tiền Vào Tài Khoản",
      icon: "account_balance",
      content: "Gallery X hỗ trợ chuyển khoản ngân hàng, thẻ tín dụng lớn và ví crypto cao cấp. Đối với giao dịch có giá trị cao, chúng tôi khuyến nghị chuyển khoản Wire để đảm bảo thanh khoản tức thì cho đấu giá trực tiếp."
    },
    {
      title: "Hiểu Về Tiền Cọc",
      icon: "lock",
      content: "Hầu hết các phiên đấu giá yêu cầu giữ tạm (tiền cọc) để xác nhận ý định đặt giá. Số tiền này tự động được hoàn lại nếu bạn không thắng, hoặc được áp dụng vào lần mua thành công."
    },
    {
      title: "Giới Hạn Giao Dịch",
      icon: "verified",
      content: "Tài khoản mới có giới hạn đặt giá tiêu chuẩn. Để tăng sức mua, hãy hoàn tất xác minh KYC (Biết Khách Hàng Của Bạn) trong cài đặt hồ sơ."
    },
    {
      title: "Thanh Toán & Phí",
      icon: "receipt_long",
      content: "Tất cả thanh toán phải hoàn tất trong vòng 48 giờ sau khi đấu giá kết thúc. Giá cuối cùng bao gồm giá búa, phí người mua và thuế địa phương áp dụng."
    }
  ] : [
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
          {vi ? "Hướng Dẫn " : "Wallet "}<span className="text-secondary italic">{vi ? "Ví Tiền" : "Guide"}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          {vi
            ? "Mọi thứ bạn cần biết về việc nạp tiền, quản lý tiền cọc và rút tiền an toàn trên Gallery X."
            : "Everything you need to know about funding your account, managing deposits, and withdrawing funds safely on Gallery X."}
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
            <p className="font-body-md text-on-surface-variant leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-surface-container-high to-surface-container rounded-3xl p-8 md:p-12 border border-secondary/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
        <div className="flex-grow">
          <h2 className="font-display-auction text-3xl font-bold text-on-surface mb-4">
            {vi ? "Sẵn Sàng Bắt Đầu?" : "Ready to Start?"}
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-xl leading-relaxed">
            {vi
              ? "Nạp tiền vào ví và tham gia đấu giá ngay hôm nay. Mọi giao dịch đều được bảo vệ và bảo mật."
              : "Fund your wallet and start bidding today. Every transaction is protected and secure."}
          </p>
        </div>
        <div className="flex gap-4">
          <a href="/dashboard/wallet" className="bg-secondary text-on-secondary font-label-bold px-8 py-4 rounded-full hover:bg-secondary-fixed transition-all shadow-lg shadow-secondary/20 whitespace-nowrap">
            {vi ? "Đến Trang Ví" : "Go to Wallet"}
          </a>
        </div>
      </div>
    </div>
  );
}
