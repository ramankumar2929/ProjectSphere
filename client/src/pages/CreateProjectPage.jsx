import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  UploadCloud,
  X,
  Plus,
   
  Link2,
  Image as ImageIcon,
  FileText,
  Users,
  Rocket,
  Loader2,
  Trash2,
  Star,
} from "lucide-react";

import {FaGithub} from "react-icons/fa"

// Adjust this import to match wherever your configured axios instance lives.
// It should already attach the JWT auth header + baseURL "/api/v1".
import api from "../services/api.js";

/* -------------------------------------------------------------------------- */
/*  Static option lists (mirror backend enum expectations exactly)            */
/* -------------------------------------------------------------------------- */

const CATEGORY_OPTIONS = [
  "Web Development",
  "AI/ML",
  "Blockchain",
  "Cybersecurity",
  "IoT",
  "Mobile Development",
  "Open Source",
  "DevOps",
  "Other",
];

const DIFFICULTY_OPTIONS = ["beginner", "medium", "advanced"];

const STATUS_OPTIONS = ["completed", "ongoing", "paused"];

const MAX_SCREENSHOTS = 10;
const MAX_DOCUMENTS = 5;

/* -------------------------------------------------------------------------- */
/*  Small shared UI primitives                                                */
/* -------------------------------------------------------------------------- */

