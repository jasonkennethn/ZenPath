"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define backend URL - since backend runs on localhost:8000, we hardcode it or use config
const BACKEND_URL = "http://localhost:8000";

interface UserProfile {
  id: number;
  email: string;
  role: "student" | "hiring_manager";
  name: string;
  bio: string | null;
  skills: string | null;
  resume_url: string | null;
  created_at: string;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: "student" | "hiring_manager") => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: { name?: string; bio?: string; skills?: string; resume_url?: string; password?: string }) => Promise<void>;
  fetchProfile: (authToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const router = useRouter();

  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
      setTheme("light");
    } else if (savedTheme === "dark") {
      document.documentElement.classList.remove("light");
      setTheme("dark");
    } else {
      // System color scheme detection
      const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      if (systemPrefersLight) {
        document.documentElement.classList.add("light");
        setTheme("light");
      } else {
        document.documentElement.classList.remove("light");
        setTheme("dark");
      }
    }

    const savedToken = localStorage.getItem("job_scraper_token");
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        // Token might have expired
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // API expects form-encoded username/password
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Incorrect email or password");
      }

      const data = await response.json();
      localStorage.setItem("job_scraper_token", data.access_token);
      setToken(data.access_token);
      await fetchProfile(data.access_token);
      setLoading(false);
      router.push("/dashboard");
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: "student" | "hiring_manager") => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("job_scraper_token", data.access_token);
      setToken(data.access_token);
      await fetchProfile(data.access_token);
      setLoading(false);
      router.push("/dashboard");
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("job_scraper_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const updateProfile = async (profileData: { name?: string; bio?: string; skills?: string; resume_url?: string; password?: string }) => {
    if (!token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Profile update failed");
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, theme, toggleTheme, login, register, logout, updateProfile, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export { BACKEND_URL };
