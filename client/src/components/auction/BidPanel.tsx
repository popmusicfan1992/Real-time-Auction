"use client";

import { useState } from "react";

interface BidPanelProps {
  currentBid: number;
  minInc: number;
  isBidding: boolean;
  onPlaceBid: (amount: number) => void;
  buyNowPrice?: string;
}

export default function BidPanel({ currentBid, minInc, isBidding, onPlaceBid, buyNowPrice }: BidPanelProps) {
  const [selectedIncrement, setSelectedIncrement] = useState<number>(minInc);
  const bidOptions = [minInc, minInc * 2, minInc * 5, minInc * 10];
  const nextBidAmount = currentBid + selectedIncrement;
  const depositRequired = nextBidAmount * 0.1;

  return (
    <>
      <div className="bg-surface-container rounded-xl p-5 border border-outline-variant">
        <p className="font-label-bold text-sm text-on-surface-variant mb-3 uppercase tracking-wider">Bid Increment</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {bidOptions.map((inc) => (
            <button
              key={inc}
              onClick={() => setSelectedIncrement(inc)}
              className={`py-2 rounded-lg font-label-bold text-sm transition-all ${
                selectedIncrement === inc
                  ? "bg-secondary text-on-secondary shadow-md"
                  : "bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              ${inc.toLocaleString()}
            </button>
          ))}
        </div>

        <button 
          onClick={() => onPlaceBid(selectedIncrement)}
          disabled={isBidding}
          className="w-full bg-amber-500 text-slate-950 py-4 rounded-lg font-bold text-lg hover:bg-amber-400 transition-colors shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[24px]">gavel</span>
          Place Bid — ${nextBidAmount.toLocaleString()}
        </button>

        <div className="flex justify-between items-center mt-3">
          <p className="font-body-md text-xs text-on-surface-variant">Min increment: ${minInc.toLocaleString()}</p>
          <p className="font-body-md text-xs text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-tertiary">verified</span>
            Deposit required: ${depositRequired.toLocaleString()}
          </p>
        </div>
      </div>

      {buyNowPrice && (
        <button className="w-full bg-transparent border-2 border-tertiary text-tertiary py-3 rounded-lg font-bold hover:bg-tertiary/10 transition-colors flex justify-center items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">bolt</span>
          Buy Now — ${parseFloat(buyNowPrice).toLocaleString()}
        </button>
      )}
    </>
  );
}
