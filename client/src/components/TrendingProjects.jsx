// ============================================================================
// TrendingProjectsSection.jsx
// ProjectSphere — Trending projects showcase
//
// Fetches live trending projects from the backend and renders them as
// glassmorphic cards with thumbnail, creator info, engagement metrics and
// a "View Project" CTA. Matches the visual language of HeroSection,
// StatsSection and FeaturesSection.
// ============================================================================

// Import required dependencies
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  User,
} from "lucide-react";

// Existing configured axios instance
import api from "../services/api.js";

// ----------------------------------------------------------------------------
// formatNumber helper
// Converts raw counts into compact, readable strings:
//   9500    -> "9.5K"
//   150000  -> "150K"
//   1200000 -> "1.2M"
// ----------------------------------------------------------------------------
function formatNumber(num = 0) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return String(num);
}

// ----------------------------------------------------------------------------
// Animation variants
// ----------------------------------------------------------------------------

// Parent grid — staggers each card's entrance
const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Individual card — fade up on scroll
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ----------------------------------------------------------------------------
// TrendingProjectCard
// Renders a single trending project. Kept inside this file per requirements.
// ----------------------------------------------------------------------------
function TrendingProjectCard({ project }) {
  // Pull nested owner fields safely (owner data comes from `ownerid`)
  const ownerName = project?.ownerid?.fullName || "Unknown Developer";
  const ownerAvatar = project?.ownerid?.avatar;
  const navigate = useNavigate();

  return (
    <motion.div
      variants={cardVariants}
      // Hover lift effect
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl overflow-hidden"
    >
      {/* Border glow that brightens on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/0 group-hover:ring-white/20 transition-all duration-500 z-20"
      />

      {/* ---------------- Thumbnail ---------------- */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={project.thumbnail?.url ||
            "https://placehold.co/600x400?text=No+Thumbnail"
          }
          alt={project.title}
          // Slight zoom-in on hover, applied to the image itself
          className="h-full w-full object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-110"
        />

        {/* Dark gradient overlay so the trending badge stays legible */}
        <div className="absolute inset-0 bg-linear-to-t from-[#030712]/60 via-transparent to-transparent" />

        {/* Trending badge — top right corner */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-medium rounded-full border border-orange-500/30 bg-orange-500/20 text-orange-300 px-2.5 py-1">
          🔥 Trending
        </span>
      </div>

      {/* ---------------- Card body ---------------- */}
      <div className="flex flex-col flex-1 p-5">
        {/* Project title, clamped to 2 lines max */}
        <h3 className="text-base font-semibold text-white leading-snug line-clamp-2 min-h-11">
          {project.title}
        </h3>

        {/* Creator info */}
        <div className="flex items-center gap-2 mt-3">
          {ownerAvatar ? (
            <img
              src={ownerAvatar}
              alt={ownerName}
              className="h-8 w-8 rounded-full object-cover border border-white/10"
            />
          ) : (
            // Fallback avatar if no image is provided
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          )}
          <span className="text-sm text-slate-400">👤 {ownerName}</span>
        </div>

        {/* Metrics row: likes, comments, views */}
        <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-pink-400" />
            {formatNumber(project.likesCount)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
            {formatNumber(project.commentsCount)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-emerald-400" />
            {formatNumber(project.views)}
          </span>
        </div>

        {/* View Project button — pinned to bottom via mt-auto */}
        <button
          onClick={() => navigate(`/project/${project._id}`)}
          className="group/btn mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 transition-transform duration-300 hover:scale-[1.03]"
        >
          View Project
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// SkeletonCard
// Placeholder card shown while trending projects are being fetched.
// ----------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl overflow-hidden animate-pulse">
      {/* Thumbnail placeholder */}
      <div className="aspect-video w-full bg-white/10" />
      <div className="p-5">
        <div className="h-4 w-4/5 rounded-md bg-white/10 mb-2" />
        <div className="h-4 w-3/5 rounded-md bg-white/10 mb-4" />
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-full bg-white/10" />
          <div className="h-3 w-24 rounded-md bg-white/10" />
        </div>
        <div className="h-3 w-full rounded-md bg-white/5 mb-4" />
        <div className="h-9 w-full rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main TrendingProjectsSection component
// ----------------------------------------------------------------------------
function TrendingProjectsSection() {
  // Stores the array of trending projects returned by the API
  const [projects, setProjects] = useState([]);

  // True while the request is in flight
  const [loading, setLoading] = useState(true);

  // True if the request failed — drives the error UI + retry button
  const [error, setError] = useState(false);

  // Fetches trending projects from the backend.
  // Wrapped in useCallback so it can be safely reused by the retry button.
  const fetchTrendingProjects = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await api.get("/analytics/trendingProjects");

      // Support either `{ data: [...] }` or `{ data: { data: [...] } }`
      // shaped responses, depending on backend wrapper conventions.
      const list = response?.data?.data ?? response?.data ?? [];
      setProjects(list);
    } catch (err) {
      console.error("Failed to fetch trending projects:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trending projects when the component mounts
  useEffect(() => {
    fetchTrendingProjects();
  }, [fetchTrendingProjects]);

  return (
    <section className="relative w-full overflow-hidden bg-[#030712] text-white py-24 sm:py-28">
      {/* ---------------- Background effects ---------------- */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {/* Purple glow blob */}
        <div className="absolute top-0 left-1/4 h-100 w-100 rounded-full bg-purple-600/20 blur-3xl" />
        {/* Blue glow blob */}
        <div className="absolute bottom-0 right-1/4 h-100 w-100 rounded-full bg-blue-600/20 blur-3xl" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        {/* ---------------- Section header ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 backdrop-blur px-4 py-1.5 mb-6">
            <TrendingUp className="h-3.5 w-3.5 text-purple-300" />
            <span className="text-xs font-medium tracking-wide text-slate-300">
              TRENDING PROJECTS
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white via-white to-slate-400">
            Projects Everyone Is Talking About
          </h2>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed">
            Discover the most loved and engaging projects from the
            ProjectSphere community.
          </p>
        </motion.div>

        {/* ---------------- Error state ---------------- */}
        {/* Shown only if the request failed and we're no longer loading */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-slate-300 font-medium">
              Unable to load trending projects.
            </p>
            {/* Retry re-triggers the fetch */}
            <button
              onClick={fetchTrendingProjects}
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 hover:scale-[1.03] transition-transform duration-300"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        {/* ---------------- Loading state ---------------- */}
        {/* 5 skeleton cards shown while the request is in flight */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ---------------- Success state ---------------- */}
        {/* Renders once projects have loaded successfully */}
        {!loading && !error && (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
          >
            {projects.map((project) => (
              <TrendingProjectCard key={project.slug} project={project} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// Export component
export default TrendingProjectsSection;