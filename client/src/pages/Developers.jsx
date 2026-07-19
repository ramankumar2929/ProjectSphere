import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
 
import {
  Search,
  Users,
  Rocket,
  AlertTriangle,
  RotateCcw,
  UserCircle,
  ArrowUpDown,
} from "lucide-react";
import api from "../services/api"; // pre-configured axios instance

/* ===========================================================
   ANIMATION VARIANTS
   Shared timing/easing so this page feels like the same app
   as Projects.jsx.
=========================================================== */

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const gridStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* ===========================================================
   CONSTANTS
=========================================================== */

const SORT_OPTIONS = [
  { value: "az", label: "A-Z" },
  { value: "za", label: "Z-A" },
  { value: "mostProjects", label: "Most Projects" },
  { value: "leastProjects", label: "Least Projects" },
];

const SKELETON_COUNT = 8;

/* ===========================================================
   PURE HELPER FUNCTIONS
   No side effects — safe to call during render.
=========================================================== */

/** Case-insensitive check across fullname, username, and bio. */
function matchesSearch(developer, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();

  const nameMatch = developer.fullName?.toLowerCase().includes(q);
  const usernameMatch = developer.username?.toLowerCase().includes(q);
  const bioMatch = developer.bio?.toLowerCase().includes(q);

  return nameMatch || usernameMatch || bioMatch;
}

/** Applies the selected sort order without mutating the source array. */
function sortDevelopers(developers, sortBy) {
  const sorted = [...developers];
  switch (sortBy) {
    case "za":
      sorted.sort((a, b) => (b.fullName || "").localeCompare(a.fullName || ""));
      break;
    case "mostProjects":
      sorted.sort((a, b) => (b.projectCount ?? 0) - (a.projectCount ?? 0));
      break;
    case "leastProjects":
      sorted.sort((a, b) => (a.projectCount ?? 0) - (b.projectCount ?? 0));
      break;
    case "az":
    default:
      sorted.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
      break;
  }
  return sorted;
}

/* ===========================================================
   SHIMMER SKELETON PIECE
   Small presentational helper used only in the loading state.
=========================================================== */

function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-white/5 ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/* ===========================================================
   MAIN COMPONENT
=========================================================== */

