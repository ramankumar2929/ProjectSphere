import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {FaGithub} from "react-icons/fa"
import {
  ImageOff,
  Upload,
  FileText,
  X,
  Plus,
  Globe,
  Users,
  Loader2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../services/api.js"; // adjust to your actual axios instance path

/* ===========================================================
   CONSTANTS
   Adjust these enums to exactly match your backend's accepted
   values for category / difficulty / status.
=========================================================== */

const CATEGORY_OPTIONS = [
  "Web Development",
  "Mobile App",
  "AI / Machine Learning",
  "Game Development",
  "Data Science",
  "DevOps / Cloud",
  "Other",
];

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const STATUS_OPTIONS = ["Draft", "Published", "Archived"];

const MAX_SCREENSHOTS = 10;
const MAX_DOCUMENTS = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file

/* ===========================================================
   ANIMATION VARIANTS
=========================================================== */

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/* ===========================================================
   PURE HELPER FUNCTIONS
   (no side effects — safe to call from render or handlers)
=========================================================== */

function csvToArray(value) {
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function arrayToCsv(value) {
  if (!value) return "";
  return Array.isArray(value) ? value.join(", ") : value;
}

function ensureHttpsPrefix(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function buildFormFromProject(project) {
  return {
    title: project?.title || "",
    description: project?.description || "",
    category: project?.category || "",
    difficulty: project?.difficulty || "",
    technologies: arrayToCsv(project?.technologies),
    tags: arrayToCsv(project?.tags),
    githubLink: project?.githubLink || "",
    liveDemo: project?.liveDemo || "",
    status: project?.status || "",
  };
}

/** Extracts a stable id for a populated-or-not teamMembers entry. */
function extractTeamMemberId(member) {
  if (typeof member === "string") return member;
  return member?._id || member?.username || String(member);
}

/** Extracts a human-readable label for a populated-or-not teamMembers entry. */
function extractTeamMemberLabel(member) {
  if (typeof member === "string") return member;
  return member?.username || member?.fullName || member?._id || String(member);
}

function validateRequiredFields(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required.";
  if (!form.description.trim()) errors.description = "Description is required.";
  return errors;
}

/** Compares original vs current simple form values, returning only what changed. */
function diffFormValues(original, current, teamMembersOriginal, teamMembersCurrent) {
  const diff = {};
  if (original.title !== current.title) diff.title = current.title.trim();
  if (original.description !== current.description) diff.description = current.description.trim();
  if (original.category !== current.category) diff.category = current.category;
  if (original.difficulty !== current.difficulty) diff.difficulty = current.difficulty;
  if (original.technologies !== current.technologies) diff.technologies = csvToArray(current.technologies);
  if (original.tags !== current.tags) diff.tags = csvToArray(current.tags);
  if (original.githubLink !== current.githubLink) diff.githubLink = current.githubLink.trim();
  if (original.liveDemo !== current.liveDemo) diff.liveDemo = current.liveDemo.trim();
  if (original.status !== current.status) diff.status = current.status;
  if (JSON.stringify(teamMembersOriginal) !== JSON.stringify(teamMembersCurrent)) {
    diff.teamMembers = teamMembersCurrent;
  }
  return diff;
}

function formatFileType(fileNameOrType) {
  if (!fileNameOrType) return "FILE";
  const parts = fileNameOrType.split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : fileNameOrType.toUpperCase();
}

/* ===========================================================
   MAIN COMPONENT
=========================================================== */

export default function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const screenshotInputRef = useRef(null);
  const documentInputRef = useRef(null);

  /* ----------------------- Page load state ----------------------- */
  const [pageStatus, setPageStatus] = useState("loading"); // loading | success | error

  /* ----------------------- Form field state ----------------------- */
  const [form, setForm] = useState(buildFormFromProject(null));
  const [initialForm, setInitialForm] = useState(buildFormFromProject(null));
  const [errors, setErrors] = useState({});

  /* ----------------------- Team members state ----------------------- */
  const [teamMembers, setTeamMembers] = useState([]);
  const [initialTeamMembers, setInitialTeamMembers] = useState([]);
  const [teamMemberInput, setTeamMemberInput] = useState("");

  /* ----------------------- Screenshots state ----------------------- */
  const [existingScreenshots, setExistingScreenshots] = useState([]); // array of URLs still kept
  const [newScreenshots, setNewScreenshots] = useState([]); // [{ file, previewUrl }]
  const [removedScreenshots, setRemovedScreenshots] = useState([]);

  /* ----------------------- Documents state ----------------------- */
  const [existingDocuments, setExistingDocuments] = useState([]); // array of { url, name }
  const [newDocuments, setNewDocuments] = useState([]); // [{ file }]
  const [documentsRemoved, setDocumentsRemoved] = useState(false);

  /* ----------------------- Misc UI state ----------------------- */
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  /* ===========================================================
     FETCH EXISTING PROJECT
  =========================================================== */

  const fetchProject = useCallback(async () => {
    setPageStatus("loading");
    try {
      const response = await api.get(`/projects/${projectId}`);
      const project = response.data?.data ?? response.data;
      console.log(project)

      const initial = buildFormFromProject(project);
      setForm(initial);
      setInitialForm(initial);

      const members = Array.isArray(project?.teamMembers) ? project.teamMembers.map(extractTeamMemberId) : [];
      setTeamMembers(members);
      setInitialTeamMembers(members);

      setExistingScreenshots(Array.isArray(project?.screenshots) ? project.screenshots : []);
      setExistingDocuments(
        Array.isArray(project?.documents)
          ? project.documents.map((doc) =>
              typeof doc === "string" ? { url: doc, name: doc.split("/").pop() } : doc
            )
          : []
      );

      setPageStatus("success");
    } catch (error) {
      setPageStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Clean up object URLs created for new screenshot previews on unmount.
  useEffect(() => {
    return () => {
      newScreenshots.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===========================================================
     BASIC INFORMATION HANDLERS
  =========================================================== */

  const handleFieldChange = useCallback((field) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleUrlFieldBlur = useCallback((field) => () => {
    setForm((prev) => (prev[field].trim() ? { ...prev, [field]: ensureHttpsPrefix(prev[field]) } : prev));
  }, []);

  /* ===========================================================
     TEAM MEMBERS HANDLERS
  =========================================================== */

  const handleAddTeamMember = useCallback(() => {
    const value = teamMemberInput.trim();
    if (!value || teamMembers.includes(value)) {
      setTeamMemberInput("");
      return;
    }
    setTeamMembers((prev) => [...prev, value]);
    setTeamMemberInput("");
  }, [teamMemberInput, teamMembers]);

  const handleRemoveTeamMember = useCallback((member) => {
    setTeamMembers((prev) => prev.filter((m) => m !== member));
  }, []);

  /* ===========================================================
     SCREENSHOTS HANDLERS
  =========================================================== */

  const totalScreenshotCount = existingScreenshots.length + newScreenshots.length;

  const handleAddScreenshots = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      if (totalScreenshotCount + files.length > MAX_SCREENSHOTS) {
        setFileError(`You can only have up to ${MAX_SCREENSHOTS} screenshots.`);
        return;
      }
      const invalidFile = files.find((f) => !ALLOWED_IMAGE_TYPES.includes(f.type));
      if (invalidFile) {
        setFileError("Screenshots must be JPG, PNG, or WEBP images.");
        return;
      }
      const oversized = files.find((f) => f.size > MAX_FILE_SIZE_BYTES);
      if (oversized) {
        setFileError("Each screenshot must be 10 MB or smaller.");
        return;
      }

      setFileError("");
      setNewScreenshots((prev) => [
        ...prev,
        ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
      ]);
      e.target.value = "";
    },
    [totalScreenshotCount]
  );

const handleRemoveExistingScreenshot = useCallback((shot) => {

    setExistingScreenshots((prev) =>
        prev.filter((s) => s.public_id !== shot.public_id)
    );

    setRemovedScreenshots((prev) => [...prev, shot]);

}, []);

  const handleRemoveNewScreenshot = useCallback((index) => {
    setNewScreenshots((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  /* ===========================================================
     DOCUMENTS HANDLERS
  =========================================================== */

  const totalDocumentCount = existingDocuments.length + newDocuments.length;

  const handleAddDocuments = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      if (totalDocumentCount + files.length > MAX_DOCUMENTS) {
        setFileError(`You can only have up to ${MAX_DOCUMENTS} documents.`);
        return;
      }
      const oversized = files.find((f) => f.size > MAX_FILE_SIZE_BYTES);
      if (oversized) {
        setFileError("Each document must be 10 MB or smaller.");
        return;
      }

      setFileError("");
      setNewDocuments((prev) => [...prev, ...files.map((file) => ({ file }))]);
      e.target.value = "";
    },
    [totalDocumentCount]
  );

  const handleRemoveExistingDocument = useCallback((url) => {
    setExistingDocuments((prev) => prev.filter((d) => d.url !== url));
    setDocumentsRemoved(true);
  }, []);

  const handleRemoveNewDocument = useCallback((index) => {
    setNewDocuments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /* ===========================================================
     CHANGE DETECTION
  =========================================================== */

  const changedFields = useMemo(
    () => diffFormValues(initialForm, form, initialTeamMembers, teamMembers),
    [initialForm, form, initialTeamMembers, teamMembers]
  );

  const hasChanges =
    Object.keys(changedFields).length > 0 ||
    newScreenshots.length > 0 ||
    removedScreenshots ||
    newDocuments.length > 0 ||
    documentsRemoved;

  /* ===========================================================
     ACTION BUTTONS — SUBMIT / CANCEL
  =========================================================== */

  const closeToast = useCallback(() => setToast(null), []);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validateRequiredFields(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!hasChanges) {
      setToast({ type: "error", message: "No changes to update." });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      // Append only the simple fields that actually changed.
      Object.entries(changedFields).forEach(([key, value]) => {
        if (key === "technologies" || key === "tags" || key === "teamMembers") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      // ✅ Send removed screenshots to backend
  formData.append(
    "removedScreenshots",
    JSON.stringify(removedScreenshots)
  );

      // New file uploads.
      newScreenshots.forEach(({ file }) => formData.append("screenshots", file));
      newDocuments.forEach(({ file }) => formData.append("documents", file));

      await api.patch(`/projects/${projectId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setToast({ type: "success", message: "Project updated successfully" });
      setSubmitting(false);
      setTimeout(() => navigate(`/project/${projectId}`), 1000);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Failed to update project. Please try again.";
      setToast({ type: "error", message: backendMessage });
      setSubmitting(false);
    }
  }, [form, hasChanges, changedFields, newScreenshots, newDocuments, projectId, navigate]);

  const handleCancel = useCallback(() => navigate(-1), [navigate]);

  /* ===========================================================
     SHARED STYLE CLASSES
  =========================================================== */

  const inputBaseClasses =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 outline-none backdrop-blur-md transition-colors focus:border-purple-400/50 focus:bg-white/[0.07]";
  const selectBaseClasses = `${inputBaseClasses} appearance-none cursor-pointer`;

  const Shimmer = ({ className = "" }) => (
    <div className={`relative overflow-hidden rounded-xl bg-white/5 ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );

  /* ===========================================================
     LOADING STATE
  =========================================================== */

  if (pageStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#030712] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-5">
          <Shimmer className="h-7 w-56" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  /* ===========================================================
     ERROR STATE
  =========================================================== */

  if (pageStatus === "error") {
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
          <h2 className="text-lg font-semibold text-white/90">Unable to load project.</h2>
          <p className="mt-1.5 text-sm text-white/50">Please try again.</p>
          <motion.button
            onClick={fetchProject}
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

  /* ===========================================================
     MAIN RENDER
  =========================================================== */

  return (
    <div className="min-h-screen bg-[#030712] px-4 py-10 sm:px-6 lg:px-10">
      {/* ===========================================================
          TOAST NOTIFICATION
      =========================================================== */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 backdrop-blur-xl shadow-2xl ${
              toast.type === "success"
                ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-100"
                : "border-red-400/30 bg-red-500/10 text-red-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-300" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-red-300" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={closeToast} className="ml-2 text-white/40 hover:text-white/70 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={pageVariants} initial="hidden" animate="show" className="mx-auto max-w-4xl">
        {/* ===========================================================
            PROJECT HEADER
        =========================================================== */}
        <motion.div variants={fadeUp} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Project</h1>
          <p className="mt-1 text-sm text-white/50">
            Update your project information, screenshots, documents and team members.
          </p>
        </motion.div>

        <motion.section
          variants={fadeUp}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8"
        >
          <fieldset disabled={submitting} className="space-y-8 disabled:opacity-60">
            {/* ===========================================================
                BASIC INFORMATION
            =========================================================== */}
            <div className="space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">Basic Information</h2>

              <div>
                <label htmlFor="title" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={handleFieldChange("title")}
                  placeholder="Project title"
                  className={inputBaseClasses}
                />
                {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={form.description}
                  onChange={handleFieldChange("description")}
                  placeholder="Describe your project..."
                  className={`${inputBaseClasses} resize-none`}
                />
                {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    Category
                  </label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={handleFieldChange("category")}
                    className={selectBaseClasses}
                  >
                    <option value="" className="bg-[#0a0f1c]">Select category</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#0a0f1c]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="difficulty" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    Difficulty
                  </label>
                  <select
                    id="difficulty"
                    value={form.difficulty}
                    onChange={handleFieldChange("difficulty")}
                    className={selectBaseClasses}
                  >
                    <option value="" className="bg-[#0a0f1c]">Select difficulty</option>
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#0a0f1c]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ===========================================================
                TECHNOLOGIES
            =========================================================== */}
            <div className="space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">Technologies & Tags</h2>

              <div>
                <label htmlFor="technologies" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  Technologies
                </label>
                <input
                  id="technologies"
                  type="text"
                  value={form.technologies}
                  onChange={handleFieldChange("technologies")}
                  placeholder="React, Node.js, MongoDB, Express"
                  className={inputBaseClasses}
                />
                <p className="mt-1 text-[11px] text-white/30">Comma separated. Stored as an array before submitting.</p>
              </div>

              <div>
                <label htmlFor="tags" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  value={form.tags}
                  onChange={handleFieldChange("tags")}
                  placeholder="hackathon, open-source, final-year"
                  className={inputBaseClasses}
                />
                <p className="mt-1 text-[11px] text-white/30">Comma separated. Stored as an array before submitting.</p>
              </div>
            </div>

            {/* ===========================================================
                LINKS & STATUS
            =========================================================== */}
            <div className="space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">Links & Status</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="githubLink" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    GitHub Repository
                  </label>
                  <div className="relative">
                    <FaGithub className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      id="githubLink"
                      type="text"
                      value={form.githubLink}
                      onChange={handleFieldChange("githubLink")}
                      onBlur={handleUrlFieldBlur("githubLink")}
                      placeholder="github.com/you/project"
                      className={`${inputBaseClasses} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="liveDemo" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                    Live Demo
                  </label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      id="liveDemo"
                      type="text"
                      value={form.liveDemo}
                      onChange={handleFieldChange("liveDemo")}
                      onBlur={handleUrlFieldBlur("liveDemo")}
                      placeholder="your-project.vercel.app"
                      className={`${inputBaseClasses} pl-11`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="status" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  Project Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={handleFieldChange("status")}
                  className={selectBaseClasses}
                >
                  <option value="" className="bg-[#0a0f1c]">Select status</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0a0f1c]">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ===========================================================
                TEAM MEMBERS
            =========================================================== */}
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">Team Members</h2>
              <p className="text-[11px] text-white/30 -mt-2">
                Add each teammate's user ID or username, then press Enter or click Add.
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={teamMemberInput}
                    onChange={(e) => setTeamMemberInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTeamMember();
                      }
                    }}
                    placeholder="Enter user ID or username"
                    className={`${inputBaseClasses} pl-11`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 text-white/70 hover:bg-white/10 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {teamMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map((member) => (
                    <span
                      key={member}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70"
                    >
                      {extractTeamMemberLabel(member)}
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamMember(member)}
                        className="text-white/30 hover:text-red-300 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ===========================================================
                SCREENSHOTS
            =========================================================== */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">Screenshots</h2>
                <span className="text-[11px] text-white/30">
                  {totalScreenshotCount}/{MAX_SCREENSHOTS}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {existingScreenshots.map((shot, idx) => (
  <motion.div
    key={shot.public_id || idx}
    whileHover={{ scale: 1.03 }}
    className="group relative h-20 w-28 overflow-hidden rounded-xl border border-white/10"
  >
    {shot.url ? (
      <img
        src={shot.url}
        alt={`Screenshot ${idx + 1}`}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-white/5 text-white/20">
        <ImageOff className="h-5 w-5" />
      </div>
    )}

    <button
      type="button"
      onClick={() => handleRemoveExistingScreenshot(shot)}
      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
    >
      <X className="h-3 w-3" />
    </button>
  </motion.div>
))}

                {newScreenshots.map((shot, idx) => (
                  <motion.div
                    key={`new-shot-${idx}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative h-20 w-28 overflow-hidden rounded-xl border border-cyan-400/30"
                  >
                    <img src={shot.url} alt={`New screenshot ${idx + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewScreenshot(idx)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}

                {totalScreenshotCount < MAX_SCREENSHOTS && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => screenshotInputRef.current?.click()}
                    className="flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 text-white/40 hover:border-purple-400/40 hover:text-purple-300 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-[10px]">Add</span>
                  </motion.button>
                )}
                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleAddScreenshots}
                  className="hidden"
                />
              </div>
            </div>

            {/* ===========================================================
                DOCUMENTS
            =========================================================== */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">Documents</h2>
                <span className="text-[11px] text-white/30">
                  {totalDocumentCount}/{MAX_DOCUMENTS}
                </span>
              </div>

              <div className="space-y-2">
                {existingDocuments.map((doc, idx) => (
                  <motion.div
                    key={`existing-doc-${idx}`}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5"
                  >
                    <FileText className="h-4 w-4 text-white/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-white/70">{doc.name}</p>
                      <p className="text-[10px] text-white/30">{formatFileType(doc.name)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingDocument(doc.url)}
                      className="text-white/30 hover:text-red-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}

                {newDocuments.map(({ file }, idx) => (
                  <motion.div
                    key={`new-doc-${idx}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-cyan-400/30 bg-white/5 px-4 py-2.5"
                  >
                    <FileText className="h-4 w-4 text-cyan-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-white/70">{file.name}</p>
                      <p className="text-[10px] text-white/30">{formatFileType(file.name)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewDocument(idx)}
                      className="text-white/30 hover:text-red-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}

                {totalDocumentCount < MAX_DOCUMENTS && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => documentInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 text-xs text-white/40 hover:border-purple-400/40 hover:text-purple-300 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Add Document
                  </motion.button>
                )}
                <input ref={documentInputRef} type="file" multiple onChange={handleAddDocuments} className="hidden" />
              </div>
            </div>

            {fileError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400">
                {fileError}
              </motion.p>
            )}
          </fieldset>

          {/* ===========================================================
              ACTION BUTTONS
          =========================================================== */}
          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-6 border-t border-white/10">
            <motion.button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </motion.button>
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Project"
              )}
            </motion.button>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}