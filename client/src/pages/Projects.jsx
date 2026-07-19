import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  MessageCircle,
  ImageOff,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  FolderX,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import api from "../services/api"; // pre-configured axios instance

/* ===========================================================
   ANIMATION VARIANTS
   Reused across the page for consistent motion timing.
=========================================================== */

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
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
   STYLE CONSTANTS
   Difficulty badges get a distinct color per level; unknown
   or missing difficulty values fall back to a neutral style.
=========================================================== */

const DIFFICULTY_STYLES = {
  beginner: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  intermediate: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  advanced: "border-red-400/30 bg-red-500/10 text-red-300",
};

function difficultyClasses(difficulty) {
  const key = (difficulty || "").toLowerCase();
  return DIFFICULTY_STYLES[key] || "border-white/15 bg-white/5 text-white/60";
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "mostLikes", label: "Most Likes" },
  { value: "mostComments", label: "Most Comments" },
];

/* ===========================================================
   PURE HELPER FUNCTIONS
   No side effects — safe to call during render.
=========================================================== */

/** Project _id values are MongoDB ObjectIds, whose first 8 hex
 *  chars encode a timestamp — so we can sort by _id as a
 *  reliable "creation order" fallback when createdAt is absent. */
function getSortTimestamp(project) {
  if (project.createdAt) return new Date(project.createdAt).getTime();
  if (project._id && project._id.length >= 8) {
    return parseInt(project._id.substring(0, 8), 16) * 1000;
  }
  return 0;
}

function matchesSearch(project, query) {
  if (!query.trim()) return true;

  const q = query.trim().toLowerCase();

  const titleMatch =
    project.title?.toLowerCase().includes(q);

  const categoryMatch =
    project.category?.toLowerCase().includes(q);

  const difficultyMatch =
    project.difficulty?.toLowerCase().includes(q);

  const techMatch =
    Array.isArray(project.technologies)
      ? project.technologies.some((tech) =>
          tech.toLowerCase().includes(q)
        )
      : typeof project.technologies === "string"
      ? project.technologies.toLowerCase().includes(q)
      : false;

  const tagMatch =
    Array.isArray(project.tags)
      ? project.tags.some((tag) =>
          tag.toLowerCase().includes(q)
        )
      : typeof project.tags === "string"
      ? project.tags.toLowerCase().includes(q)
      : false;

  return (
    titleMatch ||
    categoryMatch ||
    difficultyMatch ||
    techMatch ||
    tagMatch
  );
}

/* ===========================================================
   MAIN COMPONENT
=========================================================== */

