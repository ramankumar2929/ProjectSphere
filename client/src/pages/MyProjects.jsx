import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Users,
  AlertTriangle,
  RotateCcw,
  Heart,
  MessageCircle,
  Eye,
  CalendarDays,
  Pencil,
  Trash2,
  ExternalLink,
  ImageOff,
  Layers,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import api from "../services/api.js"; // adjust to your actual axios instance path

/* ------------------------------------------------------------------ */
/* Animation variants                                                   */
/* ------------------------------------------------------------------ */

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const gridStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/* ------------------------------------------------------------------ */
/* Pure helpers                                                         */
/* ------------------------------------------------------------------ */

const DIFFICULTY_STYLES = {
  beginner: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  intermediate: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  advanced: "border-red-400/30 bg-red-500/10 text-red-300",
};

function difficultyClasses(difficulty) {
  const key = (difficulty || "").toLowerCase();
  return DIFFICULTY_STYLES[key] || "border-white/15 bg-white/5 text-white/60";
}

function formatDate(isoDate) {
  if (!isoDate) return null;
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function normalizeTechnologies(technologies) {
  if (!technologies) return [];
  if (Array.isArray(technologies)) return technologies.filter(Boolean);
  if (typeof technologies === "string") {
    return technologies.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* Small presentational pieces (all local to this file)                 */
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

function ProjectCardSkeleton() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
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
  );
}

function SkeletonGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, heading, description, actionLabel, onAction }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-16 text-center"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500/30 to-cyan-400/30 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Icon className="h-7 w-7 text-white/50" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white/90">{heading}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-white/50">{description}</p>
      {actionLabel && (
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="mt-6 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

function ErrorCard({ onRetry }) {
  return (
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
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20"
      >
        <RotateCcw className="h-4 w-4" />
        Retry
      </motion.button>
    </motion.div>
  );
}

function ProjectCard({ project, variant, onView, onEdit, onDelete }) {
  const technologies = normalizeTechnologies(project.technologies);
  const visibleTechs = technologies.slice(0, 4);
  const extraTechCount = technologies.length - visibleTechs.length;

  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-purple-400/30 hover:shadow-[0_0_40px_-12px_rgba(168,85,247,0.4)]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-white/5">
        {project.thumbnail?.url ? (
          <img
            src={project.thumbnail.url}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/20">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

        {variant === "contributor" && (
          <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-3 py-1 text-[11px] font-medium text-cyan-200 backdrop-blur-md">
            <Users className="h-3 w-3" />
            Team Member
          </span>
        )}

        {project.category && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md">
            <Layers className="h-3 w-3" />
            {project.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
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

        <p className="mt-2 text-sm text-white/50 line-clamp-2 leading-relaxed">
          {project.description || "No description provided."}
        </p>

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

        <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            {project.likesCount ?? 0}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" />
            {project.commentsCount ?? 0}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {project.views ?? 0}
          </span>
          {project.createdAt && (
            <span className="ml-auto flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(project.createdAt)}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2 pt-4 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onView(project._id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-purple-500/20 to-cyan-500/20 border border-white/10 px-3 py-2 text-xs font-medium text-white/85 hover:from-purple-500/30 hover:to-cyan-500/30 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Project
          </motion.button>

          {variant === "owner" && (
            <>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(project._id)}
                title="Edit Project"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:border-cyan-400/30 hover:text-cyan-300 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(project)}
                title="Delete Project"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:border-red-400/30 hover:text-red-300 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function DeleteProjectModal({ open, projectTitle, deleting, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={!deleting ? onCancel : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0a0f1c] p-6 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white/90">Delete Project</h3>
            <p className="mt-2 text-sm text-white/50 leading-relaxed">
              Are you sure you want to permanently delete
              {projectTitle ? <span className="text-white/70 font-medium"> "{projectTitle}"</span> : " this project"}?
              <br />
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onCancel}
                disabled={deleting}
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-red-500 to-orange-400 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 backdrop-blur-xl shadow-2xl ${
        isSuccess
          ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-100"
          : "border-red-400/30 bg-red-500/10 text-red-100"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-300" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0 text-red-300" />
      )}
      <span className="text-sm font-medium">{toast.message}</span>
      <button onClick={onClose} className="ml-2 text-white/40 hover:text-white/70 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */

export default function MyProjects() {
  const navigate = useNavigate();

  const [ownedProjects, setOwnedProjects] = useState([]);
  const [ownedStatus, setOwnedStatus] = useState("loading"); // loading | success | error

  const [contributedProjects, setContributedProjects] = useState([]);
  const [contributedStatus, setContributedStatus] = useState("loading"); // loading | success

  const [projectPendingDelete, setProjectPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchOwnedProjects = useCallback(async () => {
    setOwnedStatus("loading");
    try {
      const response = await api.get("/projects/myprojects");
      const data = response.data?.data ?? response.data ?? [];
      setOwnedProjects(Array.isArray(data) ? data : []);
      setOwnedStatus("success");
    } catch (error) {
      setOwnedStatus("error");
    }
  }, []);

  const fetchContributedProjects = useCallback(async () => {
    setContributedStatus("loading");
    try {
      const response = await api.get("/projects/contributed");
      const data = response.data?.data ?? response.data ?? [];
      setContributedProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      // Per spec: this endpoint may not exist yet — never crash, just show the empty state.
      setContributedProjects([]);
    } finally {
      setContributedStatus("success");
    }
  }, []);

  useEffect(() => {
    fetchOwnedProjects();
    fetchContributedProjects();
  }, [fetchOwnedProjects, fetchContributedProjects]);

  const handleView = useCallback((projectId) => navigate(`/project/${projectId}`), [navigate]);
  const handleEdit = useCallback((projectId) => navigate(`/projects/edit/${projectId}`), [navigate]);
  const handleCreateProject = useCallback(() => navigate("/projects/create"), [navigate]);

  const handleDeleteRequest = useCallback((project) => setProjectPendingDelete(project), []);
  const handleDeleteCancel = useCallback(() => {
    if (!deleting) setProjectPendingDelete(null);
  }, [deleting]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!projectPendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${projectPendingDelete._id}`);
      setOwnedProjects((prev) => prev.filter((p) => p._id !== projectPendingDelete._id));
      setToast({ type: "success", message: "Project deleted successfully" });
      setProjectPendingDelete(null);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Failed to delete project. Please try again.";
      setToast({ type: "error", message: backendMessage });
    } finally {
      setDeleting(false);
    }
  }, [projectPendingDelete]);

  const closeToast = useCallback(() => setToast(null), []);

  return (
    <div className="min-h-screen bg-[#030712] px-4 py-10 sm:px-6 lg:px-10">
      <AnimatePresence>{toast && <Toast toast={toast} onClose={closeToast} />}</AnimatePresence>

      <DeleteProjectModal
        open={Boolean(projectPendingDelete)}
        projectTitle={projectPendingDelete?.title}
        deleting={deleting}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      <motion.div variants={pageVariants} initial="hidden" animate="show" className="mx-auto max-w-7xl">
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Projects</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage every project you've created and every project you've contributed to.
          </p>
        </motion.div>

        {/* Section 1: Projects Created By Me */}
        <motion.section variants={fadeUp} className="mb-12">
          <div className="mb-5 flex items-center gap-2">
            <FolderKanban className="h-4.5 w-4.5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white/90">Projects Created By Me</h2>
          </div>

          {ownedStatus === "loading" && <SkeletonGrid count={3} />}

          {ownedStatus === "error" && <ErrorCard onRetry={fetchOwnedProjects} />}

          {ownedStatus === "success" && ownedProjects.length === 0 && (
            <EmptyState
              icon={FolderKanban}
              heading="No Projects Yet"
              description="You haven't created any project yet. Start building something amazing."
              actionLabel="Create Project"
              onAction={handleCreateProject}
            />
          )}

          {ownedStatus === "success" && ownedProjects.length > 0 && (
            <motion.div
              variants={gridStagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {ownedProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  variant="owner"
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Section 2: Projects I Contributed To */}
        <motion.section variants={fadeUp}>
          <div className="mb-5 flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white/90">Projects I Contributed To</h2>
          </div>

          {contributedStatus === "loading" && <SkeletonGrid count={3} />}

          {contributedStatus === "success" && contributedProjects.length === 0 && (
            <EmptyState
              icon={Users}
              heading="No Contributions Yet"
              description="You haven't contributed to any projects yet. Join a team and start collaborating."
            />
          )}

          {contributedStatus === "success" && contributedProjects.length > 0 && (
            <motion.div
              variants={gridStagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {contributedProjects.map((project) => (
                <ProjectCard key={project._id} project={project} variant="contributor" onView={handleView} />
              ))}
            </motion.div>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}