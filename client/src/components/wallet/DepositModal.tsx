"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "@/lib/api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm({
  paymentIntentId,
  onSuccess,
  onCancel,
}: {
  paymentIntentId: string;
  onSuccess: (newBalance: number) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/wallet`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "An unexpected error occurred.");
        setIsLoading(false);
        return;
      }

      // Payment succeeded on Stripe! Now confirm with our backend to update balance
      try {
        const confirmRes = await api.post("/wallet/deposit/confirm", {
          paymentIntentId,
        });
        onSuccess(parseFloat(confirmRes.data.newBalance || "0"));
      } catch (confirmErr: any) {
        // Even if confirm fails, payment was successful - webhook will handle it
        console.warn("Backend confirm failed, webhook will handle:", confirmErr);
        onSuccess(0);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Payment failed. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      {errorMessage && (
        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[18px]">error</span>
          <span className="text-error text-sm font-label-bold">{errorMessage}</span>
        </div>
      )}
      <div className="flex gap-3 justify-end mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 font-label-bold text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="bg-tertiary text-on-tertiary px-6 py-2 rounded-full font-label-bold text-sm shadow-md hover:bg-tertiary-fixed transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-on-tertiary/30 border-t-on-tertiary rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Pay Now
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const PRESET_AMOUNTS = [100, 500, 1000, 5000];

export default function DepositModal({
  isOpen,
  onClose,
  onDepositSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess?: () => void;
}) {
  const [amount, setAmount] = useState(1000);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleClose = () => {
    setClientSecret("");
    setPaymentIntentId("");
    setInitError("");
    setSuccessMsg("");
    setAmount(1000);
    onClose();
  };

  if (!isOpen) return null;

  const handleInitialize = async () => {
    if (amount < 1) {
      setInitError("Minimum deposit is $1");
      return;
    }
    setIsInitializing(true);
    setInitError("");
    try {
      const res = await api.post("/wallet/deposit", { amount });
      setClientSecret(res.data.clientSecret);
      setPaymentIntentId(res.data.paymentIntentId);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to initialize payment";
      setInitError(msg);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="bg-surface-container-high rounded-2xl p-6 w-full max-w-md shadow-2xl border border-outline-variant max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-md text-2xl font-bold text-on-surface">Deposit Funds</h2>
          <button
            onClick={handleClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Success State */}
        {successMsg ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-green-400 text-[36px]">check_circle</span>
            </div>
            <h3 className="font-headline-md text-xl font-bold text-on-surface">Payment Successful!</h3>
            <p className="font-body-md text-sm text-on-surface-variant">{successMsg}</p>
            <button
              onClick={handleClose}
              className="bg-secondary text-on-secondary px-8 py-2.5 rounded-full font-label-bold text-sm shadow-md hover:bg-secondary-fixed transition-colors"
            >
              Done
            </button>
          </div>
        ) : !clientSecret ? (
          <div className="space-y-5">
            <p className="font-body-md text-sm text-on-surface-variant">
              Enter the amount you wish to add to your wallet.
            </p>

            {/* Preset amount buttons */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`py-2 rounded-lg font-label-bold text-sm transition-colors border ${
                    amount === preset
                      ? "bg-secondary/20 border-secondary text-secondary"
                      : "bg-surface-container border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface"
                  }`}
                >
                  ${preset.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom amount input */}
            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                Custom Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-on-surface-variant material-symbols-outlined text-[20px]">
                  attach_money
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg pl-11 pr-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-bold"
                  min="1"
                  step="1"
                />
              </div>
            </div>

            {/* Error */}
            {initError && (
              <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">error</span>
                <span className="text-error text-sm font-label-bold">{initError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                className="px-5 py-2 font-label-bold text-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInitialize}
                disabled={isInitializing || amount < 1}
                className="bg-secondary text-on-secondary px-6 py-2 rounded-full font-label-bold text-sm shadow-[0_4px_15px_rgba(238,152,0,0.3)] hover:bg-secondary-fixed transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isInitializing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-secondary/30 border-t-on-secondary rounded-full animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>Continue to Payment</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4 bg-surface-container rounded-lg px-4 py-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">paid</span>
              <span className="font-label-bold text-sm text-on-surface">
                Depositing: <span className="text-secondary">${amount.toLocaleString()}</span>
              </span>
              <button
                onClick={() => {
                  setClientSecret("");
                  setPaymentIntentId("");
                }}
                className="ml-auto text-xs text-on-surface-variant hover:text-on-surface font-label-bold transition-colors"
              >
                Change amount
              </button>
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "night",
                  variables: {
                    colorPrimary: "#4fdbc8",
                    colorBackground: "#1d2022",
                    colorText: "#e0e3e5",
                    colorDanger: "#ffb4ab",
                    borderRadius: "8px",
                    fontFamily: "Work Sans, sans-serif",
                  },
                },
              }}
            >
              <CheckoutForm
                paymentIntentId={paymentIntentId}
                onSuccess={(newBalance) => {
                  setSuccessMsg(
                    `$${amount.toLocaleString()} has been added to your wallet. Your balance will update shortly.`
                  );
                  onDepositSuccess?.();
                }}
                onCancel={() => {
                  setClientSecret("");
                  setPaymentIntentId("");
                }}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}
