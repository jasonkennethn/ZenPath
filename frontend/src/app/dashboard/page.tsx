"use client";

import { useState, useEffect } from "react";
import { useAuth, BACKEND_URL } from "@/context/AuthContext";
import {
  Search,
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Globe,
  Loader,
  X,
  FileText,
  User as UserIcon,
  CheckCircle,
  Clock,
  ThumbsUp,
  XCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Send,
  Edit2,
  Trash2,
  ListTodo,
  Sparkles,
  GraduationCap
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string | null;
  location: string;
  salary_range: string | null;
  created_by: number | null;
  is_active: boolean;
  source: string;
  application_url: string | null;
  created_at: string;
}

interface Application {
  id: number;
  job_id: number;
  student_id: number;
  status: "applied" | "reviewing" | "accepted" | "rejected";
  resume_url: string | null;
  cover_letter: string | null;
  applied_at: string;
  job: Job;
  student: {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    skills: string | null;
  };
}

// --- Skeleton Loaders for Ultra-Fast UI Feel ---
function JobCardSkeleton() {
  return (
    <div className="glass-card p-6 flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="space-y-2 w-2/3">
            <div className="h-2.5 bg-foreground/10 rounded-full w-24" />
            <div className="h-4 bg-foreground/20 rounded-full w-48" />
          </div>
          <div className="h-5 bg-foreground/15 rounded-md w-16" />
        </div>
        <div className="flex gap-4 mb-5">
          <div className="h-3.5 bg-foreground/10 rounded-full w-20" />
          <div className="h-3.5 bg-foreground/10 rounded-full w-20" />
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-3 bg-foreground/10 rounded-full w-full" />
          <div className="h-3 bg-foreground/10 rounded-full w-11/12" />
        </div>
      </div>
      <div className="flex gap-3 border-t border-border-custom pt-4">
        <div className="h-9 bg-foreground/20 rounded-xl flex-1" />
        <div className="h-9 bg-foreground/10 rounded-xl w-10" />
      </div>
    </div>
  );
}

function ApplicationSkeleton() {
  return (
    <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
      <div className="space-y-3 flex-1">
        <div className="h-2.5 bg-foreground/10 rounded-full w-24" />
        <div className="h-4 bg-foreground/20 rounded-full w-52" />
        <div className="h-3 bg-foreground/10 rounded-full w-44" />
      </div>
      <div className="h-8 bg-foreground/15 rounded-full w-24 shrink-0" />
    </div>
  );
}

function ManagerRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-4.5 px-6"><div className="h-4 bg-foreground/20 rounded-full w-36" /></td>
      <td className="py-4.5 px-6"><div className="h-4 bg-foreground/10 rounded-full w-28" /></td>
      <td className="py-4.5 px-6"><div className="h-4 bg-foreground/10 rounded-full w-24" /></td>
      <td className="py-4.5 px-6 text-center"><div className="h-7 bg-foreground/15 rounded-lg w-28 mx-auto" /></td>
      <td className="py-4.5 px-6 text-right"><div className="h-8 bg-foreground/10 rounded-lg w-20 ml-auto" /></td>
    </tr>
  );
}

