"use client";

import Link from "next/link";
import { ArrowRight, Search, FileText, Database, Shield, Zap, Sparkles, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { theme, toggleTheme } = useAuth();

  return (
    <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/20 blur-3xl pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-accent/20 blur-3xl pulse-slow pointer-events-none" />

      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-border-custom">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg active-shrink p-2">
            <img src="/logo.png" alt="ZenPath Logo" className="logo-img w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-primary hidden sm:block">
            ZenPath
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 glass border border-border-custom text-foreground-secondary hover:text-foreground rounded-xl active-shrink transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-foreground-secondary hover:text-foreground transition-colors duration-200 active-shrink"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-indigo-500/20 active-shrink spring-transition hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center justify-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-indigo-500/30 text-indigo-500 dark:text-indigo-300 text-xs font-medium mb-8 animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          Next-Gen AI Job Platform
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 max-w-4xl leading-tight">
          Supercharge Your Job Search with{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
            Gemini AI
          </span>
        </h1>

        <p className="text-foreground-secondary text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          The ultimate platform for Students to intelligently scrape and apply to jobs, and for Hiring Managers to post positions and track applicants seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link
            href="/register?role=student"
            className="px-8 py-4 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2 active-shrink spring-transition hover:scale-105"
          >
            Register as Student <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/register?role=hiring_manager"
            className="px-8 py-4 glass text-foreground font-semibold rounded-2xl shadow-lg border border-border-custom flex items-center justify-center gap-2 active-shrink spring-transition hover:bg-black/5 dark:hover:bg-white/5 hover:scale-105"
          >
            Hiring Manager Hub
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-10">
          <div className="glass-card p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-primary">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">AI Web Scraper</h3>
            <p className="text-foreground-secondary text-sm leading-relaxed">
              Scrape listings instantly from any website using Gemini 1.5 Flash. We extract jobs from raw text or page URLs seamlessly.
            </p>
          </div>

          <div className="glass-card p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-accent">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Application History</h3>
            <p className="text-foreground-secondary text-sm leading-relaxed">
              Keep a smooth tracking timeline of all your applications and watch their status update dynamically as managers review.
            </p>
          </div>

          <div className="glass-card p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6 text-secondary">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Hiring Board</h3>
            <p className="text-foreground-secondary text-sm leading-relaxed">
              Managers can create, update, and close job postings. Oversee applicants lists and update review stages with responsive UI triggers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
