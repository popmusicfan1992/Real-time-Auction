"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "@/lib/api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

function CheckoutForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/wallet`,
      },
      redirect: "if_required", // Prevent redirecting if we can handle it here
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    } else {
      // Payment succeeded! The webhook will update the DB, but we can optimistically close.
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && <div className="text-error text-sm font-label-bold">{errorMessage}</div>}
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
          className="bg-tertiary text-on-tertiary px-6 py-2 rounded-full font-label-bold text-sm shadow-md hover:bg-tertiary-fixed transition-colors disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </form>
  );
}

export default function DepositModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [amount, setAmount] = useState(1000);
  const [clientSecret, setClientSecret] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);

  if (!isOpen) return null;

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const res = await api.post("/wallet/deposit", { amount });
      setClientSecret(res.data.clientSecret);
    } catch (err: any) {
      alert("Failed to initialize payment: " + err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-high rounded-2xl p-6 w-full max-w-md shadow-2xl border border-outline-variant">
        <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-2">Deposit Funds</h2>
        
        {!clientSecret ? (
          <div className="space-y-4">
            <p className="font-body-md text-sm text-on-surface-variant">
              Enter the amount you wish to add to your wallet.
            </p>
            <div>
              <label className="block font-label-bold text-xs uppercase tracking-wider text-on-surface-variant mb-1">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-on-surface-variant material-symbols-outlined text-[20px]">attach_money</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-surface-container-highest border border-outline-variant rounded-lg pl-11 pr-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-tertiary font-bold"
                  min="50"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={onClose} className="px-5 py-2 font-label-bold text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleInitialize} 
                disabled={isInitializing}
                className="bg-secondary text-on-secondary px-6 py-2 rounded-full font-label-bold text-sm shadow-[0_4px_15px_rgba(238,152,0,0.3)] hover:bg-secondary-fixed transition-colors flex items-center gap-2"
              >
                {isInitializing ? "Loading..." : "Continue to Payment"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
              <CheckoutForm 
                onSuccess={() => {
                  alert("Payment successful! Balance will update shortly.");
                  setClientSecret("");
                  onClose();
                }} 
                onCancel={() => {
                  setClientSecret("");
                  onClose();
                }} 
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}
