import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Tag,
  ClipboardCheck,
  Bot,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
} from "lucide-react";
import api from "../services/api"; // pre-configured axios instance
import AIChat from "../components/AIChat";

/* ===========================================================
   CONSTANTS
=========================================================== */

const TOOLS = [
  {
    id: "description",
    title: "AI Description",
    description: "Generate professional project descriptions.",
    icon: FileText,
  },
  {
    id: "tags",
    title: "AI Tags",
    description: "Generate relevant portfolio tags.",
    icon: Tag,
  },
  {
    id: "review",
    title: "AI Review",
    description: "Receive constructive AI feedback.",
    icon: ClipboardCheck,
  },
  {
    id: "chat",
    title: "AI Assistant",
    description: "Ask anything about projects, programming or hackathons.",
    icon: Bot,
  },
];

/* ===========================================================
   ANIMATION VARIANTS
   Matches the timing/easing used across Projects.jsx.
=========================================================== */

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const cardGridStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

/* ===========================================================
   PURE HELPER FUNCTIONS
=========================================================== */

function csvToArray(value) {
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

/** Normalizes a variety of possible response shapes into a plain string. */
function extractText(payload, fallback = "") {
  if (typeof payload === "string") return payload;
  return payload?.data?.description ?? payload?.description ?? payload?.data ?? fallback;
}

/** Normalizes a variety of possible response shapes into a string array. */
function extractArray(payload) {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tags)) return data.tags;
  return [];
}

/* ===========================================================
   SHARED PRESENTATIONAL PIECES
   (shimmer loader, error retry card — reused by all three
   inline tools)
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

function ResultShimmer() {
  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <Shimmer className="h-4 w-32" />
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-2/3" />
    </div>
  );
}

function RetryCard({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-10 text-center"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
        <AlertTriangle className="h-5 w-5 text-red-400" />
      </div>
      <p className="text-sm text-white/60">{message}</p>
      <motion.button
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Retry
      </motion.button>
    </motion.div>
  );
}

const inputBaseClasses =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 outline-none backdrop-blur-md transition-colors focus:border-purple-400/50 focus:bg-white/[0.07]";

function FieldLabel({ children }) {
  return <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">{children}</label>;
}

/* ===========================================================
   MAIN COMPONENT
=========================================================== */

