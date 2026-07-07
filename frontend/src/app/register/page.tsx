"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, AlertCircle, Loader, Briefcase, GraduationCap, ArrowLeft } from "lucide-react";

function RegisterContent() {
  const { register } = useAuth();
  const searchParams = useSearchParams();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "hiring_manager">("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "hiring_manager" || roleParam === "student") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password, role);
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md glass p-8 rounded-3xl shadow-2xl relative z-10 border border-border-custom text-foreground">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <Link href="/" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center mb-4 shadow-lg active-shrink p-2.5">
          <img src="/logo.png" alt="ZenPath Logo" className="logo-img w-full h-full object-contain" />
        </Link>
        <h2 className="text-3xl font-extrabold text-foreground text-center">Create Account</h2>
        <p className="text-foreground-secondary text-sm mt-2">Join ZenPath today</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-750 dark:text-red-200 text-sm flex items-center gap-3 bounce-transition">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Toggle Selector */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2.5 text-center">Choose Your Account Type</label>
        <div className="grid grid-cols-2 gap-3 p-1 bg-black/10 dark:bg-slate-950/80 rounded-2xl border border-border-custom">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 cursor-pointer ${
              role === "student"
                ? "bg-primary text-white shadow-lg shadow-indigo-500/20"
                : "text-foreground-secondary hover:text-foreground"
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Student
          </button>
          <button
            type="button"
            onClick={() => setRole("hiring_manager")}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 cursor-pointer ${
              role === "hiring_manager"
                ? "bg-accent text-white shadow-lg shadow-purple-500/20"
                : "text-foreground-secondary hover:text-foreground"
            }`}
          >
            <Briefcase className="w-4 h-4" /> Manager
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4.5">
        <div>
          <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3.5 pl-12 pr-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 spring-transition text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-secondary" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
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
              placeholder="•••••••• (Min 6 chars)"
              className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3.5 pl-12 pr-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 spring-transition text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 text-white font-semibold rounded-2xl shadow-xl flex items-center justify-center gap-2 active-shrink spring-transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer ${
            role === "student"
              ? "bg-gradient-to-r from-primary to-indigo-600 shadow-indigo-500/10"
              : "bg-gradient-to-r from-accent to-purple-600 shadow-purple-500/10"
          }`}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" /> Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-foreground-secondary text-center text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:text-indigo-500 font-semibold transition-colors duration-200">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function Register() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 relative min-h-screen">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-border-custom text-sm font-semibold text-foreground-secondary hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 active-shrink cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      
      <Suspense fallback={
        <div className="w-full max-w-md glass p-8 rounded-3xl shadow-2xl flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <RegisterContent />
      </Suspense>
    </div>
  );
}
