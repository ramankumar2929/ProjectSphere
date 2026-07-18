import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {FaGithub} from "react-icons/fa"
import {FaLinkedin} from "react-icons/fa"

import {
  CalendarDays,
  UserRound,
  Sparkles,
  Mail,
  AtSign,
  Contact,
  FolderGit2,
  Users,
  UserPlus,
  Eye,
  UserPen,
  FolderPlus,
  FolderKanban,
  Bookmark,
  BarChart3,
  History,
  ExternalLink,
  ImageOff,
  Gauge,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import api from "../services/api.js"; // adjust to your actual axios instance path

/* ------------------------------------------------------------------ */
/* Animation variants                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const containerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const pillContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const pillItem = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const formatMemberSince = (isoDate) => {
  if (!isoDate) return null;
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

/** Normalizes skills whether they arrive as an array or a comma-separated string. */
function normalizeSkills(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map((s) => s.trim()).filter(Boolean);
  if (typeof skills === "string") {
    return skills.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

const hasSkills = (skills) => normalizeSkills(skills).length > 0;

function getCompletionItems(user) {
  return [
    { key: "avatar", label: "Avatar", done: Boolean(user?.avatar) },
    { key: "bio", label: "Bio", done: Boolean(user?.bio?.trim()) },
    { key: "github", label: "GitHub", done: Boolean(user?.github) },
    { key: "linkedIn", label: "LinkedIn", done: Boolean(user?.linkedIn) },
    { key: "skills", label: "Skills", done: hasSkills(user?.skills) },
  ];
}

const QUICK_ACTIONS = [
  { key: "edit", label: "Edit Profile", icon: UserPen, path: "/profile/edit" },
  { key: "create", label: "Create Project", icon: FolderPlus, path: "/projects/new" },
  { key: "myprojects", label: "My Projects", icon: FolderKanban, path: "/projects/mine" },
  { key: "bookmarks", label: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
  { key: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
];

const STATS = [
  { key: "projects", label: "Projects Created", icon: FolderGit2, value: "Coming Soon" },
  { key: "followers", label: "Followers", icon: Users, value: "Coming Soon" },
  { key: "following", label: "Following", icon: UserPlus, value: "Coming Soon" },
  { key: "views", label: "Views", icon: Eye, value: "Coming Soon" },
];

/* ------------------------------------------------------------------ */
/* Skeleton shimmer block (used only in the loading state)             */
/* ------------------------------------------------------------------ */

const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden rounded-xl bg-white/5 ${className}`}>
    <motion.div
      className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent"
      animate={{ x: ["-100%", "200%"] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"

  const normalizeUrl = (url) => {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  return `https://${url}`;
};

  const fetchProfile = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await api.get("/users/currentuser");
      // Adjust this line if your backend wraps data differently, e.g. response.data.data
      const userData = response.data?.data ?? response.data;
      setUser(userData);
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ---------------------------- Loading ---------------------------- */
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#030712] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 mb-6">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <Shimmer className="h-28 w-28 rounded-full shrink-0" />
              <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                <Shimmer className="h-6 w-48 mx-auto sm:mx-0" />
                <Shimmer className="h-4 w-32 mx-auto sm:mx-0" />
                <Shimmer className="h-3 w-64 mx-auto sm:mx-0" />
                <div className="flex justify-center gap-3 sm:justify-start pt-2">
                  <Shimmer className="h-9 w-28" />
                  <Shimmer className="h-9 w-28" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                  <Shimmer className="h-4 w-28 mb-5" />
                  <Shimmer className="h-3 w-full mb-2.5" />
                  <Shimmer className="h-3 w-5/6 mb-2.5" />
                  <Shimmer className="h-3 w-2/3" />
                </div>
              ))}
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <Shimmer className="h-4 w-40 mb-5" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Shimmer key={i} className="h-20 w-full" />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                  <Shimmer className="h-4 w-28 mb-5" />
                  <Shimmer className="h-3 w-full mb-2.5" />
                  <Shimmer className="h-3 w-5/6 mb-2.5" />
                  <Shimmer className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------- Error ------------------------------ */
  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white/90">Unable to load profile.</h2>
          <p className="mt-1.5 text-sm text-white/50">Please try again.</p>

          <motion.button
            onClick={fetchProfile}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ---------------------------- Success ------------------------------ */
  const memberSince = formatMemberSince(user?.createdAt);
  const skillList = normalizeSkills(user?.skills);
  const completionItems = getCompletionItems(user);
  const completionPercent = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  );
  const recentlyViewed = Array.isArray(user?.recentlyViewedProjects)
    ? user.recentlyViewedProjects.filter((p) => p && typeof p === "object" && p.title)
    : [];
  const hasContactInfo = user?.email || user?.username || user?.github || user?.linkedIn;

  return (
    <div className="min-h-screen bg-[#030712] px-4 py-10 sm:px-6 lg:px-10">
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-7xl space-y-6"
      >
        {/* ---------------- Hero ---------------- */}
        <motion.section
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 250, damping: 15 }}
              className="relative shrink-0"
            >
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500 to-cyan-400 blur-md opacity-60" />
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt={user?.fullName || "User avatar"}
                className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover border-2 border-white/20"
              />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                {user?.fullName || "Unnamed User"}
              </h1>
              <p className="mt-1 text-sm font-medium bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                @{user?.username}
              </p>
              <p className="mt-3 text-sm text-white/60 max-w-xl">
                {user?.bio || "No bio added yet."}
              </p>
              {memberSince && (
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-1.5 text-xs text-white/40">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Member since {memberSince}</span>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                {user?.github && (
                  <motion.a
                    href={normalizeUrl(user.github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-colors"
                  >
                    <FaGithub className="h-4 w-4" />
                    GitHub
                  </motion.a>
                )}
                {user?.linkedIn && (
                  <motion.a
                    href={normalizeUrl(user.linkedIn)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-linear-to-r from-purple-500/20 to-cyan-500/20 px-4 py-2 text-sm text-white/80 backdrop-blur-md hover:from-purple-500/30 hover:to-cyan-500/30 hover:border-white/20 transition-colors"
                  >
                    <FaLinkedin className="h-4 w-4" />
                    LinkedIn
                  </motion.a>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ============== Main column ============== */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Me */}
            <motion.section
              variants={fadeUp}
              whileHover={{ y: -3 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-shadow hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.35)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <UserRound className="h-4 w-4 text-purple-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">About Me</h2>
              </div>
              <p className="text-white/80 leading-relaxed whitespace-pre-line">
                {user?.bio && user.bio.trim().length > 0 ? (
                  user.bio
                ) : (
                  <span className="text-white/40 italic">No bio added yet.</span>
                )}
              </p>
            </motion.section>

            {/* Skills */}
            <motion.section
              variants={fadeUp}
              whileHover={{ y: -3 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-shadow hover:shadow-[0_0_30px_-10px_rgba(34,211,238,0.35)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Skills</h2>
              </div>
              {skillList.length === 0 ? (
                <p className="text-white/40 italic">No skills added yet.</p>
              ) : (
                <motion.div variants={pillContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-wrap gap-2.5">
                  {skillList.map((skill, idx) => (
                    <motion.span
                      key={`${skill}-${idx}`}
                      variants={pillItem}
                      whileHover={{ scale: 1.08, y: -2 }}
                      className="rounded-full border border-white/10 bg-linear-to-r from-purple-500/10 to-cyan-500/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-md cursor-default hover:border-purple-400/40 hover:from-purple-500/20 hover:to-cyan-500/20 transition-colors"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </motion.section>

            {/* Statistics */}
            <motion.section variants={fadeUp} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-5">Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {STATS.map(({ key, label, icon: Icon, value }) => (
                  <motion.div
                    key={key}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-center transition-colors hover:border-white/20"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-purple-500/0 to-cyan-500/0 group-hover:from-purple-500/10 group-hover:to-cyan-500/10 transition-colors" />
                    <div className="relative">
                      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                        <Icon className="h-4 w-4 text-white/60" />
                      </div>
                      <p className="text-sm font-semibold bg-linear-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                        {value}
                      </p>
                      <p className="mt-1 text-xs text-white/40">{label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Recently Viewed Projects */}
            <motion.section variants={fadeUp} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <History className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Recently Viewed Projects</h2>
              </div>
              {recentlyViewed.length === 0 ? (
                <p className="text-white/40 italic">No recently viewed projects.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentlyViewed.map((project) => (
                    <motion.div
                      key={project._id}
                      whileHover={{ y: -4 }}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-white/20"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-white/5">
                        {project.thumbnail ? (
                          <img
                            src={project.thumbnail}
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/20">
                            <ImageOff className="h-6 w-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-white/90 truncate">{project.title}</h3>
                        {project.ownername && (
                          <p className="mt-0.5 text-xs text-white/40 truncate">by {project.ownername}</p>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => navigate(`/projects/${project._id}`)}
                          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-linear-to-r from-purple-500/15 to-cyan-500/15 px-3 py-2 text-xs font-medium text-white/80 hover:from-purple-500/25 hover:to-cyan-500/25 transition-colors"
                        >
                          Open Project
                          <ExternalLink className="h-3 w-3" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* ============== Side column ============== */}
          <div className="space-y-6">
            {/* Contact Information */}
            <motion.section
              variants={fadeUp}
              whileHover={{ y: -3 }}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-shadow hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.35)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Contact className="h-4 w-4 text-purple-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Contact Information</h2>
              </div>
              {!hasContactInfo ? (
                <p className="text-white/40 italic">No contact information added yet.</p>
              ) : (
                <div className="space-y-1">
                  {user?.email && (
                    <a href={`mailto:${user.email}`} className="block">
                      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 shrink-0">
                          <Mail className="h-4 w-4 text-white/60" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-white/40">Email</p>
                          <p className="text-sm text-white/85 truncate">{user.email}</p>
                        </div>
                      </div>
                    </a>
                  )}
                  {user?.username && (
                    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 shrink-0">
                        <AtSign className="h-4 w-4 text-white/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-white/40">Username</p>
                        <p className="text-sm text-white/85 truncate">@{user.username}</p>
                      </div>
                    </div>
                  )}
                  {user?.github && (
                    <a href={user.github} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 shrink-0">
                          <FaGithub className="h-4 w-4 text-white/60" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-white/40">GitHub</p>
                          <p className="text-sm text-white/85 truncate">{user.github}</p>
                        </div>
                      </div>
                    </a>
                  )}
                  {user?.linkedIn && (
                    <a href={normalizeUrl(user.linkedIn)} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 shrink-0">
                          <FaLinkedin className="h-4 w-4 text-white/60" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-white/40">LinkedIn</p>
                          <p className="text-sm text-white/85 truncate">{normalizeUrl(user.linkedIn)}</p>
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              )}
            </motion.section>

            {/* Profile Completion */}
            <motion.section variants={fadeUp} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="h-4 w-4 text-purple-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Profile Completion</h2>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {completionPercent}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10 mb-5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
                  className="h-full rounded-full bg-linear-to-r from-purple-500 to-cyan-400"
                />
              </div>
              <ul className="space-y-2">
                {completionItems.map(({ key, label, done }) => (
                  <li key={key} className="flex items-center gap-2.5 text-sm">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        done
                          ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
                          : "border-white/10 bg-white/5 text-white/30"
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </span>
                    <span className={done ? "text-white/80" : "text-white/40"}>{label}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Quick Actions */}
            <motion.section variants={fadeUp} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-4">Quick Actions</h2>
              <div className="flex flex-col gap-2.5">
                {QUICK_ACTIONS.map(({ key, label, icon: Icon, path }) => (
                  <motion.button
                    key={key}
                    onClick={() => navigate(path)}
                    whileHover={{ x: 4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/80 backdrop-blur-md transition-colors hover:border-purple-400/30 hover:bg-linear-to-r hover:from-purple-500/10 hover:to-cyan-500/10"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-purple-400/30 transition-colors shrink-0">
                      <Icon className="h-4 w-4 text-white/70 group-hover:text-purple-300 transition-colors" />
                    </div>
                    <span className="font-medium">{label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}