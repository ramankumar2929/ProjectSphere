import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {FaGithub} from "react-icons/fa"
import {FaLinkedin} from "react-icons/fa"
import {
  Camera,
  User,
  Mail,
  CalendarDays,
  Gauge,
  Check,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileText,
  AlertTriangle,
} from "lucide-react";
import api from "../services/api.js"; // adjust to your actual axios instance path

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const FULL_NAME_MAX = 50;
const BIO_MAX = 300;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/* ------------------------------------------------------------------ */
/* Animation variants                                                  */
/* ------------------------------------------------------------------ */

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/* ------------------------------------------------------------------ */
/* Helpers (pure, no side effects)                                     */
/* ------------------------------------------------------------------ */

/** Prepends https:// to a URL-like string if no protocol is present. */
function ensureHttpsPrefix(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Builds the initial form state from a fetched user object. */
function buildFormFromUser(user) {
  return {
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    skills: Array.isArray(user?.skills) ? user.skills.join(", ") : user?.skills || "",
    github: user?.github || "",
    linkedIn: user?.linkedIn || "",
  };
}

/** Validates the form, returning a field -> message map (empty = valid). */
function validateForm(form) {
  const errors = {};
  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (form.fullName.length > FULL_NAME_MAX) {
    errors.fullName = `Full name must be ${FULL_NAME_MAX} characters or fewer.`;
  }
  if (form.bio.length > BIO_MAX) {
    errors.bio = `Bio must be ${BIO_MAX} characters or fewer.`;
  }
  return errors;
}

/** Returns only the fields that changed between original and current form. */
function diffFormValues(original, current) {
  const diff = {};
  if (original.fullName !== current.fullName) diff.Fullname = current.fullName.trim();
  if (original.bio !== current.bio) diff.bio = current.bio.trim();
  if (original.skills !== current.skills) diff.skills = current.skills.trim();
  if (original.github !== current.github) diff.github = current.github.trim();
  if (original.linkedIn !== current.linkedIn) diff.linkedIn = current.linkedIn.trim();
  return diff;
}

function validateAvatarFile(file) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return "Only JPG, PNG, or WEBP images are allowed.";
  }
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

