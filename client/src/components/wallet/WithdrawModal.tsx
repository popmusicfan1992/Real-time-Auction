"use client";

import { useState } from "react";
import api from "@/lib/api";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxBalance: number;
}

export default function WithdrawModal({ isOpen, onClose, maxBalance }: WithdrawModalProps) {
  const [amount, setAmount] = useState(100);
  const [bankInfo, setBankInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = async () => {
    if (amount < 10) {
      setError("Minimum withdrawal is $10");
      return;
    }
    if (amount > maxBalance) {
      setError("Insufficient balance");
      return;
    }
    if (!bankInfo.trim()) {
      setError("Please enter your bank information");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.post("/wallet/withdraw", { amount, bankInfo });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Withdrawal failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError("");
    setAmount(100);
    setBankInfo("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-high rounded-2xl p-6 w-full max-w-md shadow-2xl border border-outline-variant">
        
        {success ? (
          /* Success State */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-tertiary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-tertiary text-3xl">check_circle</span>
            </div>
            <h2 className="font-headline-md text-2xl font-bold text-on-surface">Withdrawal Submitted</h2>
            <p className="text-on-surface-variant text-sm">
              Your withdrawal of <span className="text-tertiary font-bold">${amount.toLocaleString()}</span> is being processed. 
              Funds will arrive within 2-3 business days.
            </p>
            <button 
              onClick={handleClose}
              className="bg-tertiary text-on-tertiary px-8 py-3 rounded-full font-label-bold text-sm shadow-md hover:bg-tertiary-fixed transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form State */
          <div className="space-y-5">
            <div>
              <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-1">Withdraw Funds</h2>
              <p className="text-on-surface-variant text-sm">
                Available balance: <span className="text-tertiary font-bold">${maxBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </p>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-2 rounded-lg text-sm font-label-bold">
                ⚠️ {error}
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-on-surface-variant material-symbols-outlined text-[20px]">payments</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg pl-11 pr-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-bold"
                  min="10"
                  max={maxBalance}
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2">
              {[50, 100, 500].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className={`flex-1 py-2 rounded-lg font-label-bold text-sm border transition-colors ${
                    amount === v
                      ? "border-tertiary bg-tertiary/10 text-tertiary"
                      : "border-outline-variant text-on-surface-variant hover:border-tertiary hover:text-tertiary"
                  }`}
                >
                  ${v}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(Math.floor(maxBalance))}
                className={`flex-1 py-2 rounded-lg font-label-bold text-sm border transition-colors ${
                  amount === Math.floor(maxBalance)
                    ? "border-tertiary bg-tertiary/10 text-tertiary"
                    : "border-outline-variant text-on-surface-variant hover:border-tertiary hover:text-tertiary"
                }`}
              >
                Max
              </button>
            </div>

            {/* Bank Info */}
            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Bank / PayPal / Crypto Address</label>
              <textarea
                rows={2}
                placeholder="e.g. Bank ABC - Account ****1234 / PayPal: user@email.com"
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-body-md text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={handleClose}
                className="px-5 py-2 font-label-bold text-sm text-on-surface-variant hover:text-on-surface transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isLoading || amount <= 0}
                className="bg-error text-on-error px-6 py-2 rounded-full font-label-bold text-sm shadow-md hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Withdraw ${amount.toLocaleString()}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
