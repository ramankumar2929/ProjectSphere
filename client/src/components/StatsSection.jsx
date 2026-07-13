// ============================================================================
// StatsSection.jsx
// ProjectSphere — Platform statistics section
//
// Fetches live platform stats from the backend and renders them as animated,
// glassmorphic stat cards. Includes loading (skeleton) and error (retry) states.
// ============================================================================

// Import required dependencies
import React, { useEffect, useState, useCallback } from "react";
import { motion, animate } from "framer-motion";
import {
  Users,
  FolderGit2,
  Heart,
  MessageCircle,
  Bookmark,
  Layers3,
  Eye,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

// Import your existing configured axios instance.
// Adjust this path so it points to wherever `api` is set up in your project.
import api from "../services/api.js";

// ----------------------------------------------------------------------------
// Animation variants (used for fade-in + slide-up + stagger on the grid)
// ----------------------------------------------------------------------------
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      // Each child card animates slightly after the previous one (stagger)
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ----------------------------------------------------------------------------
// AnimatedNumber
// Small helper component that counts up from 0 to `value` whenever it
// mounts / becomes visible. Keeps StatCard easy to read.
// ----------------------------------------------------------------------------
function AnimatedNumber({ value = 0, duration = 1.4 }) {
  // We store the number currently being displayed in state
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // `animate` (from framer-motion) smoothly interpolates a number over time
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    // Clean up the animation if the component unmounts mid-count
    return () => controls.stop();
  }, [value, duration]);

  // Format large numbers with commas (e.g. 254000 -> 254,000)
  return <span>{display.toLocaleString("en-US")}</span>;
}

// ----------------------------------------------------------------------------
// Reusable statistics card component
// Props:
//   icon  -> Lucide icon component to render
//   title -> label shown under the number (e.g. "Developers")
//   value -> the numeric stat value from the API
//   color -> linear classes used for the icon glow / accent
//   delay -> stagger delay passed down from the parent (optional, framer
//            motion also handles stagger via the parent container)
// ----------------------------------------------------------------------------
function StatCard({ icon: Icon, title, value, color, delay = 0 }) {
  return (
    <motion.div
      variants={cardVariants}
      // Hover lift + glow effect
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-6 overflow-hidden"
    >
      {/* Soft glow that intensifies on hover (border glow effect) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br ${color} blur-xl`}
        style={{ opacity: 0.15 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ring-1 ring-white/20"
      />

      <div className="relative z-10">
        {/* Icon with glowing circular background */}
        <div
          className={`h-12 w-12 rounded-xl bg-linear-to-br ${color} flex items-center justify-center shadow-lg mb-5 transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>

        {/* Large animated number */}
        <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          <AnimatedNumber value={value} />
          <span className="text-purple-300">+</span>
        </p>

        {/* Label */}
        <p className="mt-1.5 text-sm text-slate-400">{title}</p>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// Skeleton card — shown in place of a StatCard while data is loading
// ----------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl p-6 animate-pulse">
      <div className="h-12 w-12 rounded-xl bg-white/10 mb-5" />
      <div className="h-8 w-24 rounded-md bg-white/10 mb-3" />
      <div className="h-4 w-20 rounded-md bg-white/5" />
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main StatsSection component
// ----------------------------------------------------------------------------
function StatsSection() {
  // State for storing API response data (defaults to null until loaded)
  const [stats, setStats] = useState(null);

  // Loading state while waiting for backend response
  const [loading, setLoading] = useState(true);

  // Error handling state — stores whether the request failed
  const [error, setError] = useState(false);

  // Fetch platform statistics from the backend
  const fetchStats = useCallback(async () => {
    // Reset states before each attempt (important for the retry button)
    setLoading(true);
    setError(false);

    try {
      const response = await api.get("/analytics/platformStats");

      // Backend wraps the actual stats inside `data.data`
      setStats(response.data.data);
    } catch (err) {
      // Any network / server error lands here
      console.error("Failed to fetch platform stats:", err);
      setError(true);
    } finally {
      // Whether it succeeded or failed, we're done loading
      setLoading(false);
    }
  }, []);

  // Fetch platform statistics when component mounts
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Config describing each card: which field to read from the API response,
  // which icon to use and which linear accent to apply.
  const statConfig = stats
    ? [
        {
          key: "totalUsers",
          title: "Developers",
          icon: Users,
          color: "from-purple-500 to-fuchsia-500",
        },
        {
          key: "totalProjects",
          title: "Projects",
          icon: FolderGit2,
          color: "from-blue-500 to-indigo-500",
        },
        {
          key: "totalLikes",
          title: "Likes",
          icon: Heart,
          color: "from-pink-500 to-rose-500",
        },
        {
          key: "totalComments",
          title: "Comments",
          icon: MessageCircle,
          color: "from-cyan-500 to-blue-500",
        },
        {
          key: "totalBookmarks",
          title: "Bookmarks",
          icon: Bookmark,
          color: "from-amber-500 to-orange-500",
        },
        {
          key: "totalCollections",
          title: "Collections",
          icon: Layers3,
          color: "from-violet-500 to-purple-500",
        },
        {
          key: "totalViews",
          title: "Views",
          icon: Eye,
          color: "from-emerald-500 to-teal-500",
        },
      ]
    : [];

  return (
    <section className="relative w-full overflow-hidden bg-[#030712] text-white py-24 sm:py-28">
      {/* Background glow blobs — purely decorative */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-95 w-95 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-95 w-95 rounded-full bg-blue-600/20 blur-3xl" />
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
            <Sparkles className="h-3.5 w-3.5 text-purple-300" />
            <span className="text-xs font-medium tracking-wide text-slate-300">
              PLATFORM STATISTICS
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white via-white to-slate-400">
            Powering Thousands of Builders
          </h2>

          {/* Description */}
          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed">
            Join a growing community of developers showcasing projects,
            building portfolios and collaborating on innovative ideas.
          </p>
        </motion.div>

        {/* ---------------- Error state ---------------- */}
        {/* Shown only if the API call failed and we are not currently loading */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-slate-300 font-medium">
              Unable to load platform statistics.
            </p>
            {/* Retry button re-triggers fetchStats */}
            <button
              onClick={fetchStats}
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 hover:scale-[1.03] transition-transform duration-300"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        {/* ---------------- Loading state ---------------- */}
        {/* Render skeleton loaders during API request */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ---------------- Success state ---------------- */}
        {/* Render statistics cards using backend data */}
        {!loading && !error && stats && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {statConfig.map((stat, index) => (
              <StatCard
                key={stat.key}
                icon={stat.icon}
                title={stat.title}
                value={stats[stat.key] ?? 0}
                color={stat.color}
                delay={index * 0.1}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// Export component
export default StatsSection;