function formatMemberSince(isoDate) {
  if (!isoDate) return null;
  return new Date(isoDate).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function hasSkills(skillsString) {
  return skillsString.split(",").map((s) => s.trim()).filter(Boolean).length > 0;
}

function calculateCompletion({ form, avatarUrl }) {
  const items = [
    { key: "avatar", label: "Avatar", done: Boolean(avatarUrl) },
    { key: "bio", label: "Bio", done: Boolean(form.bio.trim()) },
    { key: "github", label: "GitHub", done: Boolean(form.github.trim()) },
    { key: "linkedIn", label: "LinkedIn", done: Boolean(form.linkedIn.trim()) },
    { key: "skills", label: "Skills", done: hasSkills(form.skills) },
  ];
  const percent = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  return { items, percent };
}

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
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

function FloatingField({ id, label, error, children }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

const inputBaseClasses =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 placeholder:text-white/25 outline-none backdrop-blur-md transition-colors focus:border-purple-400/50 focus:bg-white/[0.07]";

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

function LeaveConfirmModal({ open, onStay, onLeave }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0a0f1c] p-6 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-white/90">You have unsaved changes.</h3>
            <p className="mt-1.5 text-sm text-white/50">Leave without saving?</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onStay}
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                Stay
              </button>
              <button
                onClick={onLeave}
                className="flex-1 rounded-full bg-linear-to-r from-red-500 to-orange-400 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Leave
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [pageStatus, setPageStatus] = useState("loading"); // loading | success | error

  const [form, setForm] = useState({ fullName: "", bio: "", skills: "", github: "", linkedIn: "" });
  const [initialForm, setInitialForm] = useState(null);
  const [errors, setErrors] = useState({});

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState("");

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingNavigation, setPendingNavigation] = useState(false);

  /* ---------------------- Fetch current user ---------------------- */

  const fetchUser = useCallback(async () => {
    setPageStatus("loading");
    try {
      const response = await api.get("/users/currentuser");
      const userData = response.data?.data ?? response.data;
      const initial = buildFormFromUser(userData);
      setUser(userData);
      setForm(initial);
      setInitialForm(initial);
      setAvatarPreview(userData?.avatar || null);
      setPageStatus("success");
    } catch (error) {
      setPageStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Clean up the object URL created for avatar previews.
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  /* ---------------------------- Dirty state ------------------------- */

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    return Object.keys(diffFormValues(initialForm, form)).length > 0 || Boolean(avatarFile);
  }, [initialForm, form, avatarFile]);

  // Warn on tab close / refresh with unsaved changes.
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  /* ------------------------------ Handlers --------------------------- */

  const handleFieldChange = useCallback((field) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleUrlFieldBlur = useCallback((field) => () => {
    setForm((prev) => {
      if (!prev[field].trim()) return prev;
      return { ...prev, [field]: ensureHttpsPrefix(prev[field]) };
    });
  }, []);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationMessage = validateAvatarFile(file);
    if (validationMessage) {
      setAvatarError(validationMessage);
      return;
    }

    setAvatarError("");
    setAvatarFile(file);
    setAvatarPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  const handleSave = useCallback(async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      // 1. Upload avatar first, if changed.
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", avatarFile);
        await api.post("/users/updateavatar", avatarFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 2. Send only the fields that actually changed.
      const changedFields = diffFormValues(initialForm, form);
      if (Object.keys(changedFields).length > 0) {
        await api.post("/users/updateProfile", changedFields);
      }

      setToast({ type: "success", message: "Profile updated successfully" });
      setSaving(false);
      setTimeout(() => navigate("/profile"), 1000);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message || "Something went wrong. Please try again.";
      setToast({ type: "error", message: backendMessage });
      setSaving(false);
    }
  }, [form, initialForm, avatarFile, navigate]);

  const handleCancelClick = useCallback(() => {
    if (isDirty) {
      setPendingNavigation(true);
    } else {
      navigate("/profile");
    }
  }, [isDirty, navigate]);

  /* ------------------------------- Derived ---------------------------- */

  const memberSince = formatMemberSince(user?.createdAt);
  const completion = useMemo(
    () => calculateCompletion({ form, avatarUrl: avatarPreview }),
    [form, avatarPreview]
  );

  /* --------------------------------------------------------------------
     Loading state
  -------------------------------------------------------------------- */
  if (pageStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#030712] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 lg:col-span-1">
            <Shimmer className="mx-auto h-28 w-28 rounded-full mb-5" />
            <Shimmer className="h-4 w-32 mx-auto mb-2.5" />
            <Shimmer className="h-3 w-24 mx-auto mb-2.5" />
            <Shimmer className="h-3 w-40 mx-auto" />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 lg:col-span-2 space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------------
     Error state
  -------------------------------------------------------------------- */
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
          <h2 className="text-lg font-semibold text-white/90">Unable to load profile.</h2>
          <p className="mt-1.5 text-sm text-white/50">Please try again.</p>
          <motion.button
            onClick={fetchUser}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/20"
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* --------------------------------------------------------------------
     Main form
  -------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#030712] px-4 py-10 sm:px-6 lg:px-10">
      <AnimatePresence>{toast && <Toast toast={toast} onClose={closeToast} />}</AnimatePresence>

      <LeaveConfirmModal
        open={pendingNavigation}
        onStay={() => setPendingNavigation(false)}
        onLeave={() => navigate("/profile")}
      />

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-6xl"
      >
        <motion.div variants={fadeUp} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Profile</h1>
          <p className="mt-1 text-sm text-white/50">Update your public profile information.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ============== LEFT: Profile Preview ============== */}
          <motion.section
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 lg:col-span-1 h-fit"
          >
            <div className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              <motion.button
                type="button"
                onClick={handleAvatarClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="group relative"
              >
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500 to-cyan-400 blur-md opacity-60" />
                <img
                  src={avatarPreview || "/default-avatar.png"}
                  alt="Avatar preview"
                  className="relative h-32 w-32 rounded-full object-cover border-2 border-white/20"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-cyan-400 border-2 border-[#0a0f1c] shadow-lg">
                  <Camera className="h-3.5 w-3.5 text-white" />
                </div>
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <p className="mt-4 text-xs text-white/40 leading-relaxed">
                Allowed: JPG, PNG, WEBP
                <br />
                Max size: 5 MB
              </p>
              {avatarError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-red-400">
                  {avatarError}
                </motion.p>
              )}

              <h2 className="mt-5 text-lg font-semibold text-white/90 truncate max-w-full">
                {form.fullName || user?.fullName || "Unnamed User"}
              </h2>
              <p className="text-sm font-medium bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                @{user?.username}
              </p>

              <div className="mt-4 w-full space-y-2 text-left">
                <div className="flex items-center gap-2.5 text-xs text-white/50">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                {memberSince && (
                  <div className="flex items-center gap-2.5 text-xs text-white/50">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span>Joined {memberSince}</span>
                  </div>
                )}
              </div>

              {/* Profile completion */}
              <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Profile Completion
                  </span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xl font-bold bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {completion.percent}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completion.percent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-linear-to-r from-purple-500 to-cyan-400"
                  />
                </div>
                <ul className="space-y-1.5">
                  {completion.items.map(({ key, label, done }) => (
                    <li key={key} className="flex items-center gap-2 text-xs">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          done
                            ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
                            : "border-white/10 bg-white/5 text-white/30"
                        }`}
                      >
                        {done ? <Check className="h-2.5 w-2.5" /> : <XmarkIcon />}
                      </span>
                      <span className={done ? "text-white/70" : "text-white/35"}>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* ============== RIGHT: Edit Form ============== */}
          <motion.section
            variants={fadeUp}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 lg:col-span-2"
          >
            <fieldset disabled={saving} className="space-y-6 disabled:opacity-60">
              <FloatingField id="fullName" label="Full Name" error={errors.fullName}>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    id="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleFieldChange("fullName")}
                    maxLength={FULL_NAME_MAX}
                    placeholder="Your full name"
                    className={`${inputBaseClasses} pl-11`}
                  />
                </div>
                <p className="mt-1 text-right text-[11px] text-white/30">
                  {form.fullName.length}/{FULL_NAME_MAX}
                </p>
              </FloatingField>

              <FloatingField id="bio" label="Bio" error={errors.bio}>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-white/30" />
                  <textarea
                    id="bio"
                    rows={4}
                    value={form.bio}
                    onChange={handleFieldChange("bio")}
                    maxLength={BIO_MAX}
                    placeholder="Tell others a little about yourself..."
                    className={`${inputBaseClasses} pl-11 resize-none`}
                  />
                </div>
                <p className="mt-1 text-right text-[11px] text-white/30">
                  {form.bio.length}/{BIO_MAX}
                </p>
              </FloatingField>

              <FloatingField id="skills" label="Skills">
                <div className="relative">
                  <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    id="skills"
                    type="text"
                    value={form.skills}
                    onChange={handleFieldChange("skills")}
                    placeholder="React, Node.js, MongoDB, Express"
                    className={`${inputBaseClasses} pl-11`}
                  />
                </div>
                <p className="mt-1 text-[11px] text-white/30">Separate skills with commas.</p>
              </FloatingField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FloatingField id="github" label="GitHub">
                  <div className="relative">
                    <FaGithub className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      id="github"
                      type="text"
                      value={form.github}
                      onChange={handleFieldChange("github")}
                      onBlur={handleUrlFieldBlur("github")}
                      placeholder="github.com/yourusername"
                      className={`${inputBaseClasses} pl-11`}
                    />
                  </div>
                </FloatingField>

                <FloatingField id="linkedIn" label="LinkedIn">
                  <div className="relative">
                    <FaLinkedin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      id="linkedIn"
                      type="text"
                      value={form.linkedIn}
                      onChange={handleFieldChange("linkedIn")}
                      onBlur={handleUrlFieldBlur("linkedIn")}
                      placeholder="linkedin.com/in/yourusername"
                      className={`${inputBaseClasses} pl-11`}
                    />
                  </div>
                </FloatingField>
              </div>
            </fieldset>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <motion.button
                type="button"
                onClick={handleCancelClick}
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </motion.button>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
}

/** Small inline "X" icon sized to match the completion checklist bullets. */
function XmarkIcon() {
  return <X className="h-2.5 w-2.5" />;
}