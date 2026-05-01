"use client";

interface ManageCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFunds: () => void;
}

export default function ManageCardsModal({ isOpen, onClose, onAddFunds }: ManageCardsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-high rounded-2xl p-6 w-full max-w-md shadow-2xl border border-outline-variant space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-2xl font-bold text-on-surface">Payment Methods</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Stripe Info */}
        <div className="bg-surface-container rounded-xl p-4 border border-outline-variant">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#635BFF]/10 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#635BFF]" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
              </svg>
            </div>
            <div>
              <p className="font-label-bold text-sm text-on-surface">Stripe Secure Payments</p>
              <p className="text-xs text-on-surface-variant">Your card info is handled securely by Stripe</p>
            </div>
          </div>
          <div className="text-xs text-on-surface-variant bg-surface-container-highest rounded-lg px-3 py-2">
            <span className="material-symbols-outlined text-[14px] align-middle mr-1 text-tertiary">lock</span>
            Gallery X <strong>never stores</strong> your card details. All payments are processed through Stripe&apos;s PCI-compliant infrastructure.
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-3">
          <h3 className="font-label-bold text-xs uppercase tracking-wider text-on-surface-variant">How Payments Work</h3>
          
          <div className="space-y-2">
            {[
              { icon: "add_card", title: "Deposit", desc: "Enter an amount and pay securely with any credit/debit card" },
              { icon: "account_balance_wallet", title: "Wallet Balance", desc: "Funds are added to your Gallery X wallet instantly" },
              { icon: "gavel", title: "Bidding", desc: "Use your wallet balance to place bids on live auctions" },
              { icon: "download", title: "Withdraw", desc: "Request a withdrawal anytime to your bank account" },
            ].map((item) => (
              <div key={item.icon} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container transition-colors">
                <div className="w-8 h-8 bg-tertiary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">{item.icon}</span>
                </div>
                <div>
                  <p className="font-label-bold text-sm text-on-surface">{item.title}</p>
                  <p className="text-xs text-on-surface-variant">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-full font-label-bold text-sm border border-outline text-on-surface hover:bg-surface-variant transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onAddFunds(); }}
            className="flex-1 bg-secondary text-on-secondary px-4 py-3 rounded-full font-label-bold text-sm shadow-[0_4px_15px_rgba(238,152,0,0.3)] hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Funds Now
          </button>
        </div>
      </div>
    </div>
  );
}
