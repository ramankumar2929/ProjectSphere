import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Heart,
  MessageCircle,
  ImageOff,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  FolderX,
  Flame,
} from "lucide-react";
import api from "../services/api"; // pre-configured axios instance

/* ===========================================================
   CONSTANTS
=========================================================== */

const TOP_PROJECTS_COUNT = 5;
const SKELETON_COUNT = 5;

const DIFFICULTY_STYLES = {
  beginner: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  intermediate: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  advanced: "border-red-400/30 bg-red-500/10 text-red-300",
};

/* ===========================================================
   ANIMATION VARIANTS
   Matches the timing/easing used across Projects.jsx.
=========================================================== */

const sectionVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const rowStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* ===========================================================
   PURE HELPER FUNCTIONS
   No side effects — safe to call during render.
=========================================================== */

function difficultyClasses(difficulty) {
  const key = (difficulty || "").toLowerCase();
  return DIFFICULTY_STYLES[key] || "border-white/15 bg-white/5 text-white/60";
}

/** Sorts by views (descending) and returns only the top N — never mutates the source array. */
function getTopViewedProjects(projects, count) {
  return [...projects].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, count);
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

export default function MostViewedProjects() {
  const navigate = useNavigate();

  /* ----------------------- Data + request state ----------------------- */
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error

  /* ===========================================================
     FETCH PROJECTS
     Calls GET /projects and normalizes the response.
     No backend changes — sorting/slicing happens entirely
     on the frontend.
  =========================================================== */

  const fetchProjects = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await api.get("/projects");
      const data = response.data?.data ?? [];
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
     TOP 5 MOST VIEWED
     Sorted by views (descending), top N only.
  =========================================================== */

  const topProjects = useMemo(
    () => getTopViewedProjects(projects, TOP_PROJECTS_COUNT),
    [projects]
  );

  /* ===========================================================
     NAVIGATION
  =========================================================== */

  const handleViewProject = useCallback(
    (projectId) => navigate(`/project/${projectId}`),
    [navigate]
  );

  /* ===========================================================
     MAIN RENDER
  =========================================================== */

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="px-4 py-10 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        {/* ===========================================================
            SECTION HEADER
        =========================================================== */}
        <motion.div variants={fadeUp} className="mb-8">
          <h2 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-white">
            <Flame className="h-6 w-6 text-orange-400" />
            Most Viewed Projects
          </h2>
          <p className="mt-1.5 text-sm text-white/50">
            Discover what everyone is exploring on ProjectSphere.
          </p>
        </motion.div>

        {/* ===========================================================
            LOADING STATE — 5 shimmering skeleton cards
        =========================================================== */}
        {status === "loading" && (
          <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="w-[85vw] sm:w-[46%] lg:w-[19%] shrink-0 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
              >
                <Shimmer className="aspect-video w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Shimmer className="h-4 w-2/3" />
                  <Shimmer className="h-3 w-full" />
                  <Shimmer className="h-3 w-4/5" />
                  <div className="flex gap-2 pt-1">
                    <Shimmer className="h-6 w-14" />
                    <Shimmer className="h-6 w-14" />
                  </div>
                  <Shimmer className="h-9 w-full mt-2" />
                </div>
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
            className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-16 text-center"
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
        =========================================================== */}
        {status === "success" && topProjects.length === 0 && (
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-16 text-center"
          >
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500/30 to-cyan-400/30 blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <FolderX className="h-7 w-7 text-white/50" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white/90">No projects available.</h3>
          </motion.div>
        )}

        {/* ===========================================================
            HORIZONTAL SCROLLING ROW
            5 cards desktop, 2 tablet-visible, 1 mobile-visible.
            Scrollbar hidden via the same utility classes used in
            the loading state above.
        =========================================================== */}
        {status === "success" && topProjects.length > 0 && (
          <motion.div
            variants={rowStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2  scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {topProjects.map((project) => {
              // Technologies chips: show up to 3.
              const technologies = Array.isArray(project.technologies) ? project.technologies : [];
              const visibleTechs = technologies.slice(0, 3);

              // Thumbnail may be a populated object ({ url }) or a plain string URL.
              const thumbnailUrl =
                typeof project.thumbnail === "string" ? project.thumbnail : project.thumbnail?.url;
              const ownerAvatar = project.ownerid?.avatar;

              return (
                <motion.div
                  key={project._id}
                  variants={cardVariant}
                  whileHover={{ y: -6 }}
                  className="group relative flex w-[85vw] sm:w-[46%] lg:w-[19%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/30 hover:shadow-[0_0_40px_-12px_rgba(168,85,247,0.4)]"
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

                    {/* Description truncated after 2 lines */}
                    <p className="mt-2 text-sm text-white/50 line-clamp-2 leading-relaxed">
                      {project.description || "No description provided."}
                    </p>

                    {/* Technology chips — max 3 */}
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
                      </div>
                    )}

                    {/* Owner avatar + views + likes + comments */}
                    <div className="mt-4 flex items-center gap-3 text-xs text-white/40">
                      {ownerAvatar ? (
                        <img
                          src={ownerAvatar}
                          alt="Project owner"
                          className="h-5 w-5 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-white/10 border border-white/10" />
                      )}
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        {project.views ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5" />
                        {project.likesCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {project.commentsCount ?? 0}
                      </span>
                    </div>

                    {/* View Project button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleViewProject(project._id)}
                      className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-purple-500/20 to-cyan-500/20 border border-white/10 px-3 py-2.5 text-xs font-medium text-white/85 transition-colors group-hover:from-purple-500/35 group-hover:to-cyan-500/35 group-hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Project
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}