export default function Dashboard() {
  const { user, token } = useAuth();

  // Common State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [activeTab, setActiveTab] = useState<"jobs" | "applications" | "profile" | "manage_jobs">("jobs");

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Student Specific State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState<"all" | "internal" | "external">("all");
  const [scraperUrl, setScraperUrl] = useState("");
  const [scraperSearch, setScraperSearch] = useState("");
  const [scraping, setScraping] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  
  // Student Profile fields
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(user?.skills || "");
  const [resumeUrl, setResumeUrl] = useState(user?.resume_url || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Apply Modal State
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [appResumeUrl, setAppResumeUrl] = useState("");
  const [applying, setApplying] = useState(false);

  // --- Hiring Manager Specific State ---
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobReqs, setJobReqs] = useState("");
  const [savingJob, setSavingJob] = useState(false);
  const [managerApplicants, setManagerApplicants] = useState<Application[]>([]);
  const [viewingApplicantsJob, setViewingApplicantsJob] = useState<Job | null>(null);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Initial Data Loading
  useEffect(() => {
    fetchJobs();
    if (user?.role === "student" && token) {
      fetchApplications();
    }
  }, [user, token]);

  // Sync profile fields when user loads
  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setSkills(user.skills || "");
      setResumeUrl(user.resume_url || "");
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setTimeout(() => setLoadingJobs(false), 50);
    }
  };

  const fetchApplications = async () => {
    if (!token) return;
    setLoadingApps(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setTimeout(() => setLoadingApps(false), 50);
    }
  };

  // --- Student Actions ---
  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!scraperUrl && !scraperSearch) return;

    setScraping(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: scraperUrl || null,
          search_query: scraperSearch || null,
        }),
      });

      if (response.ok) {
        const newJobs = await response.json();
        setJobs((prev) => [...newJobs, ...prev]);
        setScraperUrl("");
        setScraperSearch("");
        triggerToast(`Successfully imported ${newJobs.length} job postings!`, "success");
      } else {
        const err = await response.json();
        triggerToast(err.detail || "Failed to scrape jobs.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("An error occurred during scraping.", "error");
    } finally {
      setScraping(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !applyJob) return;

    setApplying(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/applications?job_id=${applyJob.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cover_letter: coverLetter,
          resume_url: appResumeUrl || null,
        }),
      });

      if (response.ok) {
        triggerToast("Application submitted successfully!", "success");
        setApplyJob(null);
        setCoverLetter("");
        setAppResumeUrl("");
        fetchApplications();
      } else {
        const err = await response.json();
        triggerToast(err.detail || "Failed to submit application.", "error");
      }
    } catch (error) {
      triggerToast("Error applying to job.", "error");
    } finally {
      setApplying(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setUpdatingProfile(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user?.name,
          bio,
          skills,
          resume_url: resumeUrl,
        }),
      });

      if (response.ok) {
        triggerToast("Profile updated successfully!", "success");
      } else {
        triggerToast("Failed to update profile.", "error");
      }
    } catch (error) {
      triggerToast("Error updating profile.", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // --- Hiring Manager Actions ---
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSavingJob(true);
    try {
      const method = editingJob ? "PUT" : "POST";
      const endpoint = editingJob ? `${BACKEND_URL}/api/jobs/${editingJob.id}` : `${BACKEND_URL}/api/jobs`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: jobTitle,
          company: jobCompany,
          location: jobLocation,
          salary_range: jobSalary || "Not Specified",
          description: jobDesc,
          requirements: jobReqs,
        }),
      });

      if (response.ok) {
        triggerToast(editingJob ? "Job updated successfully!" : "Job posted successfully!", "success");
        setShowPostModal(false);
        setEditingJob(null);
        clearJobForm();
        fetchJobs();
      } else {
        const err = await response.json();
        triggerToast(err.detail || "Failed to save job posting.", "error");
      }
    } catch (error) {
      triggerToast("Error saving job posting.", "error");
    } finally {
      setSavingJob(false);
    }
  };

  const clearJobForm = () => {
    setJobTitle("");
    setJobCompany("");
    setJobLocation("");
    setJobSalary("");
    setJobDesc("");
    setJobReqs("");
  };

  const handleEditJobClick = (job: Job) => {
    setEditingJob(job);
    setJobTitle(job.title);
    setJobCompany(job.company);
    setJobLocation(job.location);
    setJobSalary(job.salary_range || "");
    setJobDesc(job.description);
    setJobReqs(job.requirements || "");
    setShowPostModal(true);
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!token || !confirm("Are you sure you want to close/delete this job posting?")) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        triggerToast("Job listing closed successfully.", "success");
        fetchJobs();
      } else {
        triggerToast("Failed to delete job.", "error");
      }
    } catch (error) {
      triggerToast("Error deleting job.", "error");
    }
  };

  const handleViewApplicants = async (job: Job) => {
    if (!token) return;
    setViewingApplicantsJob(job);
    setLoadingApplicants(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/jobs/${job.id}/applicants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setManagerApplicants(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateAppStatus = async (appId: number, nextStatus: "applied" | "reviewing" | "accepted" | "rejected") => {
    if (!token || !viewingApplicantsJob) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/applications/${appId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        setManagerApplicants((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: nextStatus } : app))
        );
        triggerToast(`Candidate status updated to ${nextStatus}!`, "success");
      } else {
        triggerToast("Failed to update candidate status.", "error");
      }
    } catch (error) {
      triggerToast("Error updating application status.", "error");
    }
  };

  // Filter Jobs for Display
  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query);

    if (filterSource === "internal") {
      return matchesQuery && job.source === "internal";
    } else if (filterSource === "external") {
      return matchesQuery && job.source !== "internal";
    }
    return matchesQuery;
  });

  return (
    <div className="flex-1 flex flex-col relative text-foreground">
      {/* -------------------- STUDENT DASHBOARD -------------------- */}
      {user?.role === "student" && (
        <div className="flex-1 flex flex-col">
          {/* Tabs header */}
          <div className="flex border-b border-border-custom mb-8">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all duration-200 active-shrink cursor-pointer ${
                activeTab === "jobs"
                  ? "border-primary text-foreground"
                  : "border-transparent text-foreground-secondary hover:text-foreground"
              }`}
            >
              Search & Scrape Jobs
            </button>
            <button
              onClick={() => {
                setActiveTab("applications");
                fetchApplications();
              }}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all duration-200 active-shrink cursor-pointer ${
                activeTab === "applications"
                  ? "border-primary text-foreground"
                  : "border-transparent text-foreground-secondary hover:text-foreground"
              }`}
            >
              Application History
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all duration-200 active-shrink cursor-pointer ${
                activeTab === "profile"
                  ? "border-primary text-foreground"
                  : "border-transparent text-foreground-secondary hover:text-foreground"
              }`}
            >
              My Profile
            </button>
          </div>

          {/* TAB 1: SEARCH & SCRAPE JOBS */}
          {activeTab === "jobs" && (
            <div className="space-y-8 flex-1 flex flex-col">
              {/* Scraper Tool Card */}
              <div className="glass p-6 rounded-2xl border border-indigo-500/10">
                <div className="flex items-center gap-2 mb-4">
                  <ListTodo className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <h3 className="text-lg font-bold text-foreground">Gemini Intelligent Job Scraper</h3>
                </div>
                <p className="text-foreground-secondary text-xs mb-5">
                  Paste a career page URL or enter a search query. Gemini AI 1.5 Flash will automatically scrape, structure, and save jobs to the dashboard.
                </p>
                <form onSubmit={handleScrape} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                    <input
                      type="url"
                      value={scraperUrl}
                      onChange={(e) => {
                        setScraperUrl(e.target.value);
                        if (e.target.value) setScraperSearch("");
                      }}
                      placeholder="Paste website URL to scrape (e.g. stripe.com/careers)"
                      className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-xl py-3 pl-11 pr-4 text-foreground placeholder-foreground-secondary/60 focus:outline-none focus:border-indigo-500/50 text-sm spring-transition"
                    />
                  </div>
                  <div className="md:col-span-2 text-center text-foreground-secondary text-xs font-bold self-center">OR</div>
                  <div className="md:col-span-3 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                    <input
                      type="text"
                      value={scraperSearch}
                      onChange={(e) => {
                        setScraperSearch(e.target.value);
                        if (e.target.value) setScraperUrl("");
                      }}
                      placeholder="AI Search Query (e.g. React developer)"
                      className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-xl py-3 pl-11 pr-4 text-foreground placeholder-foreground-secondary/60 focus:outline-none focus:border-indigo-500/50 text-sm spring-transition"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={scraping || (!scraperUrl && !scraperSearch)}
                      className="w-full h-full py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold rounded-xl flex items-center justify-center gap-2 active-shrink spring-transition hover:scale-102 disabled:opacity-30 disabled:cursor-not-allowed text-sm cursor-pointer"
                    >
                      {scraping ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin animate-pulse" /> Scraping...
                        </>
                      ) : (
                        "Scrape Jobs"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Jobs Search and Filter board */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search query input */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground-secondary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search listed jobs..."
                    className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-xl py-2.5 pl-11 pr-4 text-foreground placeholder-foreground-secondary/60 focus:outline-none focus:border-indigo-500/50 text-sm"
                  />
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 bg-black/10 dark:bg-slate-950/60 p-1 rounded-xl border border-border-custom w-full md:w-auto">
                  <button
                    onClick={() => setFilterSource("all")}
                    className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      filterSource === "all" ? "bg-white/10 dark:bg-white/10 text-foreground" : "text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    All Jobs
                  </button>
                  <button
                    onClick={() => setFilterSource("internal")}
                    className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      filterSource === "internal" ? "bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 border border-indigo-500/10" : "text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    Internal Only
                  </button>
                  <button
                    onClick={() => setFilterSource("external")}
                    className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      filterSource === "external" ? "bg-purple-500/20 text-purple-500 dark:text-purple-300 border border-purple-500/10" : "text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    Scraped Only
                  </button>
                </div>
              </div>

              {/* Jobs Grid list */}
              {loadingJobs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="glass p-12 text-center border-dashed border-border-custom rounded-2xl">
                  <Briefcase className="w-10 h-10 text-foreground-secondary mx-auto mb-4" />
                  <h4 className="text-foreground font-bold text-lg mb-1">No job listings found</h4>
                  <p className="text-foreground-secondary text-xs max-w-sm mx-auto">
                    Try adjustment of search filters or use our Gemini Scraper above to parse external jobs directly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="glass-card p-6 flex flex-col justify-between hover-spring">
                      <div>
                        {/* Header details */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest block mb-1">
                              {job.company}
                            </span>
                            <h4 className="text-lg font-bold text-foreground leading-snug">{job.title}</h4>
                          </div>

                          {/* Source Badge */}
                          {job.source === "internal" ? (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              Internal
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              {job.source}
                            </span>
                          )}
                        </div>

                        {/* Location, Salary information */}
                        <div className="flex flex-wrap gap-4 text-xs text-foreground-secondary mb-5">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-foreground-secondary/80" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-foreground-secondary/80" />
                            {job.salary_range || "Not Specified"}
                          </div>
                        </div>

                        <p className="text-foreground-secondary text-xs line-clamp-3 mb-6 leading-relaxed">
                          {job.description}
                        </p>
                      </div>

                      {/* Apply button and external link */}
                      <div className="flex items-center gap-3 border-t border-border-custom pt-4">
                        <button
                          onClick={() => {
                            setApplyJob(job);
                            setAppResumeUrl(user?.resume_url || "");
                          }}
                          className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 active-shrink spring-transition hover:scale-102 cursor-pointer"
                        >
                          Apply Now
                        </button>
                        {job.application_url && (
                          <a
                            href={job.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 glass border border-border-custom text-foreground-secondary hover:text-foreground rounded-xl active-shrink transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APPLICATION HISTORY */}
          {activeTab === "applications" && (
            <div className="space-y-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-foreground mb-2">My Applications timeline</h3>

              {loadingApps ? (
                <div className="space-y-4">
                  <ApplicationSkeleton />
                  <ApplicationSkeleton />
                  <ApplicationSkeleton />
                </div>
              ) : applications.length === 0 ? (
                <div className="glass p-12 text-center border-dashed border-border-custom rounded-2xl">
                  <CheckCircle className="w-10 h-10 text-foreground-secondary mx-auto mb-4" />
                  <h4 className="text-foreground font-bold text-base mb-1">No applications submitted yet</h4>
                  <p className="text-foreground-secondary text-xs">Find a job posting and submit your details to track it here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((app) => (
                    <div key={app.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover-spring">
                      {/* Job details */}
                      <div>
                        <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest block mb-1">
                          {app.job.company}
                        </span>
                        <h4 className="text-lg font-bold text-foreground mb-2">{app.job.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-foreground-secondary">
                          <span>Applied on: {new Date(app.applied_at).toLocaleDateString()}</span>
                          {app.resume_url && (
                            <a
                              href={app.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <FileText className="w-3 h-3" /> View Submitted Resume
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Application status timeline stage badge */}
                      <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border-custom pt-4 md:pt-0 md:pl-6 shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-foreground-secondary font-semibold mb-1">Status</div>
                          {app.status === "applied" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-450 border border-indigo-500/20">
                              <Clock className="w-3.5 h-3.5" /> Applied
                            </span>
                          )}
                          {app.status === "reviewing" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-450 border border-yellow-500/20">
                              <Loader className="w-3.5 h-3.5 animate-spin" /> Reviewing
                            </span>
                          )}
                          {app.status === "accepted" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 animate-bounce">
                              <ThumbsUp className="w-3.5 h-3.5" /> Accepted
                            </span>
                          )}
                          {app.status === "rejected" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-450 border border-red-500/20">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NEAT & PREMIUM STUDENT PROFILE EDITOR */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Profile Card Preview Left */}
              <div className="lg:col-span-4 glass p-6 rounded-2xl border border-border-custom flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl mb-4 hover:rotate-12 transition-transform duration-300">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-foreground">{user?.name}</h3>
                <p className="text-foreground-secondary text-xs mb-4">{user?.email}</p>
                <div className="w-full border-t border-border-custom my-4" />
                
                <div className="w-full text-left space-y-4">
                  <div>
                    <span className="text-[10px] text-foreground-secondary font-bold uppercase tracking-wider block mb-1">My Biography</span>
                    <p className="text-foreground-secondary text-xs leading-relaxed italic">
                      {bio || "No professional biography has been added yet."}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-foreground-secondary font-bold uppercase tracking-wider block mb-2">My Skills Badges</span>
                    <div className="flex flex-wrap gap-1.5">
                      {skills ? (
                        skills.split(",").map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-semibold">
                            {s.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-foreground-secondary text-xs italic">No skills added.</span>
                      )}
                    </div>
                  </div>
                  {resumeUrl && (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-border-custom active-shrink transition-all mt-4"
                    >
                      <FileText className="w-4 h-4 text-indigo-500" /> View Current Resume
                    </a>
                  )}
                </div>
              </div>

              {/* Profile Editor Form Right */}
              <div className="lg:col-span-8 glass p-8 rounded-3xl border border-border-custom">
                <h3 className="text-xl font-bold text-foreground mb-6">Profile Settings</h3>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Short Professional Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell companies about your professional interests, stack experience, and what jobs you are looking for..."
                      rows={4}
                      className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3 px-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 text-sm spring-transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Skills (Comma Separated)</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="React, Next.js, TypeScript, Tailwind, Python"
                      className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3.5 px-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 text-sm spring-transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Resume / Portfolio URL</label>
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://myportfolio.com/resume.pdf"
                      className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3.5 px-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 text-sm spring-transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2 active-shrink spring-transition hover:scale-[1.01] cursor-pointer"
                  >
                    {updatingProfile ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Profile Details"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- HIRING MANAGER DASHBOARD -------------------- */}
      {user?.role === "hiring_manager" && (
        <div className="flex-1 flex flex-col text-foreground">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-6 flex items-center justify-between border-indigo-500/10">
              <div>
                <span className="text-xs font-bold text-foreground-secondary uppercase tracking-wider block mb-1">My Posted Jobs</span>
                <span className="text-3xl font-extrabold text-foreground">
                  {jobs.filter((j) => j.created_by === user.id).length}
                </span>
              </div>
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="glass-card p-6 flex items-center justify-between border-purple-500/10">
              <div>
                <span className="text-xs font-bold text-foreground-secondary uppercase tracking-wider block mb-1">Incoming Applicants</span>
                <span className="text-3xl font-extrabold text-foreground">
                  New candidates awaiting review
                </span>
              </div>
              <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent shadow">
                <UserIcon className="w-6 h-6 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground">My Active Listings</h3>
            <button
              onClick={() => {
                setEditingJob(null);
                clearJobForm();
                setShowPostModal(true);
              }}
              className="py-2.5 px-5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 active-shrink spring-transition hover:scale-105 shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Post a Job opening
            </button>
          </div>

          {/* Posted Jobs Table */}
          {loadingJobs ? (
            <div className="glass rounded-2xl overflow-hidden border border-border-custom">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-custom bg-black/[0.01] dark:bg-white/[0.01] text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
                    <th className="py-4 px-6">Job Title</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Salary Range</th>
                    <th className="py-4 px-6 text-center">Applicants</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom text-sm">
                  <ManagerRowSkeleton />
                  <ManagerRowSkeleton />
                  <ManagerRowSkeleton />
                </tbody>
              </table>
            </div>
          ) : jobs.filter((j) => j.created_by === user.id).length === 0 ? (
            <div className="glass p-16 text-center border-dashed border-border-custom rounded-2xl">
              <Briefcase className="w-12 h-12 text-foreground-secondary mx-auto mb-4" />
              <h4 className="text-foreground font-bold text-lg mb-1">No job openings posted yet</h4>
              <p className="text-foreground-secondary text-xs max-w-sm mx-auto mb-6">
                Post your first job opening to start receiving student applications.
              </p>
              <button
                onClick={() => setShowPostModal(true)}
                className="py-2.5 px-5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl active-shrink spring-transition hover:scale-102 cursor-pointer"
              >
                Create First Posting
              </button>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden border border-border-custom">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-custom bg-black/[0.01] dark:bg-white/[0.01] text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
                      <th className="py-4 px-6">Job Title</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Salary Range</th>
                      <th className="py-4 px-6 text-center">Applicants</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom text-sm">
                    {jobs
                      .filter((job) => job.created_by === user.id)
                      .map((job) => (
                        <tr key={job.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] spring-transition">
                          <td className="py-4.5 px-6 font-bold text-foreground">{job.title}</td>
                          <td className="py-4.5 px-6 text-foreground-secondary">{job.location}</td>
                          <td className="py-4.5 px-6 text-foreground-secondary">{job.salary_range || "Not Specified"}</td>
                          <td className="py-4.5 px-6 text-center">
                            <button
                              onClick={() => handleViewApplicants(job)}
                              className="px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-lg cursor-pointer active-shrink spring-transition"
                            >
                              View Candidates
                            </button>
                          </td>
                          <td className="py-4.5 px-6 text-right space-x-2">
                            <button
                              onClick={() => handleEditJobClick(job)}
                              className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground-secondary hover:text-foreground rounded-lg cursor-pointer active-shrink transition-colors"
                              title="Edit Job"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg cursor-pointer active-shrink transition-colors"
                              title="Close Job"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- MODAL: APPLY TO JOB -------------------- */}
      {applyJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass p-8 rounded-3xl shadow-2xl relative border border-border-custom bounce-transition text-foreground">
            <button
              onClick={() => setApplyJob(null)}
              className="absolute top-5 right-5 p-1.5 text-foreground-secondary hover:text-foreground rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-2">Apply to Position</h3>
            <p className="text-foreground-secondary text-xs mb-6">
              Submitting application for <span className="text-foreground font-bold">{applyJob.title}</span> at <span className="text-foreground font-bold">{applyJob.company}</span>.
            </p>

            <form onSubmit={handleApply} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Cover Letter / Pitch</label>
                <textarea
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why are you a good fit for this role? Share details of your experience..."
                  rows={5}
                  className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3 px-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/50 text-sm spring-transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Resume / Portfolio Link</label>
                <input
                  type="url"
                  value={appResumeUrl}
                  onChange={(e) => setAppResumeUrl(e.target.value)}
                  placeholder="https://myportfolio.com/resume.pdf"
                  className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3.5 px-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/50 text-sm spring-transition"
                />
                <span className="text-[10px] text-foreground-secondary block mt-1">Leaves empty to fall back to your profile resume.</span>
              </div>

              <button
                type="submit"
                disabled={applying}
                className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2 active-shrink spring-transition hover:scale-[1.01] cursor-pointer"
              >
                {applying ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: POST / EDIT JOB -------------------- */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl glass p-8 rounded-3xl shadow-2xl relative border border-border-custom bounce-transition overflow-y-auto max-h-[90vh] text-foreground">
            <button
              onClick={() => {
                setShowPostModal(false);
                setEditingJob(null);
                clearJobForm();
              }}
              className="absolute top-5 right-5 p-1.5 text-foreground-secondary hover:text-foreground rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-6">
              {editingJob ? "Edit Job Posting" : "Post a New Job Opening"}
            </h3>

            <form onSubmit={handlePostJob} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Senior React Developer"
                    className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3 px-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/50 text-sm spring-transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Company Name</label>
                  <input
                    type="text"
                    required
                    value={jobCompany}
                    onChange={(e) => setJobCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3 px-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/50 text-sm spring-transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    required
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3 px-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/50 text-sm spring-transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Salary Range</label>
                  <input
                    type="text"
                    value={jobSalary}
                    onChange={(e) => setJobSalary(e.target.value)}
                    placeholder="$120,000 - $150,000"
                    className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3 px-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/50 text-sm spring-transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Job Description</label>
                <textarea
                  required
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Describe roles, daily responsibilities, stack and expectations..."
                  rows={4}
                  className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3 px-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/50 text-sm spring-transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Requirements</label>
                <textarea
                  value={jobReqs}
                  onChange={(e) => setJobReqs(e.target.value)}
                  placeholder="Skills, experiences, degree requirements, or qualifications..."
                  rows={3}
                  className="w-full bg-black/5 dark:bg-white/[0.02] border border-border-custom rounded-2xl py-3 px-4 text-foreground placeholder-foreground-secondary/55 focus:outline-none focus:border-indigo-500/50 text-sm spring-transition"
                />
              </div>

              <button
                type="submit"
                disabled={savingJob}
                className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2 active-shrink spring-transition hover:scale-[1.01] cursor-pointer"
              >
                {savingJob ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" /> Saving Listing...
                  </>
                ) : (
                  editingJob ? "Save Changes" : "Post Job Opening"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- DRAWER / MODAL: VIEW APPLICANTS -------------------- */}
      {viewingApplicantsJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-background border-l border-border-custom h-full flex flex-col shadow-2xl relative animate-slide-in text-foreground">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border-custom flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.01]">
              <div>
                <h3 className="text-xl font-bold text-foreground">Candidates Tracking</h3>
                <p className="text-xs text-foreground-secondary mt-1">
                  Reviewing applicants for <span className="text-foreground font-semibold">{viewingApplicantsJob.title}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingApplicantsJob(null)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-foreground-secondary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidates List Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingApplicants ? (
                <div className="flex items-center justify-center py-20">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : managerApplicants.length === 0 ? (
                <div className="text-center py-20">
                  <UserIcon className="w-10 h-10 text-foreground-secondary/60 mx-auto mb-3" />
                  <p className="text-foreground-secondary text-sm font-semibold">No applications received yet.</p>
                  <p className="text-foreground-secondary/70 text-xs">Awaiting student submissions.</p>
                </div>
              ) : (
                managerApplicants.map((app) => (
                  <div key={app.id} className="glass p-6 rounded-2xl border border-border-custom space-y-5">
                    {/* Applicant Profile info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
                          {app.student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{app.student.name}</h4>
                          <p className="text-xs text-foreground-secondary">{app.student.email}</p>
                        </div>
                      </div>

                      {/* View Resume link */}
                      {app.resume_url && (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 glass text-foreground-secondary hover:text-foreground text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 active-shrink cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-indigo-500" /> Resume
                        </a>
                      )}
                    </div>

                    {/* Bio & Skills */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-foreground-secondary font-bold block mb-0.5">Bio</span>
                        <p className="text-foreground-secondary leading-relaxed bg-black/5 dark:bg-slate-900/40 p-3 rounded-xl border border-border-custom">
                          {app.student.bio || "No biography provided by applicant."}
                        </p>
                      </div>
                      <div>
                        <span className="text-foreground-secondary font-bold block mb-1">Key Skills</span>
                        <div className="flex flex-wrap gap-2">
                          {app.student.skills ? (
                            app.student.skills.split(",").map((s) => (
                              <span
                                key={s}
                                className="px-2.5 py-1 bg-black/5 dark:bg-white/5 text-foreground-secondary rounded-lg text-[10px] font-semibold border border-border-custom"
                              >
                                {s.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-foreground-secondary/60 italic">No skills listed.</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-foreground-secondary font-bold block mb-0.5">Cover Letter / Pitch</span>
                        <p className="text-foreground-secondary leading-relaxed bg-black/5 dark:bg-slate-900/40 p-3 rounded-xl border border-border-custom whitespace-pre-wrap">
                          {app.cover_letter || "No cover letter provided."}
                        </p>
                      </div>
                    </div>

                    {/* Applicant Stage Actions */}
                    <div className="border-t border-border-custom pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-foreground-secondary font-bold uppercase tracking-wider block mb-1">
                          Current Stage
                        </span>
                        {app.status === "applied" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20">
                            Applied
                          </span>
                        )}
                        {app.status === "reviewing" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-650 dark:text-yellow-400 border border-yellow-500/20">
                            Reviewing
                          </span>
                        )}
                        {app.status === "accepted" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20">
                            Accepted
                          </span>
                        )}
                        {app.status === "rejected" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20">
                            Rejected
                          </span>
                        )}
                      </div>

                      {/* Status controllers */}
                      <div className="flex items-center gap-2">
                        {app.status === "applied" && (
                          <button
                            onClick={() => handleUpdateAppStatus(app.id, "reviewing")}
                            className="py-1.5 px-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold rounded-lg cursor-pointer active-shrink transition-all"
                          >
                            Mark Reviewing
                          </button>
                        )}
                        {["applied", "reviewing"].includes(app.status) && (
                          <>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, "accepted")}
                              className="py-1.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg cursor-pointer active-shrink transition-all"
                            >
                              Accept Candidate
                            </button>
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, "rejected")}
                              className="py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-600 dark:text-red-450 text-xs font-bold rounded-lg cursor-pointer active-shrink transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Beautiful Non-Blocking Glassmorphic Floating Toast Notification --- */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass-card px-5 py-3.5 flex items-center gap-3 border border-indigo-500/30 shadow-2xl animate-bounce">
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-foreground text-xs font-semibold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
