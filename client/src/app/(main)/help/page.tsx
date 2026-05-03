"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function HelpCenterPage() {
  const { locale } = useLanguage();
  const vi = locale === "vi";

  const faqs = vi ? [
    {
      q: "Làm thế nào để tham gia đấu giá trực tiếp?",
      a: "Để đặt giá, bạn phải tạo tài khoản và xác minh danh tính. Sau khi xác minh, đảm bảo ví của bạn đủ tiền cọc cho lô hàng bạn quan tâm. Khi phiên bắt đầu, bạn có thể đặt giá theo thời gian thực trong phòng đấu giá."
    },
    {
      q: "\"Phí Người Mua\" là gì?",
      a: "Phí Người Mua là khoản phụ thu ngoài giá búa (giá thắng cuộc) để trang trải chi phí hành chính, bảo hiểm và phí dịch vụ. Mức phí tiêu chuẩn là 15% cho các mặt hàng dưới $100k và 12.5% cho mặt hàng trên $100k."
    },
    {
      q: "Các mặt hàng được xác thực như thế nào?",
      a: "Mỗi mặt hàng trên Gallery X trải qua quy trình xác minh nhiều giai đoạn bởi các chuyên gia độc lập. Chúng tôi hợp tác với các chuyên gia hàng đầu về đồng hồ, nghệ thuật và đồ sưu tầm để cung cấp chứng chỉ xác thực toàn diện."
    },
    {
      q: "Tôi có thể hủy giá đặt không?",
      a: "Giá đặt trên Gallery X là hợp đồng ràng buộc pháp lý. Một khi đã gửi, giá đặt không thể hủy hoặc thu hồi. Điều này đảm bảo tính toàn vẹn và công bằng cho tất cả người tham gia."
    }
  ] : [
    {
      q: "How do I participate in a live auction?",
      a: "To bid in a live auction, you must first create an account and verify your identity. Once verified, ensure your wallet has sufficient funds for the required deposit. When the auction starts, you can place bids in real-time through our interactive bidding room."
    },
    {
      q: "What is the 'Buyer's Premium'?",
      a: "The Buyer's Premium is an additional fee on top of the hammer price that covers administrative costs, insurance, and the platform's service fee. Our standard premium is 15% for items under $100k and 12.5% for items above $100k."
    },
    {
      q: "How are items authenticated?",
      a: "Every item on Gallery X undergoes a rigorous multi-stage verification process by independent specialists. We partner with world-renowned experts in horology, fine art, and collectibles to provide a comprehensive certificate of authenticity."
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
          {vi ? "Trung Tâm " : "Help "}<span className="text-secondary italic">{vi ? "Hỗ Trợ" : "Center"}</span>
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          {vi
            ? "Tìm câu trả lời cho các câu hỏi thường gặp hoặc liên hệ với đội ngũ hỗ trợ đẳng cấp thế giới của chúng tôi."
            : "Find answers to common questions or connect with our world-class concierge support team."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">quiz</span>
            {vi ? "Câu Hỏi Thường Gặp" : "Frequently Asked Questions"}
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
                <p className="font-body-md text-on-surface-variant leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-high rounded-3xl p-8 border border-secondary/20 shadow-2xl">
            <h3 className="font-display-auction text-xl font-bold text-on-surface mb-4">
              {vi ? "Vẫn Cần Hỗ Trợ?" : "Still Need Help?"}
            </h3>
            <p className="font-body-md text-sm text-on-surface-variant mb-6 leading-relaxed">
              {vi
                ? "Đội ngũ hỗ trợ của chúng tôi sẵn sàng 24/7 để hỗ trợ các thành viên đã xác minh."
                : "Our concierge team is available around the clock to assist verified members with any inquiries."}
            </p>
            <div className="space-y-4">
              <a href="mailto:popmusicfan1992@gmail.com" className="flex items-center gap-3 p-4 rounded-xl bg-surface-container hover:bg-secondary/10 transition-colors border border-white/5 group">
                <span className="material-symbols-outlined text-secondary">mail</span>
                <div>
                  <p className="font-label-bold text-xs text-on-surface-variant uppercase">{vi ? "Email Hỗ Trợ" : "Email Support"}</p>
                  <p className="text-sm text-on-surface font-medium">popmusicfan1992@gmail.com</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container border border-white/5">
                <span className="material-symbols-outlined text-secondary">support_agent</span>
                <div>
                  <p className="font-label-bold text-xs text-on-surface-variant uppercase">{vi ? "Hỗ Trợ Trực Tiếp" : "Live Concierge"}</p>
                  <p className="text-sm text-on-surface font-medium">{vi ? "Dành cho Thành Viên Đã Xác Minh" : "Available for Verified Members"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container rounded-3xl p-8 border border-white/5">
            <h3 className="font-label-bold text-xs text-secondary uppercase tracking-widest mb-4">
              {vi ? "Tài Nguyên Nhanh" : "Quick Resources"}
            </h3>
            <ul className="space-y-3">
              <li><a href="/wallet-guide" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">{vi ? "Hướng Dẫn Ví" : "Wallet Guide"}</a></li>
              <li><a href="/shipping" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">{vi ? "Vận Chuyển & Logistics" : "Shipping & Logistics"}</a></li>
              <li><a href="/security" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">{vi ? "Bảo Mật & Xác Thực" : "Security & Authentication"}</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
