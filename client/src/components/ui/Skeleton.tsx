import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const styles: React.CSSProperties = {};
  if (width !== undefined) styles.width = width;
  if (height !== undefined) styles.height = height;

  const variantClass =
    variant === "circular"
      ? "rounded-full"
      : variant === "text"
      ? "rounded-md h-4"
      : "rounded-xl";

  return (
    <div
      className={`animate-shimmer bg-surface-container-high/40 relative overflow-hidden ${variantClass} ${className}`}
      style={styles}
    />
  );
}
