// =====================================================================================
// ProjectDetailsPage.jsx
// -------------------------------------------------------------------------------------
// A premium, single-file "project details" page for ProjectSphere.
//
// WHAT THIS PAGE DOES (high level):
//   1. Reads the ":projectId" param from the URL (React Router).
//   2. Fetches the project from the backend using the existing `api` axios instance.
//   3. Renders a hero section, stats row, description, tech pills, tags, links,
//      a screenshots gallery (with a click-to-enlarge lightbox), documents,
//      team members, and a "creator" card.
//   4. Handles loading (skeleton UI) and error (retry UI) states gracefully.
//   5. Uses Framer Motion for tasteful, purposeful animation (not everywhere just
//      because — but in the places that make the page feel alive: hero fade/slide,
//      staggered lists, hover lift/scale, and image zoom).
//
// DESIGN DIRECTION (why it looks the way it looks):
//   - Base background: #030712 (near-black), matching the rest of ProjectSphere.
//   - Accent: a violet -> cyan gradient. Violet reads as "creative/tech" without
//     being the generic amber/terracotta AI-default, and pairing it with cyan gives
//     us a distinct two-color signature we reuse consistently (badges, glows, links,
//     progress-y accents) instead of scattering random colors around.
//   - Signature element: the hero uses a large blurred "aurora" glow behind the
//     thumbnail plus a glass panel overlapping the image — this is the one bold,
//     memorable moment. Everything else (cards, pills, sections) stays quiet,
//     consistent, and disciplined so the hero keeps its impact.
//   - Cards use glassmorphism (translucent + backdrop-blur + subtle border) rather
//     than flat solid panels, which reads as "premium product" (GitHub/Dribbble-ish)
//     rather than "generic dashboard".
//
// BACKEND CONTRACT THIS COMPONENT ASSUMES (per the prompt):
//   GET /api/v1/projects/:projectId  ->  ApiResponse wrapping a project object where:
//     - thumbnail   is an OBJECT: { url, public_id, resource_type }
//     - screenshots is an ARRAY of { url, public_id, resource_type }
//     - documents   is an ARRAY of { url, public_id, resource_type }
//     - ownerid     is POPULATED with at least { avatar, ... } (owner's display name
//                   is provided separately as `ownername` on the project itself)
//     - technologies may arrive as an array OR as a comma-separated string
//     - teamMembers may be an array of strings OR an array of objects
//     - liveDemo may be a real URL, an empty string, or the literal string
//       "will be available soon"
// =====================================================================================