export default function AITools() {
  /* ----------------------- Active tool selector ----------------------- */
  const [activeTool, setActiveTool] = useState("description");

  /* ===========================================================
     TOOL 1 — AI DESCRIPTION GENERATOR
  =========================================================== */

  const [descriptionForm, setDescriptionForm] = useState({
    title: "",
    category: "",
    technologies: "",
    features: "",
  });
  const [descriptionResult, setDescriptionResult] = useState("");
  const [descriptionStatus, setDescriptionStatus] = useState("idle"); // idle | loading | success | error
  const [descriptionCopied, setDescriptionCopied] = useState(false);

  const handleDescriptionFieldChange = useCallback((field) => (e) => {
    const { value } = e.target;
    setDescriptionForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const generateDescription = useCallback(async () => {
    setDescriptionStatus("loading");
    try {
      const response = await api.post("/ai/aiDescription", {
        title: descriptionForm.title.trim(),
        category: descriptionForm.category.trim(),
        technologies: csvToArray(descriptionForm.technologies),
        features: descriptionForm.features.trim(),
      });
      setDescriptionResult(extractText(response.data));
      setDescriptionStatus("success");
    } catch (error) {
      setDescriptionStatus("error");
    }
  }, [descriptionForm]);

  const handleCopyDescription = useCallback(() => {
    if (!descriptionResult) return;
    navigator.clipboard.writeText(descriptionResult);
    setDescriptionCopied(true);
    setTimeout(() => setDescriptionCopied(false), 1500);
  }, [descriptionResult]);

  const isDescriptionFormValid = useMemo(
    () => descriptionForm.title.trim() && descriptionForm.category.trim(),
    [descriptionForm]
  );

  /* ===========================================================
     TOOL 2 — AI TAG GENERATOR
  =========================================================== */

  const [tagsForm, setTagsForm] = useState({ title: "", description: "", technologies: "" });
  const [tagsResult, setTagsResult] = useState([]);
  const [tagsStatus, setTagsStatus] = useState("idle");
  const [copiedTag, setCopiedTag] = useState(null);

  const handleTagsFieldChange = useCallback((field) => (e) => {
    const { value } = e.target;
    setTagsForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const generateTags = useCallback(async () => {
    setTagsStatus("loading");
    try {
      const response = await api.post("/ai/aiTags", {
        title: tagsForm.title.trim(),
        description: tagsForm.description.trim(),
        technologies: csvToArray(tagsForm.technologies),
      });
      setTagsResult(extractArray(response.data));
      setTagsStatus("success");
    } catch (error) {
      setTagsStatus("error");
    }
  }, [tagsForm]);

  const handleCopyTag = useCallback((tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1200);
  }, []);

  const isTagsFormValid = useMemo(() => tagsForm.title.trim() && tagsForm.description.trim(), [tagsForm]);

  /* ===========================================================
     TOOL 3 — AI PROJECT REVIEW
  =========================================================== */

  const [reviewForm, setReviewForm] = useState({ title: "", description: "", technologies: "", category: "" });
  const [reviewResult, setReviewResult] = useState(null); // { strengths, weaknesses, suggestions }
  const [reviewStatus, setReviewStatus] = useState("idle");

  const handleReviewFieldChange = useCallback((field) => (e) => {
    const { value } = e.target;
    setReviewForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const generateReview = useCallback(async () => {
    setReviewStatus("loading");
    try {
      const response = await api.post("/ai/aiReview", {
        title: reviewForm.title.trim(),
        description: reviewForm.description.trim(),
        technologies: csvToArray(reviewForm.technologies),
        category: reviewForm.category.trim(),
      });
      const data = response.data?.data ?? response.data ?? {};
      setReviewResult({
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      });
      setReviewStatus("success");
    } catch (error) {
      setReviewStatus("error");
    }
  }, [reviewForm]);

  const isReviewFormValid = useMemo(
    () => reviewForm.title.trim() && reviewForm.description.trim(),
    [reviewForm]
  );

  /* ===========================================================
     MAIN RENDER
  =========================================================== */

  return (
    <div className="min-h-screen bg-[#030712] px-4 py-10 sm:px-6 lg:px-10">
      <motion.div variants={pageVariants} initial="hidden" animate="show" className="mx-auto max-w-6xl">
        {/* ===========================================================
            HERO SECTION
        =========================================================== */}
        <motion.div variants={fadeUp} className="relative mb-10 overflow-hidden rounded-3xl px-4 py-14 text-center sm:py-16">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-600/25 blur-[100px]" />
          <div className="pointer-events-none absolute right-1/4 bottom-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-[100px]" />

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative flex items-center justify-center gap-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
          >
            <Sparkles className="h-8 w-8 text-cyan-300" />
            AI{" "}
            <span className="bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Tools</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative mx-auto mt-4 max-w-xl text-sm sm:text-base text-white/50"
          >
            Build better projects with the power of AI. Generate descriptions, tags, project reviews and chat with
            ProjectSphere AI.
          </motion.p>
        </motion.div>

        {/* ===========================================================
            FOUR TOOL SELECTOR CARDS
        =========================================================== */}
        <motion.div
          variants={cardGridStagger}
          initial="hidden"
          animate="show"
          className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <motion.button
                key={tool.id}
                variants={cardVariant}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTool(tool.id)}
                className={`relative overflow-hidden rounded-3xl border p-5 text-left backdrop-blur-xl transition-colors duration-300 ${
                  isActive
                    ? "border-purple-400/40 bg-linear-to-br from-purple-500/15 to-cyan-500/15 shadow-[0_0_40px_-12px_rgba(168,85,247,0.5)]"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tool-glow"
                    className="pointer-events-none absolute inset-0 bg-linear-to-br from-purple-500/10 to-cyan-500/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border ${
                    isActive ? "border-cyan-400/30 bg-cyan-500/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-cyan-300" : "text-white/60"}`} />
                </div>
                <h3 className="relative mt-3 text-sm font-semibold text-white/90">{tool.title}</h3>
                <p className="relative mt-1 text-xs text-white/45 leading-relaxed">{tool.description}</p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ===========================================================
            ACTIVE TOOL PANEL
        =========================================================== */}
        <AnimatePresence mode="wait">
          {/* -----------------------------------------------------------
              TOOL 1: AI DESCRIPTION GENERATOR
          ----------------------------------------------------------- */}
          {activeTool === "description" && (
            <motion.div
              key="description-panel"
              variants={panelVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-white/90 mb-5">AI Description Generator</h2>
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Project Title</FieldLabel>
                    <input
                      type="text"
                      value={descriptionForm.title}
                      onChange={handleDescriptionFieldChange("title")}
                      placeholder="ProjectSphere"
                      className={inputBaseClasses}
                    />
                  </div>
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <input
                      type="text"
                      value={descriptionForm.category}
                      onChange={handleDescriptionFieldChange("category")}
                      placeholder="Web Development"
                      className={inputBaseClasses}
                    />
                  </div>
                  <div>
                    <FieldLabel>Technologies</FieldLabel>
                    <input
                      type="text"
                      value={descriptionForm.technologies}
                      onChange={handleDescriptionFieldChange("technologies")}
                      placeholder="React, Node.js, MongoDB"
                      className={inputBaseClasses}
                    />
                  </div>
                  <div>
                    <FieldLabel>Features</FieldLabel>
                    <textarea
                      rows={5}
                      value={descriptionForm.features}
                      onChange={handleDescriptionFieldChange("features")}
                      placeholder="Describe the key features of your project..."
                      className={`${inputBaseClasses} resize-none`}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={generateDescription}
                    disabled={!isDescriptionFormValid || descriptionStatus === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Description
                  </motion.button>
                </div>
              </div>

              {/* Result panel */}
              <div>
                {descriptionStatus === "loading" && <ResultShimmer />}
                {descriptionStatus === "error" && (
                  <RetryCard message="Couldn't generate a description. Please try again." onRetry={generateDescription} />
                )}
                {descriptionStatus === "idle" && (
                  <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-white/30">
                    Your generated description will appear here.
                  </div>
                )}
                {descriptionStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Generated Description</h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyDescription}
                        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 transition-colors"
                      >
                        {descriptionCopied ? <Check className="h-3.5 w-3.5 text-cyan-300" /> : <Copy className="h-3.5 w-3.5" />}
                        {descriptionCopied ? "Copied" : "Copy"}
                      </motion.button>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{descriptionResult}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* -----------------------------------------------------------
              TOOL 2: AI TAG GENERATOR
          ----------------------------------------------------------- */}
          {activeTool === "tags" && (
            <motion.div
              key="tags-panel"
              variants={panelVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-white/90 mb-5">AI Tag Generator</h2>
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <input
                      type="text"
                      value={tagsForm.title}
                      onChange={handleTagsFieldChange("title")}
                      placeholder="ProjectSphere"
                      className={inputBaseClasses}
                    />
                  </div>
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      rows={4}
                      value={tagsForm.description}
                      onChange={handleTagsFieldChange("description")}
                      placeholder="A short description of your project..."
                      className={`${inputBaseClasses} resize-none`}
                    />
                  </div>
                  <div>
                    <FieldLabel>Technologies</FieldLabel>
                    <input
                      type="text"
                      value={tagsForm.technologies}
                      onChange={handleTagsFieldChange("technologies")}
                      placeholder="React, MongoDB, Cloudinary"
                      className={inputBaseClasses}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={generateTags}
                    disabled={!isTagsFormValid || tagsStatus === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Tags
                  </motion.button>
                </div>
              </div>

              {/* Result panel */}
              <div>
                {tagsStatus === "loading" && <ResultShimmer />}
                {tagsStatus === "error" && (
                  <RetryCard message="Couldn't generate tags. Please try again." onRetry={generateTags} />
                )}
                {tagsStatus === "idle" && (
                  <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-white/30">
                    Your generated tags will appear here.
                  </div>
                )}
                {tagsStatus === "success" && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">Generated Tags</h3>
                    {tagsResult.length === 0 ? (
                      <p className="text-sm text-white/40">No tags were returned.</p>
                    ) : (
                      <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                        className="flex flex-wrap gap-2.5"
                      >
                        {tagsResult.map((tag, idx) => (
                          <motion.button
                            key={`${tag}-${idx}`}
                            variants={pillVariants}
                            whileHover={{ scale: 1.08, y: -2 }}
                            onClick={() => handleCopyTag(tag)}
                            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-linear-to-r from-purple-500/10 to-cyan-500/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-md hover:border-purple-400/40 hover:from-purple-500/20 hover:to-cyan-500/20 transition-colors"
                          >
                            {copiedTag === tag ? <Check className="h-3 w-3 text-cyan-300" /> : <Copy className="h-3 w-3 text-white/30" />}
                            {tag}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* -----------------------------------------------------------
              TOOL 3: AI PROJECT REVIEW
          ----------------------------------------------------------- */}
          {activeTool === "review" && (
            <motion.div key="review-panel" variants={panelVariants} initial="hidden" animate="show" exit="exit">
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 mb-6">
                <h2 className="text-lg font-semibold text-white/90 mb-5">AI Project Review</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={handleReviewFieldChange("title")}
                      placeholder="ProjectSphere"
                      className={inputBaseClasses}
                    />
                  </div>
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <input
                      type="text"
                      value={reviewForm.category}
                      onChange={handleReviewFieldChange("category")}
                      placeholder="Web Development"
                      className={inputBaseClasses}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      rows={4}
                      value={reviewForm.description}
                      onChange={handleReviewFieldChange("description")}
                      placeholder="Describe your project..."
                      className={`${inputBaseClasses} resize-none`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Technologies</FieldLabel>
                    <input
                      type="text"
                      value={reviewForm.technologies}
                      onChange={handleReviewFieldChange("technologies")}
                      placeholder="React, Node.js, MongoDB"
                      className={inputBaseClasses}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={generateReview}
                  disabled={!isReviewFormValid || reviewStatus === "loading"}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:ml-auto"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Review Project
                </motion.button>
              </div>

              {reviewStatus === "loading" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <ResultShimmer />
                  <ResultShimmer />
                  <ResultShimmer />
                </div>
              )}

              {reviewStatus === "error" && (
                <RetryCard message="Couldn't generate a review. Please try again." onRetry={generateReview} />
              )}

              {reviewStatus === "success" && reviewResult && (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-5"
                >
                  {/* Strengths */}
                  <motion.div variants={fadeUp} className="rounded-3xl border border-emerald-400/20 bg-emerald-500/5 backdrop-blur-xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-300">
                      <ThumbsUp className="h-4 w-4" />
                      Strengths
                    </h3>
                    <ul className="space-y-2.5">
                      {reviewResult.strengths.length === 0 && <li className="text-xs text-white/30">No strengths returned.</li>}
                      {reviewResult.strengths.map((item, idx) => (
                        <motion.li key={idx} variants={listItemVariants} className="text-sm text-white/75 leading-relaxed">
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Weaknesses */}
                  <motion.div variants={fadeUp} className="rounded-3xl border border-red-400/20 bg-red-500/5 backdrop-blur-xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-red-300">
                      <ThumbsDown className="h-4 w-4" />
                      Weaknesses
                    </h3>
                    <ul className="space-y-2.5">
                      {reviewResult.weaknesses.length === 0 && <li className="text-xs text-white/30">No weaknesses returned.</li>}
                      {reviewResult.weaknesses.map((item, idx) => (
                        <motion.li key={idx} variants={listItemVariants} className="text-sm text-white/75 leading-relaxed">
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Suggestions */}
                  <motion.div variants={fadeUp} className="rounded-3xl border border-cyan-400/20 bg-cyan-500/5 backdrop-blur-xl p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-300">
                      <Lightbulb className="h-4 w-4" />
                      Suggestions
                    </h3>
                    <ul className="space-y-2.5">
                      {reviewResult.suggestions.length === 0 && <li className="text-xs text-white/30">No suggestions returned.</li>}
                      {reviewResult.suggestions.map((item, idx) => (
                        <motion.li key={idx} variants={listItemVariants} className="text-sm text-white/75 leading-relaxed">
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* -----------------------------------------------------------
              TOOL 4: AI ASSISTANT (separate component)
          ----------------------------------------------------------- */}
          {activeTool === "chat" && (
            <motion.div key="chat-panel" variants={panelVariants} initial="hidden" animate="show" exit="exit">
              <AIChat />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}