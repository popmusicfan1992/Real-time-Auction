"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function RegisterPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL.replace("/api", "")}/api/auth/google`;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      login(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      {/* Left Panel */}
      <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 relative z-10 bg-surface-container-low border-r border-outline-variant shadow-2xl">
        <div className="absolute top-8 left-8 sm:left-12 lg:left-20">
          <Link href="/" className="font-display-auction text-[20px] font-black italic tracking-tighter text-secondary uppercase hover:text-secondary-fixed transition-colors">
            GALLERY X
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto mt-16 lg:mt-0">
          <div className="mb-8">
            <h1 className="font-headline-lg text-3xl font-bold text-on-surface mb-2">Apply for Membership</h1>
            <p className="font-body-md text-base text-on-surface-variant">Join the world's most exclusive auction platform.</p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-lg mb-6">
              ⚠️ {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-surface-container border border-outline-variant text-on-surface py-3 px-4 rounded-xl hover:bg-surface-container-highest hover:border-outline transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-2 focus:ring-offset-background mb-6"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-label-bold text-sm">Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="flex-shrink-0 mx-4 font-body-md text-[12px] uppercase tracking-widest text-on-surface-variant font-medium">Or sign up with email</span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>

            <div>
              <label className="block font-label-bold text-sm text-on-surface mb-2" htmlFor="name">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-xl bg-surface-container-highest text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary transition-colors font-body-md text-base"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-bold text-sm text-on-surface mb-2" htmlFor="reg-email">Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </span>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-xl bg-surface-container-highest text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary transition-colors font-body-md text-base"
                  placeholder="collector@galleryx.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-bold text-sm text-on-surface mb-2" htmlFor="reg-password">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-xl bg-surface-container-highest text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary transition-colors font-body-md text-base"
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-bold text-sm text-on-surface mb-2" htmlFor="confirm-password">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">lock_check</span>
                </span>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-xl bg-surface-container-highest text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary transition-colors font-body-md text-base"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl font-label-bold text-sm text-on-primary bg-primary hover:bg-primary/90 focus:outline-none transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(43,212,206,0.2)] mt-2"
            >
              {loading ? "Creating account..." : "Create My Account"}
              {!loading && <span className="material-symbols-outlined text-[18px]">how_to_reg</span>}
            </button>
          </form>

          <p className="mt-8 text-center font-body-md text-[14px] text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="font-label-bold text-secondary hover:text-secondary-fixed transition-colors ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:block lg:w-7/12 xl:w-2/3 relative overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 bg-gradient-to-tr from-background/90 via-background/40 to-transparent z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-80" />
        <img
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70 contrast-125 saturate-50"
          alt="Exclusive auction gallery"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtpTYRv_q3zpnn-2zS25wXMUUd1y9Acm0RqjCik3PI5kVRyDpK_kp1WLzoR3G5xI8Z-wO6Moy70lzJvkUbUqGmx0jebA88MKobxHZ2FuzUs_olalwfEJzP5RMuZ6xAa5J681hZKSmr7alyVu1rn1bHVA9nzPXhuSfPIfaaPVvIjzLOuwxscwWZlrCLwzrhQ_QczupsfBkdWmzYbQjgRPqvyfr1MlSm1l5QeYYtj73ZCx8fzXbCyhHfbvEF_z_6fna8hbfFqojvCzs"
        />
        <div className="absolute bottom-20 left-20 z-20 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/80 backdrop-blur-md border border-outline-variant mb-6 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-bold text-[12px] uppercase tracking-widest text-on-surface">Members Only Platform</span>
          </div>
          <h2 className="font-display-auction text-5xl font-extrabold text-on-background mb-4 leading-tight">
            Join the <span className="text-primary italic">Elite Circle.</span>
          </h2>
          <p className="font-body-lg text-lg text-on-surface-variant max-w-md">
            Access exclusive auctions curated for serious collectors. Your journey into high-value bidding starts here.
          </p>
        </div>
      </div>
    </div>
  );
}