export default function Projects() {
  const navigate = useNavigate();

  /* ----------------------- Data + request state ----------------------- */
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error

  /* ----------------------- Search / filter / sort state ----------------------- */
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  /* ===========================================================
     FETCH PROJECTS
     Calls GET /projects (baseURL already includes /api/v1 in
     the shared axios instance) and normalizes the response.
  =========================================================== */

  const fetchProjects = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await api.get("/projects");
      const data = response.data?.data ?? [];
      console.log(data)
      setProjects(Array.isArray(data) ? data : []);
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /* ===========================================================
     DERIVED FILTER OPTIONS
     Category/difficulty dropdown options are derived from the
     actual fetched data rather than hardcoded, so they always
     match what the backend is really sending.
  =========================================================== */

  const categoryOptions = useMemo(() => {
    const unique = new Set(projects.map((p) => p.category).filter(Boolean));
    return Array.from(unique).sort();
  }, [projects]);

  const difficultyOptions = useMemo(() => {
    const unique = new Set(projects.map((p) => p.difficulty).filter(Boolean));
    return Array.from(unique).sort();
  }, [projects]);

  /* ===========================================================
     SEARCH + FILTER + SORT PIPELINE
     Runs entirely on the frontend against the already-fetched
     list — no extra network calls as the user types.
  =========================================================== */

  const visibleProjects = useMemo(() => {
    let result = projects.filter((project) => matchesSearch(project, searchQuery));

    if (categoryFilter !== "all") {
      result = result.filter((project) => project.category === categoryFilter);
    }
    if (difficultyFilter !== "all") {
      result = result.filter((project) => project.difficulty === difficultyFilter);
    }

    // Sort without mutating the filtered array in place.
    const sorted = [...result];
    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => getSortTimestamp(a) - getSortTimestamp(b));
        break;
      case "mostLikes":
        sorted.sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
        break;
      case "mostComments":
        sorted.sort((a, b) => (b.commentsCount ?? 0) - (a.commentsCount ?? 0));
        break;
      case "newest":
      default:
        sorted.sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a));
        break;
    }
    return sorted;
  }, [projects, searchQuery, categoryFilter, difficultyFilter, sortBy]);

  /* ===========================================================
     NAVIGATION
     View Project always goes to /project/:id (singular route),
     never /projects/:id.
  =========================================================== */

  const handleViewProject = useCallback(
    (projectId) => navigate(`/project/${projectId}`),
    [navigate]
  );

  /* ===========================================================
     SHARED STYLE CLASSES
  =========================================================== */

  const selectClasses =
    "rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 backdrop-blur-md outline-none appearance-none cursor-pointer transition-colors focus:border-purple-400/50 hover:bg-white/10";

  /* ===========================================================
     RENDER: SHIMMER SKELETON PIECE
     Used only while status === "loading".
  =========================================================== */

  const Shimmer = ({ className = "" }) => (
    <div className={`relative overflow-hidden rounded-xl bg-white/5 ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );

  const renderSkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <Shimmer className="aspect-video w-full rounded-none" />
          <div className="p-5 space-y-3">
            <Shimmer className="h-4 w-2/3" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-4/5" />
            <div className="flex gap-2 pt-1">
              <Shimmer className="h-6 w-16" />
              <Shimmer className="h-6 w-16" />
              <Shimmer className="h-6 w-16" />
            </div>
            <Shimmer className="h-9 w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );

  /* ===========================================================
     MAIN RENDER
  =========================================================== */

  return (
    <div className="min-h-screen bg-[#030712] px-4 py-10 sm:px-6 lg:px-10">
      <motion.div variants={pageVariants} initial="hidden" animate="show" className="mx-auto max-w-7xl">
        {/* ===========================================================
            PAGE HEADER
        =========================================================== */}
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Explore Projects</h1>
          <p className="mt-1 text-sm text-white/50">
            Discover what the ProjectSphere community has been building.
          </p>
        </motion.div>

        {/* ===========================================================
            SEARCH BAR + FILTERS + SORT
            All filtering/sorting happens client-side against the
            list already fetched in `projects`.
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
              placeholder="Search by title, category, or technology..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white/90 placeholder:text-white/25 outline-none backdrop-blur-md transition-colors focus:border-purple-400/50 focus:bg-white/[0.07]"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`${selectClasses} pl-9`}
            >
              <option value="all" className="bg-[#0a0f1c]">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0a0f1c]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty filter */}
          <div className="relative">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className={selectClasses}
            >
              <option value="all" className="bg-[#0a0f1c]">All Difficulties</option>
              {difficultyOptions.map((diff) => (
                <option key={diff} value={diff} className="bg-[#0a0f1c]">
                  {diff}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
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
        =========================================================== */}
        {status === "loading" && renderSkeletonGrid()}

        {/* ===========================================================
            ERROR STATE
        =========================================================== */}
        {status === "error" && (
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-20 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white/90">Unable to load projects.</h3>
            <p className="mt-1.5 text-sm text-white/50">Something went wrong. Please try again.</p>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchProjects}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </motion.button>
          </motion.div>
        )}

        {/* ===========================================================
            EMPTY STATE
            Shown when the fetch succeeded but the search/filter
            combination matches nothing (including a genuinely
            empty project list).
        =========================================================== */}
        {status === "success" && visibleProjects.length === 0 && (
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-20 text-center"
          >
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500/30 to-cyan-400/30 blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <FolderX className="h-7 w-7 text-white/50" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white/90">No projects found</h3>
            <p className="mt-1.5 max-w-sm text-sm text-white/50">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </motion.div>
        )}

        {/* ===========================================================
            PROJECT GRID
            3 columns desktop / 2 tablet / 1 mobile.
        =========================================================== */}
        {status === "success" && visibleProjects.length > 0 && (
          <motion.div
            variants={gridStagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {visibleProjects.map((project) => {
                // Technologies chips: show up to 3, then a "+X more" pill.
                const technologies = Array.isArray(project.technologies) ? project.technologies : [];
                const visibleTechs = technologies.slice(0, 3);
                const extraTechCount = technologies.length - visibleTechs.length;

                // Thumbnail lives at project.thumbnail.url, not project.thumbnail.
                const thumbnailUrl = project.thumbnail?.url;
                const ownerAvatar = project.ownerid?.avatar;

                return (
                  <motion.div
                    key={project._id}
                    layout
                    variants={cardVariant}
                    whileHover={{ y: -6 }}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/30 hover:shadow-[0_0_40px_-12px_rgba(168,85,247,0.4)]"
                  >
                    {/* linear border glow on hover */}
                    <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-br from-purple-500/10 via-transparent to-cyan-500/10" />

                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-white/5">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/20">
                          <ImageOff className="h-8 w-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Category badge, top-left over the thumbnail */}
                      {project.category && (
                        <span className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md">
                          {project.category}
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="relative flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-white/95 line-clamp-1">{project.title}</h3>
                        {project.difficulty && (
                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium capitalize ${difficultyClasses(
                              project.difficulty
                            )}`}
                          >
                            {project.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Description truncated after 2 lines via line-clamp-2 */}
                      <p className="mt-2 text-sm text-white/50 line-clamp-2 leading-relaxed">
                        {project.description || "No description provided."}
                      </p>

                      {/* Technology chips — max 3, then "+X more" */}
                      {visibleTechs.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {visibleTechs.map((tech, idx) => (
                            <span
                              key={`${tech}-${idx}`}
                              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/60"
                            >
                              {tech}
                            </span>
                          ))}
                          {extraTechCount > 0 && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/40">
                              +{extraTechCount} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Owner avatar + likes + comments */}
                      <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
                        <div className="flex items-center gap-1.5">
                          {ownerAvatar ? (
                            <img
                              src={ownerAvatar}
                              alt="Project owner"
                              className="h-5 w-5 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-white/10 border border-white/10" />
                          )}
                        </div>
                        <span className="flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5" />
                          {project.likesCount ?? 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {project.commentsCount ?? 0}
                        </span>
                      </div>

                      {/* View Project button — navigates to /project/:id */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleViewProject(project._id)}
                        className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-purple-500/20 to-cyan-500/20 border border-white/10 px-3 py-2.5 text-xs font-medium text-white/85 hover:from-purple-500/30 hover:to-cyan-500/30 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Project
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}