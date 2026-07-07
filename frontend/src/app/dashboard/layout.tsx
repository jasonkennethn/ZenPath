"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, LayoutDashboard, User as UserIcon, LogOut, Loader, GraduationCap, Briefcase, Sun, Moon } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading, logout, theme, toggleTheme } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading and no token, redirect to login
    if (!loading && !token) {
      router.push("/login");
    }
  }, [token, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-10 h-10 animate-spin text-primary" />
          <p className="text-foreground-secondary text-sm animate-pulse">Loading dashboard portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass border-b md:border-b-0 md:border-r border-border-custom flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="p-6 flex items-center gap-2.5 border-b border-border-custom">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg active-shrink p-2">
              <img src="/logo.png" alt="ZenPath Logo" className="logo-img w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-primary">
              ZenPath
            </span>
          </div>

          {/* User Profile Info Card */}
          <div className="p-5 border-b border-border-custom bg-black/5 dark:bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-foreground truncate">{user.name}</h4>
                <p className="text-xs text-foreground-secondary truncate">{user.email}</p>
              </div>
            </div>
            {/* Role Badge */}
            <div className="mt-3 flex">
              {user.role === "student" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 border border-indigo-500/20">
                  <GraduationCap className="w-3 h-3" /> Student Portal
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-500 dark:text-purple-300 border border-purple-500/20">
                  <Briefcase className="w-3 h-3" /> Hiring Manager
                </span>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-1">
            <Link
              href="/dashboard"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 active-shrink ${
                pathname === "/dashboard"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground-secondary hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard Home
            </Link>
          </nav>
        </div>

        {/* Logout Bottom Footer */}
        <div className="p-4 border-t border-border-custom">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-all duration-200 active-shrink cursor-pointer mb-2"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-5 h-5 text-amber-400" /> Light Mode
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-indigo-400" /> Dark Mode
              </>
            )}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 active-shrink cursor-pointer"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