export default function Developers() {
 

  /* ----------------------- Data + request state ----------------------- */
  const [developers, setDevelopers] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error

  /* ----------------------- Search / sort state ----------------------- */
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("az");

  /* ===========================================================
     FETCH DEVELOPERS
     Calls GET /users/allusers and normalizes the response.
  =========================================================== */

  const fetchDevelopers = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await api.get("/users/allusers");
      const data = response.data?.data ?? [];
      setDevelopers(Array.isArray(data) ? data : []);
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchDevelopers();
  }, [fetchDevelopers]);

  /* ===========================================================
     SEARCH + SORT PIPELINE
     Runs entirely on the frontend against the already-fetched
     list — no extra network calls as the user types.
  =========================================================== */

  const visibleDevelopers = useMemo(() => {
    const filtered = developers.filter((dev) => matchesSearch(dev, searchQuery));
    return sortDevelopers(filtered, sortBy);
  }, [developers, searchQuery, sortBy]);

  
   

  /* ===========================================================
     SHARED STYLE CLASSES
  =========================================================== */

  const selectClasses =
    "rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 backdrop-blur-md outline-none appearance-none cursor-pointer transition-colors focus:border-purple-400/50 hover:bg-white/10";

  /* ===========================================================
     MAIN RENDER
  =========================================================== */

  return (
    <div className="min-h-screen bg-[#030712] px-4 py-10 sm:px-6 lg:px-10">
      <motion.div variants={pageVariants} initial="hidden" animate="show" className="mx-auto max-w-7xl">
        {/* ===========================================================
            HERO SECTION
            Glowing linear blobs behind the heading, animated in
            on page load.
        =========================================================== */}
        <motion.div variants={fadeUp} className="relative mb-10 overflow-hidden rounded-3xl px-4 py-14 text-center sm:py-16">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-600/25 blur-[100px]" />
          <div className="pointer-events-none absolute right-1/4 bottom-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-[100px]" />

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
          >
            Meet{" "}
            <span className="bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Developers
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative mx-auto mt-4 max-w-xl text-sm sm:text-base text-white/50"
          >
            Discover talented developers, explore their profiles, and connect with builders from the
            ProjectSphere community.
          </motion.p>
        </motion.div>

        {/* ===========================================================
            SEARCH + SORT BAR
        =========================================================== */}
        <motion.div
          variants={fadeUp}
          className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-5 lg:flex-row lg:items-center"
        >
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username, or bio..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white/90 placeholder:text-white/25 outline-none backdrop-blur-md transition-colors focus:border-purple-400/50 focus:bg-white/[0.07]"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`${selectClasses} pl-9`}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a0f1c]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* ===========================================================
            LOADING STATE
            At least 8 shimmering skeleton cards.
        =========================================================== */}
        {status === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col items-center"
              >
                <Shimmer className="h-20 w-20 rounded-full mb-4" />
                <Shimmer className="h-4 w-32 mb-2" />
                <Shimmer className="h-3 w-20 mb-4" />
                <Shimmer className="h-3 w-full mb-1.5" />
                <Shimmer className="h-3 w-4/5 mb-4" />
                <Shimmer className="h-6 w-28 rounded-full mb-4" />
                <Shimmer className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* ===========================================================
            ERROR STATE
        =========================================================== */}
        {status === "error" && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-20 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white/90">Unable to load developers.</h3>
            <p className="mt-1.5 text-sm text-white/50">Something went wrong. Please try again.</p>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchDevelopers}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </motion.button>
          </motion.div>
        )}

        {/* ===========================================================
            EMPTY STATE
            Fetch succeeded but search matched nothing (including a
            genuinely empty developer list).
        =========================================================== */}
        {status === "success" && visibleDevelopers.length === 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-20 text-center"
          >
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500/30 to-cyan-400/30 blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Users className="h-7 w-7 text-white/50" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white/90">No Developers Found</h3>
            <p className="mt-1.5 text-sm text-white/50">Try changing your search.</p>
          </motion.div>
        )}

        {/* ===========================================================
            DEVELOPER GRID
            4 columns desktop / 2 tablet / 1 mobile.
        =========================================================== */}
        {status === "success" && visibleDevelopers.length > 0 && (
          <motion.div
            variants={gridStagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {visibleDevelopers.map((developer) => (
                <motion.div
                  key={developer._id}
                  layout
                  variants={cardVariant}
                  whileHover={{ y: -6 }}
                  className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center transition-all duration-300 hover:border-purple-400/30 hover:shadow-[0_0_40px_-12px_rgba(168,85,247,0.4)]"
                >
                  {/* linear glow on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-br from-purple-500/10 via-transparent to-cyan-500/10" />

                  {/* Avatar */}
                  <motion.div whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 250, damping: 15 }} className="relative">
                    <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500 to-cyan-400 blur-md opacity-50" />
                    {developer.avatar ? (
                      <img
                        src={developer.avatar}
                        alt={developer.fullName || "Developer avatar"}
                        className="relative h-20 w-20 rounded-full object-cover border-2 border-white/20"
                      />
                    ) : (
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/20 bg-white/10">
                        <UserCircle className="h-10 w-10 text-white/40" />
                      </div>
                    )}
                  </motion.div>

                  {/* Name + username */}
                  <h3 className="relative mt-4 text-base font-bold text-white/95 truncate max-w-full">
                    {developer.fullName || "Unnamed Developer"}
                  </h3>
                  <p className="relative text-xs text-white/40">@{developer.username}</p>

                  {/* Bio, clamped to 2 lines */}
                  <p className="relative mt-3 text-sm text-white/50 leading-relaxed line-clamp-2 min-h-10">
                    {developer.bio && developer.bio.trim().length > 0 ? developer.bio : "No bio added yet."}
                  </p>

                  {/* Project count badge */}
                  <span className="relative mt-6 mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-linear-to-r from-purple-500/20 to-cyan-500/20 px-3.5 py-1.5 text-xs font-medium text-white/85">
                    <Rocket className="h-3.5 w-3.5" />
                    {developer.projectCount ?? 0} Projects
                  </span>

                   
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}