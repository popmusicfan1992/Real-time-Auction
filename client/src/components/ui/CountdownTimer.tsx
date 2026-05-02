"use client";

import { useState, useEffect, memo } from "react";

function formatTimeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "ENDED";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface CountdownTimerProps {
  endTime: string;
  className?: string;
}

function CountdownTimerInner({ endTime, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return <span className={className}>{timeLeft}</span>;
}

// Memoize to prevent re-renders from parent
const CountdownTimer = memo(CountdownTimerInner);
export default CountdownTimer;
