"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import DepositModal from "@/components/wallet/DepositModal";
import WithdrawModal from "@/components/wallet/WithdrawModal";
import ManageCardsModal from "@/components/wallet/ManageCardsModal";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function WalletPage() {
  const { data: wallet, error, mutate } = useSWR("/wallet", fetcher, { refreshInterval: 5000 });
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [isManageCardsOpen, setManageCardsOpen] = useState(false);

  if (error) return <div className="text-center pt-24 text-error">Failed to load wallet data</div>;
  if (!wallet) return <div className="text-center pt-24">Loading wallet...</div>;

  return (
    <div className="max-w-5xl mx-auto w-full px-6 space-y-8 pb-20">
      <DepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => {
          setDepositModalOpen(false);
          mutate();
        }} 
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setWithdrawModalOpen(false);
          mutate();
        }}
        maxBalance={wallet ? parseFloat(wallet.balance) : 0}
      />
      <ManageCardsModal
        isOpen={isManageCardsOpen}
        onClose={() => setManageCardsOpen(false)}
        onAddFunds={() => setDepositModalOpen(true)}
      />

      {/* Header */}
      <div>
        <h1 className="font-display-auction text-5xl font-extrabold text-on-surface mb-2">Wallet & Checkout</h1>
        <p className="font-body-lg text-lg text-on-surface-variant">Manage your funds, deposits, and payment methods.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Balance */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary text-2xl">account_balance_wallet</span>
            <span className="font-label-bold text-sm text-on-surface-variant uppercase tracking-wider">Available Balance</span>
          </div>
          <p className="font-price-display text-4xl font-bold text-on-surface">
            ${parseFloat(wallet.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="font-body-md text-sm text-tertiary mt-2">Ready to bid</p>
        </div>

        {/* Frozen Funds */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-secondary text-2xl">lock</span>
            <span className="font-label-bold text-sm text-on-surface-variant uppercase tracking-wider">Frozen Funds</span>
          </div>
          <p className="font-price-display text-4xl font-bold text-secondary">
            ${parseFloat(wallet.frozenBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="font-body-md text-sm text-on-surface-variant mt-2">Held as deposit</p>
        </div>

        {/* Total Won */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">emoji_events</span>
            <span className="font-label-bold text-sm text-on-surface-variant uppercase tracking-wider">Total Won</span>
          </div>
          <p className="font-price-display text-4xl font-bold text-on-surface">
            $0.00
          </p>
          <p className="font-body-md text-sm text-on-surface-variant mt-2">0 auctions won</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => setDepositModalOpen(true)}
          className="bg-secondary text-on-secondary font-label-bold text-sm px-8 py-3 rounded-full shadow-[0_10px_30px_rgba(238,152,0,0.2)] hover:bg-secondary-fixed transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Funds
        </button>
        <button 
          onClick={() => setManageCardsOpen(true)}
          className="bg-transparent border border-outline text-on-surface font-label-bold text-sm px-8 py-3 rounded-full hover:bg-surface-variant transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">credit_card</span>
          Manage Cards
        </button>
        <button 
          onClick={() => setWithdrawModalOpen(true)}
          className="bg-transparent border border-outline text-on-surface font-label-bold text-sm px-8 py-3 rounded-full hover:bg-surface-variant transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Withdraw
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <h2 className="font-headline-md text-2xl font-semibold text-on-surface">Transaction History</h2>
        </div>
        <div className="divide-y divide-outline-variant">
          {wallet.transactions.length === 0 ? (
            <div className="p-6 text-center text-on-surface-variant">No transactions yet.</div>
          ) : (
            wallet.transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-high/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    ["DEPOSIT", "REFUND"].includes(tx.type) ? "bg-tertiary/10" : "bg-error/10"
                  }`}>
                    <span className={`material-symbols-outlined text-xl ${
                      ["DEPOSIT", "REFUND"].includes(tx.type) ? "text-tertiary" : "text-error"
                    }`}>
                      {["DEPOSIT", "REFUND"].includes(tx.type) ? "add_circle" : "lock"}
                    </span>
                  </div>
                  <div>
                    <p className="font-body-md text-base font-semibold text-on-surface">{tx.type}</p>
                    <p className="font-body-md text-sm text-on-surface-variant">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <span className={`font-price-display text-lg font-bold ${
                    ["DEPOSIT", "REFUND"].includes(tx.type) ? "text-tertiary" : "text-on-surface"
                  }`}>
                    {["DEPOSIT", "REFUND"].includes(tx.type) ? "+" : "-"}${parseFloat(tx.amount).toLocaleString()}
                  </span>
                  <span className={`text-[10px] font-label-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    tx.status === "COMPLETED"
                      ? "bg-tertiary/10 text-tertiary"
                      : tx.status === "FROZEN" ? "bg-secondary/10 text-secondary" : "bg-surface-variant text-on-surface-variant"
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
