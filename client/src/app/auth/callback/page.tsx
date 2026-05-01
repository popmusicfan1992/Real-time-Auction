"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    // Chỉ xử lý 1 lần duy nhất
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get("token");
    const userRaw = searchParams.get("user");
    const error = searchParams.get("error");

    if (error) {
      window.location.href = `/login?error=${error}`;
      return;
    }

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));

        // Lưu trực tiếp vào localStorage (không qua AuthContext để tránh timing issue)
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Dùng window.location thay vì router.push để force full page reload
        // → AuthContext sẽ đọc token từ localStorage trong useEffect khởi tạo
        window.location.href = "/dashboard/profile";
      } catch (e) {
        console.error("OAuth callback parse error:", e);
        window.location.href = "/login?error=parse_failed";
      }
    } else {
      window.location.href = "/login?error=missing_token";
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-primary/30 animate-spin border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">💎</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-display-auction text-2xl font-extrabold text-secondary italic mb-2">GALLERY X</p>
        <p className="text-on-surface-variant text-sm animate-pulse">Signing you in with Google...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary/30 animate-spin border-t-primary" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