// Section wrapper: consistent glass card used for every group of fields.
function Section({ icon: Icon, title, subtitle, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
    >
      {/* faint linear wash in the corner, purely decorative */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-linear-to-br from-violet-600/20 to-cyan-500/10 blur-3xl" />
      <div className="relative flex items-start gap-3 mb-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/20 to-cyan-500/20 border border-white/10">
          <Icon className="h-4.5 w-4.5 text-violet-300" size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="relative">{children}</div>
    </motion.section>
  );
}

// Text input with the shared linear focus ring treatment.
function FieldInput({ label, required, error, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-violet-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`w-full rounded-xl bg-black/30 border ${
          error ? "border-red-500/60" : "border-white/10"
        } px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 hover:border-white/20`}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function FieldTextarea({ label, required, error, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-violet-400 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full rounded-xl bg-black/30 border ${
          error ? "border-red-500/60" : "border-white/10"
        } px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 hover:border-white/20 resize-none`}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function FieldSelect({ label, required, error, options, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-violet-400 ml-0.5">*</span>}
        </label>
      )}
      <select
        {...props}
        className={`w-full rounded-xl bg-black/30 border ${
          error ? "border-red-500/60" : "border-white/10"
        } px-4 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 hover:border-white/20 capitalize`}
      >
        <option value="" className="bg-[#0a0e1a]">
          Select {label?.toLowerCase()}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#0a0e1a] capitalize">
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

// Pill-style dynamic list input, used for both "technologies" and "tags".
function PillListInput({ label, placeholder, values, onAdd, onRemove, accent = "violet" }) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (!value) return;
    if (values.includes(value)) {
      toast.error(`"${value}" is already added`);
      return;
    }
    onAdd(value);
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    }
  };

  const accentClasses =
    accent === "violet"
      ? "from-violet-500/20 to-violet-500/5 border-violet-400/30 text-violet-200"
      : "from-cyan-500/20 to-cyan-500/5 border-cyan-400/30 text-cyan-200";

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 hover:border-white/20"
        />
        <button
          type="button"
          onClick={commit}
          className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Plus size={16} />
        </button>
      </div>

      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <AnimatePresence>
            {values.map((val) => (
              <motion.span
                key={val}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`inline-flex items-center gap-1.5 rounded-full border bg-linear-to-br ${accentClasses} px-3 py-1 text-xs font-medium`}
              >
                {val}
                <button
                  type="button"
                  onClick={() => onRemove(val)}
                  className="rounded-full hover:bg-white/10 p-0.5 transition-colors"
                >
                  <X size={11} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
      {values.length === 0 && (
        <p className="text-xs text-gray-500 mt-1.5">
          Press Enter after typing to add one.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main page component                                                       */
/* -------------------------------------------------------------------------- */

export default function CreateProjectPage() {
  const navigate = useNavigate();

  /* ---------------------------- form state ------------------------------ */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState([]);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [difficulty, setDifficulty] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [liveDemo, setLiveDemo] = useState("");
  const [status, setStatus] = useState("");

  // Team members: array of { ids }
  const [teamMembers, setTeamMembers] = useState([]);
  const [memberId, setMemberId] = useState("");

  // Files: keep the raw File objects plus generated preview URLs.
  const [screenshots, setScreenshots] = useState([]); // [{ file, previewUrl }]
  const [documents, setDocuments] = useState([]); // [{ file }]

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingScreenshots, setIsDraggingScreenshots] = useState(false);
  const [isDraggingDocs, setIsDraggingDocs] = useState(false);

  const screenshotInputRef = useRef(null);
  const documentInputRef = useRef(null);

  /* ------------------------- team member helpers ------------------------- */

  const addTeamMember = () => {
  if (!memberId.trim()) {
    toast.error("Enter user id");
    return;
  }

   if (teamMembers.includes(memberId.trim())) {
    toast.error("Team member already added");
    return;
  }

  setTeamMembers((prev) => [...prev, memberId.trim()]);

  setMemberId("");
};

  const removeTeamMember = (id) => {
    setTeamMembers((prev) => prev.filter((m) => m !== id));
  };

  /* --------------------------- file: screenshots -------------------------- */

  const addScreenshots = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );

      if (incoming.length !== fileList.length) {
        toast.error("Only image files are allowed for screenshots");
      }

      const availableSlots = MAX_SCREENSHOTS - screenshots.length;
      if (availableSlots <= 0) {
        toast.error(`You can upload a maximum of ${MAX_SCREENSHOTS} screenshots`);
        return;
      }

      const toAdd = incoming.slice(0, availableSlots).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      if (incoming.length > availableSlots) {
        toast.error(`Only ${availableSlots} more screenshot(s) can be added`);
      }

      setScreenshots((prev) => [...prev, ...toAdd]);
    },
    [screenshots.length]
  );

  const removeScreenshot = (index) => {
    setScreenshots((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
  };

  const handleScreenshotDrop = (e) => {
    e.preventDefault();
    setIsDraggingScreenshots(false);
    if (e.dataTransfer.files?.length) addScreenshots(e.dataTransfer.files);
  };

  /* --------------------------- file: documents ---------------------------- */

  const addDocuments = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList);
      const availableSlots = MAX_DOCUMENTS - documents.length;

      if (availableSlots <= 0) {
        toast.error(`You can upload a maximum of ${MAX_DOCUMENTS} documents`);
        return;
      }

      const toAdd = incoming.slice(0, availableSlots).map((file) => ({ file }));

      if (incoming.length > availableSlots) {
        toast.error(`Only ${availableSlots} more document(s) can be added`);
      }

      setDocuments((prev) => [...prev, ...toAdd]);
    },
    [documents.length]
  );

  const removeDocument = (index) => {
    setDocuments((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleDocumentDrop = (e) => {
    e.preventDefault();
    setIsDraggingDocs(false);
    if (e.dataTransfer.files?.length) addDocuments(e.dataTransfer.files);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* -------------------------------- validation ----------------------------- */

  const validate = () => {
    const next = {};

    if (!title.trim()) next.title = "Project title is required";
    if (!description.trim() || description.trim().length < 20)
      next.description = "Description should be at least 20 characters";
    if (!category) next.category = "Please choose a category";
    if (!difficulty) next.difficulty = "Please choose a difficulty level";
    if (!status) next.status = "Please choose a project status";

    if (githubLink.trim() && !/^https?:\/\/.+/i.test(githubLink.trim()))
      next.githubLink = "Enter a valid URL starting with http(s)://";

    if (liveDemo.trim() && !/^https?:\/\/.+/i.test(liveDemo.trim()))
      next.liveDemo = "Enter a valid URL starting with http(s)://";

    if (screenshots.length === 0)
      next.screenshots =
        "At least one screenshot is required — the first one becomes your project thumbnail";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* --------------------------------- submit -------------------------------- */

  const resolveErrorMessage = (err) => {
    // Network failure: request never reached the server.
    if (!err.response) {
      return "Network error — check your connection and try again.";
    }

    const status = err.response.status;
    const serverMessage = err.response.data?.message;

    if (status === 409) return serverMessage || "A project with this title already exists.";
    if (status === 400)
      return serverMessage || "Some fields are missing or invalid. Please review the form.";
    if (status === 413)
      return "Your upload is too large. Try removing a few files and try again.";
    if (status === 401) return "Your session has expired. Please log in again.";

    return serverMessage || "Something went wrong while creating your project.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("technologies", technologies.join(","));
    formData.append("category", category);
    formData.append("tags", tags.join(","));
    formData.append("difficulty", difficulty);
    formData.append("githublink", githubLink.trim());
    formData.append("liveDemo", liveDemo.trim());
    formData.append(
           "teamMembers",
         JSON.stringify(teamMembers)
                  );
    formData.append("status", status);

    screenshots.forEach(({ file }) => formData.append("screenshots", file));
    documents.forEach(({ file }) => formData.append("documents", file));

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const response = await api.post("/projects", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      toast.success("Project created successfully");
      navigate(`/project/${response.data.data._id}`);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  /* --------------------------------------------------------------------- */
  /*  Render                                                                */
  /* --------------------------------------------------------------------- */

  return (
    <div className="min-h-screen w-full bg-[#030712] relative overflow-hidden">
      {/* Ambient linear backdrop, fixed behind all content */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-125 w-125 rounded-full bg-violet-700/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-125 w-125 rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-gray-400 mb-4">
            <Rocket size={12} className="text-violet-400" />
            Launch a new project
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Show the world what you{" "}
            <span className="bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              built
            </span>
          </h1>
          <p className="text-gray-400 mt-3 max-w-lg mx-auto">
            Fill in the details below. The first screenshot you upload becomes
            your project's cover image.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---------------------------- Basics ---------------------------- */}
          <Section
            icon={FileText}
            title="Project basics"
            subtitle="What is it, and what does it do?"
            delay={0.05}
          >
            <div className="space-y-5">
              <FieldInput
                label="Project title"
                required
                placeholder="e.g. CampusConnect — student event platform"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
              />
              <FieldTextarea
                label="Description"
                required
                rows={5}
                placeholder="What problem does this solve? How does it work? What makes it interesting?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={errors.description}
              />
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldSelect
                  label="Category"
                  required
                  options={CATEGORY_OPTIONS}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  error={errors.category}
                />
                <FieldSelect
                  label="Difficulty"
                  required
                  options={DIFFICULTY_OPTIONS}
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  error={errors.difficulty}
                />
              </div>
            </div>
          </Section>

          {/* ------------------------- Technical details ---------------------- */}
          <Section
            icon={Star}
            title="Technical details"
            subtitle="Stack, tags and project status"
            delay={0.1}
          >
            <div className="space-y-5">
              <PillListInput
                label="Technologies used"
                placeholder="e.g. React, MongoDB, TailwindCSS"
                values={technologies}
                onAdd={(v) => setTechnologies((prev) => [...prev, v])}
                onRemove={(v) =>
                  setTechnologies((prev) => prev.filter((t) => t !== v))
                }
                accent="violet"
              />
              <PillListInput
                label="Tags"
                placeholder="e.g. hackathon-winner, final-year-project"
                values={tags}
                onAdd={(v) => setTags((prev) => [...prev, v])}
                onRemove={(v) => setTags((prev) => prev.filter((t) => t !== v))}
                accent="cyan"
              />
              <FieldSelect
                label="Status"
                required
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                error={errors.status}
              />
            </div>
          </Section>

          {/* ------------------------------ Links ------------------------------ */}
          <Section
            icon={Link2}
            title="Links"
            subtitle="Optional, but strongly recommended"
            delay={0.15}
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  <FaGithub size={13} className="inline mr-1.5 -mt-0.5" />
                  GitHub repository
                </label>
                <FieldInput
                  placeholder="https://github.com/username/repo"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  error={errors.githubLink}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  <Link2 size={13} className="inline mr-1.5 -mt-0.5" />
                  Live demo
                </label>
                <FieldInput
                  placeholder="https://your-project.vercel.app"
                  value={liveDemo}
                  onChange={(e) => setLiveDemo(e.target.value)}
                  error={errors.liveDemo}
                />
              </div>
            </div>
          </Section>

          {/* --------------------------- Team members --------------------------- */}
          <Section
            icon={Users}
            title="Team members"
            subtitle="Add collaborators who worked on this with you"
            delay={0.2}
          >
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="Enter team member user id"
                className="flex-1 rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-white"
              />
              <button
                type="button"
                onClick={addTeamMember}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Plus size={15} />
                Add
              </button>
            </div>

            {teamMembers.length === 0 ? (
              <p className="text-xs text-gray-500">
                No team members added yet — you'll always be listed as the owner.
              </p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {teamMembers.map((member) => (
                    <motion.div
                      key={member}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2.5"
                    >
                      <div>
                        <p className="text-sm text-white">{member}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(member)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Section>

          {/* ---------------------------- Screenshots ---------------------------- */}
          <Section
            icon={ImageIcon}
            title="Screenshots"
            subtitle={`Up to ${MAX_SCREENSHOTS} images — the first is used as your project thumbnail`}
            delay={0.25}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingScreenshots(true);
              }}
              onDragLeave={() => setIsDraggingScreenshots(false)}
              onDrop={handleScreenshotDrop}
              onClick={() => screenshotInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
                isDraggingScreenshots
                  ? "border-violet-400 bg-violet-500/5"
                  : errors.screenshots
                  ? "border-red-500/50 bg-red-500/3"
                  : "border-white/15 bg-black/20 hover:border-white/30 hover:bg-white/2"
              }`}
            >
              <UploadCloud
                className={`mx-auto mb-3 ${
                  isDraggingScreenshots ? "text-violet-300" : "text-gray-500"
                }`}
                size={28}
              />
              <p className="text-sm text-gray-300">
                Drag & drop images here, or{" "}
                <span className="text-violet-300 underline underline-offset-2">
                  browse
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WEBP — {screenshots.length}/{MAX_SCREENSHOTS} added
              </p>
              <input
                ref={screenshotInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => e.target.files && addScreenshots(e.target.files)}
              />
            </div>
            {errors.screenshots && (
              <p className="text-xs text-red-400 mt-2">{errors.screenshots}</p>
            )}

            {screenshots.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <AnimatePresence>
                  {screenshots.map((shot, index) => (
                    <motion.div
                      key={shot.previewUrl}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group aspect-video rounded-lg overflow-hidden border border-white/10"
                    >
                      <img
                        src={shot.previewUrl}
                        alt={`Screenshot ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute top-1.5 left-1.5 rounded-full bg-linear-to-r from-violet-500 to-cyan-500 px-2 py-0.5 text-[10px] font-medium text-white shadow">
                          Thumbnail
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Section>

          {/* ----------------------------- Documents ----------------------------- */}
          <Section
            icon={FileText}
            title="Documents"
            subtitle={`Optional — reports, presentations, or write-ups (up to ${MAX_DOCUMENTS})`}
            delay={0.3}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingDocs(true);
              }}
              onDragLeave={() => setIsDraggingDocs(false)}
              onDrop={handleDocumentDrop}
              onClick={() => documentInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200 ${
                isDraggingDocs
                  ? "border-cyan-400 bg-cyan-500/5"
                  : "border-white/15 bg-black/20 hover:border-white/30 hover:bg-white/2"
              }`}
            >
              <UploadCloud
                className={`mx-auto mb-3 ${
                  isDraggingDocs ? "text-cyan-300" : "text-gray-500"
                }`}
                size={26}
              />
              <p className="text-sm text-gray-300">
                Drag & drop files here, or{" "}
                <span className="text-cyan-300 underline underline-offset-2">
                  browse
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOCX, PPTX — {documents.length}/{MAX_DOCUMENTS} added
              </p>
              <input
                ref={documentInputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => e.target.files && addDocuments(e.target.files)}
              />
            </div>

            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <AnimatePresence>
                  {documents.map((doc, index) => (
                    <motion.div
                      key={`${doc.file.name}-${index}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText size={15} className="text-cyan-300 shrink-0" />
                        <span className="text-sm text-gray-200 truncate">
                          {doc.file.name}
                        </span>
                        <span className="text-xs text-gray-500 shrink-0">
                          {formatFileSize(doc.file.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-gray-500 hover:text-red-400 transition-colors shrink-0 ml-2"
                      >
                        <Trash2 size={15} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Section>

          {/* ------------------------------ Submit bar ----------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="sticky bottom-4 z-10"
          >
            <div className="rounded-2xl border border-white/10 bg-[#0a0e1a]/90 backdrop-blur-xl p-4 sm:p-5 shadow-2xl shadow-black/40 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                {isSubmitting ? (
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      <span>Uploading your project…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-linear-to-r from-violet-500 to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    Ready when you are. You can still edit this after publishing.
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Publishing…
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    Publish project
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}