import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import {
  Eye,
  Heart,
  MessageCircle,
  
  ExternalLink,
  Download,
  FileText,
  FileArchive,
  FileSpreadsheet,
  Users,
  Calendar,
  RefreshCw,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

// Your existing configured axios instance (baseURL, auth headers, etc. already set up).
import api from "../services/api";

// =====================================================================================
// SMALL HELPER FUNCTIONS
// (Kept local to this file since we are not allowed to create separate components.)
// =====================================================================================

/**
 * Formats an ISO date string into something human-friendly, e.g. "12 Jul 2026".
 * Falls back gracefully if the date is missing/invalid so the UI never crashes.
 */
function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * The backend sometimes sends `technologies` as a real array (["React", "Node.js"])
 * and sometimes as a single comma-separated string ("React, Node.js"). This
 * normalizes either shape into a clean array of trimmed, non-empty strings.
 */
function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Decides whether the "Live Demo" button should be active.
 * Treats empty strings and the literal placeholder text as "not ready yet".
 */
function isLiveDemoAvailable(liveDemo) {
  if (!liveDemo) return false;
  const normalized = liveDemo.trim().toLowerCase();
  if (normalized === "" || normalized === "will be available soon") return false;
  return true;
}

/**
 * Picks a reasonable icon for a document card based on its resource_type / url
 * extension. This is just a visual nicety — worst case it falls back to a
 * generic file icon.
 */
function getDocumentIcon(doc) {
  const url = (doc?.url || "").toLowerCase();
  if (url.endsWith(".zip") || url.endsWith(".rar") || url.endsWith(".7z")) {
    return FileArchive;
  }
  if (url.endsWith(".csv") || url.endsWith(".xlsx") || url.endsWith(".xls")) {
    return FileSpreadsheet;
  }
  return FileText;
}

/**
 * Turns a resource_type / URL into a friendly "label" like "PDF" or "ZIP".
 */
function getDocumentLabel(doc) {
  const url = doc?.url || "";
  const extMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  if (extMatch) return extMatch[1].toUpperCase();
  return (doc?.resource_type || "FILE").toUpperCase();
}

// =====================================================================================
// ANIMATION VARIANTS
// Centralized here so every section reuses the same fade/slide language instead of
// inventing new motion per section (consistency = feels intentional, not random).
// =====================================================================================

const fadeSlideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

export default function ProjectDetailsPage() {
  // Pull the dynamic :projectId segment out of the current URL.
  const { projectId } = useParams();

  // `project`  -> the fetched project object (null until loaded)
  // `isLoading`-> true while the request is in flight (drives the skeleton UI)
  // `error`    -> a human-readable error message (drives the error UI)
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lightbox state: which screenshot index is currently enlarged (null = closed).
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // -----------------------------------------------------------------------------------
  // FETCH LOGIC
  // Wrapped in useCallback so the exact same function can be reused by the
  // "Retry" button in the error state without duplicating code.
  // -----------------------------------------------------------------------------------
  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Matches the backend route: GET /api/v1/projects/:projectId
      const response = await api.get(`/projects/${projectId}`);

      // Backend wraps the payload in an ApiResponse: { statusCode, data, message }
      const projectData = response?.data?.data;

      if (!projectData) {
        throw new Error("Project data was empty in the server response.");
      }

      setProject(projectData);
    } catch (err) {
      // Try to surface the backend's own error message if present, otherwise
      // fall back to a generic one so the UI never shows "undefined".
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || "We couldn't load this project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Re-fetch whenever the projectId in the URL changes (e.g. navigating between
  // two different project detail pages without a full page reload).
  useEffect(() => {
    fetchProject();
    // Scroll to top on a fresh project load — feels intentional rather than jarring.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [fetchProject]);

  // -----------------------------------------------------------------------------------
  // LOADING STATE — Skeleton UI
  // -----------------------------------------------------------------------------------
  if (isLoading) {
    return <ProjectDetailsSkeleton />;
  }

  // -----------------------------------------------------------------------------------
  // ERROR STATE
  // -----------------------------------------------------------------------------------
  if (error || !project) {
    return (
      <div className="min-h-screen w-full bg-[#030712] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full text-center rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl p-10 shadow-2xl"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30">
            <AlertTriangle className="h-8 w-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            {error || "This project could not be found."}
          </p>
          <button
            onClick={fetchProject}
            className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
            Try again
          </button>
        </motion.div>
      </div>
    );
  }

  // -----------------------------------------------------------------------------------
  // DERIVED / NORMALIZED DATA
  // We do all the "defensive" data-shaping here, once, so the JSX below stays clean.
  // -----------------------------------------------------------------------------------
  const technologies = normalizeList(project.technologies);
  const tags = normalizeList(project.tags);
  const screenshots = Array.isArray(project.screenshots) ? project.screenshots : [];
  const documents = Array.isArray(project.documents) ? project.documents : [];
  const teamMembers = Array.isArray(project.teamMembers) ? project.teamMembers : [];
  const liveDemoReady = isLiveDemoAvailable(project.liveDemo);

  // The owner's avatar comes from the populated `ownerid` field.
  // `ownername` (the display name) lives directly on the project per the backend shape.
  const ownerAvatar = project?.ownerid?.avatar || null;
  const ownerName =
    project?.ownerid?.fullname ||
    project?.ownername ||
    "Unknown creator";

const ownerLinkedin = project?.ownerid?.linkedin;

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white selection:bg-violet-500/30">
      {/* =============================================================================
          HERO SECTION
          Large thumbnail with an ambient gradient glow behind it, plus a glass
          panel of metadata (title, badges, owner, dates) overlapping the bottom.
      ============================================================================= */}
      <section className="relative w-full overflow-hidden">
        {/* Ambient background glow — the "signature" visual moment of the page */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -top-40 left-1/4 h-128 w-lg rounded-full bg-violet-600/25 blur-[120px]" />
          <div className="absolute -top-20 right-1/4 h-112 w-md rounded-full bg-cyan-500/20 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-10 md:pt-16">
          {/* Large hero thumbnail */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeSlideUp}
            className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50"
          >
            <div className="aspect-16/8 w-full bg-gray-900">
              {project?.thumbnail?.url ? (
                <img
                  src={project.thumbnail.url}
                  alt={project.title || "Project thumbnail"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-600">
                  <Sparkles className="h-10 w-10" />
                </div>
              )}
            </div>
            {/* Fade at the bottom of the image so the overlapping glass panel reads cleanly */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#030712] to-transparent" />
          </motion.div>

          {/* Glass metadata panel — slightly overlaps the hero image bottom edge */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeSlideUp}
            transition={{ delay: 0.15 }}
            className="relative -mt-16 md:-mt-20 mx-2 md:mx-6 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-2xl p-6 md:p-8 shadow-xl"
          >
            {/* Badges row: category / difficulty / status */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {project.category && (
                <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1 text-xs font-medium text-violet-300">
                  {project.category}
                </span>
              )}
              {project.difficulty && (
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-medium text-amber-300">
                  {project.difficulty}
                </span>
              )}
              {project.status && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {project.status}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
              {project.title || "Untitled Project"}
            </h1>

            {/* Owner + dates row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                {ownerAvatar ? (
                  <img
                    src={ownerAvatar}
                    alt={ownerName}
                    className="h-6 w-6 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-linear-to-br from-violet-500 to-cyan-500" />
                )}
                <span className="text-gray-300">{ownerName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created {formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Updated {formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =============================================================================
          MAIN CONTENT
      ============================================================================= */}
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-14">
        {/* ===========================================================================
            STATISTICS ROW — views / likes / comments
        =========================================================================== */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { label: "Views", value: project.views ?? 0, icon: Eye, color: "from-blue-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/30" },
            { label: "Likes", value: project.likesCount ?? 0, icon: Heart, color: "from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/30" },
            { label: "Comments", value: project.commentsCount ?? 0, icon: MessageCircle, color: "from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30" },
          ].map((stat) => (
            <motion.div

              key={stat.label}
              variants={staggerItem}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl p-6 flex items-center gap-4 transition-shadow hover:shadow-lg hover:shadow-black/30"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br border ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">
                  {stat.value.toLocaleString?.() ?? stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* ===========================================================================
            DESCRIPTION
        =========================================================================== */}
        {project.description && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeSlideUp}
          >
            <SectionHeading title="About this project" />
            <div className="rounded-2xl border border-white/10 bg-white/2 p-6 md:p-8">
              {/* whitespace-pre-line preserves paragraph breaks from long descriptions */}
              <p className="text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">
                {project.description}
              </p>
            </div>
          </motion.section>
        )}

        {/* ===========================================================================
            TECHNOLOGIES
        =========================================================================== */}
        {technologies.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <SectionHeading title="Technologies used" />
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech, i) => (
                <motion.span
                  key={`${tech}-${i}`}
                  variants={staggerItem}
                  whileHover={{ scale: 1.06, y: -2 }}
                  className="rounded-full bg-linear-to-r from-violet-500/10 to-cyan-500/10 border border-white/10 px-4 py-1.5 text-sm text-gray-200 hover:border-violet-400/40 transition-colors cursor-default"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.section>
        )}

        {/* ===========================================================================
            TAGS
        =========================================================================== */}
        {tags.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <SectionHeading title="Tags" />
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <motion.span
                  key={`${tag}-${i}`}
                  variants={staggerItem}
                  whileHover={{ scale: 1.06 }}
                  className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </motion.section>
        )}

        {/* ===========================================================================
            PROJECT LINKS — GitHub + Live Demo
        =========================================================================== */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeSlideUp}
        >
          <SectionHeading title="Project links" />
          <div className="flex flex-wrap gap-3">
            {project.githubLink ? (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/4 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-white/8 hover:scale-[1.02] active:scale-[0.98]"
              >
                <FaGithub className="h-4 w-4" />
                View Repository
              </a>
            ) : null}

            {liveDemoReady ? (
              <a
                href={project.liveDemo}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <ExternalLink className="h-4 w-4" />
                Live Demo
              </a>
            ) : (
              // Disabled state — not clickable, visually muted
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/10 bg-white/2 px-5 py-3 text-sm font-medium text-gray-500"
              >
                <ExternalLink className="h-4 w-4" />
                Coming Soon
              </button>
            )}
          </div>
        </motion.section>

        {/* ===========================================================================
            SCREENSHOTS GALLERY
        =========================================================================== */}
        {screenshots.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <SectionHeading title="Screenshots" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {screenshots.map((screenshot, index) => (
                <motion.button
                  key={screenshot.public_id || index}
                  type="button"
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-gray-900 text-left"
                >
                  <img
                    src={screenshot.url}
                    alt={`Screenshot ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/30" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="rounded-full bg-black/60 backdrop-blur px-3 py-1.5 text-xs text-white">
                      Click to enlarge
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* ===========================================================================
            DOCUMENTS
        =========================================================================== */}
        {documents.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <SectionHeading title="Documents" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc, index) => {
                const DocIcon = getDocumentIcon(doc);
                return (
                  <motion.a
                    key={doc.public_id || index}
                    variants={staggerItem}
                    whileHover={{ y: -3, scale: 1.01 }}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/3 p-4 transition-colors hover:border-violet-400/40 hover:bg-white/5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/20 to-cyan-500/20 border border-white/10">
                      <DocIcon className="h-5 w-5 text-violet-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {getDocumentLabel(doc)} document
                      </p>
                      <p className="text-xs text-gray-500">Tap to download</p>
                    </div>
                    <Download className="h-4 w-4 text-gray-500 shrink-0" />
                  </motion.a>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ===========================================================================
            TEAM MEMBERS
        =========================================================================== */}
        {teamMembers.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <SectionHeading title="Team" icon={Users} />
            <div className="flex flex-wrap gap-3">
              {teamMembers.map((member, index) => {
                // teamMembers can be plain strings OR objects — handle both safely.
                const isObject = typeof member === "object" && member !== null;
                const name = isObject
                  ? member.name || member.username || "Team member"
                  : String(member);
                const role = isObject ? member.role : null;
                const avatar = isObject ? member.avatar : null;

                return (
                  <motion.div
                    key={index}
                    variants={staggerItem}
                    whileHover={{ y: -3 }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-3"
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="h-8 w-8 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-cyan-500 text-xs font-semibold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-white leading-tight">{name}</p>
                      {role && <p className="text-xs text-gray-500 leading-tight">{role}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ===========================================================================
            CREATOR SECTION
        =========================================================================== */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeSlideUp}
        >
          <SectionHeading title="Created by" />
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-linear-to-br from-violet-500/6 to-cyan-500/6 p-6">
            {ownerAvatar ? (
              <img
                src={ownerAvatar}
                alt={ownerName}
                className="h-14 w-14 rounded-full object-cover border-2 border-white/10"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-cyan-500 text-lg font-semibold">
                {ownerName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-semibold">{ownerName}</p>
              <p className="text-sm text-gray-500">Project creator</p>
            </div>
          </div>
        </motion.section>
      </main>

      {/* =============================================================================
          LIGHTBOX MODAL — screenshot enlarger with prev/next navigation
      ============================================================================= */}
      <AnimatePresence>
        {lightboxIndex !== null && screenshots[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Previous button */}
            {screenshots.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
                }}
                className="absolute left-4 md:left-8 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Enlarged image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              src={screenshots[lightboxIndex].url}
              alt={`Screenshot ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            />

            {/* Next button */}
            {screenshots.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev + 1) % screenshots.length);
                }}
                className="absolute right-4 md:right-8 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                aria-label="Next screenshot"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Counter */}
            {screenshots.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                {lightboxIndex + 1} / {screenshots.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================================================
// SectionHeading
// A tiny reusable heading used before every content section. Kept as a plain
// function (not a separate file/component export) — still lives inside this
// single .jsx file per the requirements, just factored out for readability.
// =====================================================================================
function SectionHeading({ title, icon: Icon }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-violet-400" />}
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {/* Small gradient underline accent — reinforces the violet/cyan signature */}
      <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent ml-2" />
    </div>
  );
}

// =====================================================================================
// ProjectDetailsSkeleton
// Beautiful loading state shown while the initial fetch is in flight.
// Mirrors the real layout's proportions so the page doesn't "jump" once data loads.
// =====================================================================================
function ProjectDetailsSkeleton() {
  // Small helper to keep the shimmer classes consistent everywhere below.
  const shimmer =
    "animate-pulse bg-linear-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%]";

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white">
      <div className="mx-auto max-w-6xl px-6 pt-10 md:pt-16">
        {/* Hero image skeleton */}
        <div className={`aspect-16/8 w-full rounded-3xl ${shimmer}`} />

        {/* Glass panel skeleton */}
        <div className="relative -mt-16 md:-mt-20 mx-2 md:mx-6 rounded-2xl border border-white/10 bg-white/3 p-6 md:p-8">
          <div className="flex gap-2 mb-4">
            <div className={`h-6 w-20 rounded-full ${shimmer}`} />
            <div className={`h-6 w-24 rounded-full ${shimmer}`} />
            <div className={`h-6 w-16 rounded-full ${shimmer}`} />
          </div>
          <div className={`h-10 w-2/3 rounded-lg ${shimmer} mb-4`} />
          <div className={`h-4 w-1/3 rounded-lg ${shimmer}`} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-14">
        {/* Stats row skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-20 rounded-2xl border border-white/10 ${shimmer}`} />
          ))}
        </div>

        {/* Description skeleton */}
        <div>
          <div className={`h-5 w-40 rounded ${shimmer} mb-4`} />
          <div className={`h-32 rounded-2xl border border-white/10 ${shimmer}`} />
        </div>

        {/* Pills skeleton */}
        <div>
          <div className={`h-5 w-48 rounded ${shimmer} mb-4`} />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-8 w-20 rounded-full ${shimmer}`} />
            ))}
          </div>
        </div>

        {/* Gallery skeleton */}
        <div>
          <div className={`h-5 w-32 rounded ${shimmer} mb-4`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`aspect-video rounded-xl border border-white/10 ${shimmer}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}