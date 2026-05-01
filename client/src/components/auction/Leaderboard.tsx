"use client";

interface Bidder {
  id: string;
  userId: string;
  amount: string;
  user: {
    name: string;
  };
}

interface LeaderboardProps {
  bidsHistory: Bidder[];
  currentUserId?: string;
}

export default function Leaderboard({ bidsHistory, currentUserId }: LeaderboardProps) {
  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
      <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-xl">leaderboard</span>
        <h3 className="font-label-bold text-sm text-on-surface uppercase tracking-wider">Top Bidders</h3>
      </div>
      <div className="divide-y divide-outline-variant">
        {bidsHistory.length === 0 ? (
          <div className="p-4 text-center text-on-surface-variant text-sm">No bids yet</div>
        ) : (
          bidsHistory.map((bid, index) => {
            const isYou = currentUserId && bid.userId === currentUserId;
            return (
              <div
                key={bid.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  isYou ? "bg-secondary/5 border-l-2 border-secondary" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? "bg-secondary text-on-secondary" :
                    index === 1 ? "bg-on-surface-variant/20 text-on-surface" :
                    "bg-surface-variant text-on-surface-variant"
                  }`}>
                    {index + 1}
                  </span>
                  <span className={`font-body-md text-sm ${isYou ? "text-secondary font-semibold" : "text-on-surface"}`}>
                    {bid.user.name} {isYou && <span className="text-[10px]">(You)</span>}
                  </span>
                </div>
                <span className="font-price-display text-sm font-bold text-on-surface">
                  ${parseFloat(bid.amount).toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
