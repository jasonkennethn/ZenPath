"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, AlertCircle, Loader } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 relative min-h-screen text-foreground">
      {/* Background decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md glass p-8 rounded-3xl shadow-2xl relative z-10 border border-border-custom float-slow">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center mb-4 shadow-lg active-shrink p-2.5">
            <img src="/logo.png" alt="ZenPath Logo" className="logo-img w-full h-full object-contain" />
          </Link>
          <h2 className="text-3xl font-extrabold text-foreground text-center">Welcome Back</h2>
          <p className="text-foreground-secondary text-sm mt-2">Sign in to manage your career portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-750 dark:text-red-200 text-sm flex items-center gap-3 bounce-transition scale-102">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3.5 pl-12 pr-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 spring-transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3.5 pl-12 pr-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 spring-transition text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2 active-shrink spring-transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-foreground-secondary text-center text-sm mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:text-indigo-500 font-semibold transition-colors duration-200">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
