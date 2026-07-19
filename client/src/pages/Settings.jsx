import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import {
  User,
  Palette,
  Bell,
  Lock,
  UserCog,
  Info,
  Camera,
  Check,
  X,
   
  KeyRound,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

/* ===========================================================
   CONSTANTS
=========================================================== */

const SIDEBAR_ITEMS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "account", label: "Account", icon: UserCog },
  { id: "about", label: "About", icon: Info },
];

const ACCENT_COLORS = [
  { id: "purple", label: "Purple", swatch: "from-purple-500 to-purple-400" },
  { id: "blue", label: "Blue", swatch: "from-blue-500 to-blue-400" },
  { id: "cyan", label: "Cyan", swatch: "from-cyan-500 to-cyan-400" },
  { id: "emerald", label: "Emerald", swatch: "from-emerald-500 to-emerald-400" },
];

const NOTIFICATION_TOGGLES = [
  { id: "projectLikes", label: "Project Likes", description: "Get notified when someone likes your project." },
  { id: "comments", label: "Comments", description: "Get notified about new comments on your projects." },
  { id: "newFollowers", label: "New Followers", description: "Get notified when someone follows you." },
  { id: "invitations", label: "Invitations", description: "Get notified about team invitations." },
  { id: "announcements", label: "Announcements", description: "Get notified about ProjectSphere news." },
];

const PRIVACY_TOGGLES = [
  { id: "publicProfile", label: "Public Profile", description: "Allow anyone to view your profile." },
  { id: "showEmail", label: "Show Email", description: "Display your email on your public profile." },
  { id: "allowCollabRequests", label: "Allow Collaboration Requests", description: "Let others invite you to projects." },
  { id: "showStats", label: "Show Project Statistics", description: "Display views, likes, and comments publicly." },
];

const TECH_STACK = ["React", "Node.js", "Express", "MongoDB", "TailwindCSS", "Framer Motion", "Cloudinary"];

const APP_VERSION = "Version 1.0";
const GITHUB_URL = "https://github.com";

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

const panelVariants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.2 } },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/* ===========================================================
   PURE HELPER FUNCTIONS
=========================================================== */

/** Builds the initial boolean state map for a group of toggles, all defaulting to true. */
function buildDefaultToggleState(toggleDefs) {
  return toggleDefs.reduce((acc, toggle) => {
    acc[toggle.id] = true;
    return acc;
  }, {});
}

/* ===========================================================
   REUSABLE STYLED PIECES
   (Switch, Card wrapper, section heading — all local to this
   file per the single-file requirement)
=========================================================== */

function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 ${
        checked ? "border-purple-400/40 bg-linear-to-r from-purple-500 to-cyan-400" : "border-white/15 bg-white/10"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
        style={{ left: checked ? "calc(100% - 1.375rem)" : "0.125rem" }}
      />
    </button>
  );
}

function SettingsCard({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-7 ${className}`}>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0 border-b border-white/5 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/85">{label}</p>
        {description && <p className="mt-0.5 text-xs text-white/40">{description}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
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

export default function Settings() {
  /* ----------------------- Sidebar navigation ----------------------- */
  const [activeSection, setActiveSection] = useState("profile");

  /* ===========================================================
     SECTION 1 STATE — PROFILE
     Demo/placeholder values only — nothing is sent anywhere.
  =========================================================== */

  const [profileForm, setProfileForm] = useState({
    fullName: "Raman Bishnoi",
    username: "raman2929",
    bio: "Full Stack Developer building things with React and Node.js.",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);
  const [toast, setToast] = useState(null);

  const handleProfileFieldChange = useCallback((field) => (e) => {
    const { value } = e.target;
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAvatarSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleSaveProfile = useCallback(() => {
    // Frontend-only demo — no API call, just confirms visually.
    showToast("Profile updated successfully.");
  }, [showToast]);

  /* ===========================================================
     SECTION 2 STATE — APPEARANCE
  =========================================================== */

  const [darkMode, setDarkMode] = useState(true);
  const [accentColor, setAccentColor] = useState("purple");

  /* ===========================================================
     SECTION 3 STATE — NOTIFICATIONS
  =========================================================== */

  const [notificationToggles, setNotificationToggles] = useState(() => buildDefaultToggleState(NOTIFICATION_TOGGLES));

  const handleNotificationToggle = useCallback((id) => (value) => {
    setNotificationToggles((prev) => ({ ...prev, [id]: value }));
  }, []);

  /* ===========================================================
     SECTION 4 STATE — PRIVACY
  =========================================================== */

  const [privacyToggles, setPrivacyToggles] = useState(() => buildDefaultToggleState(PRIVACY_TOGGLES));

  const handlePrivacyToggle = useCallback((id) => (value) => {
    setPrivacyToggles((prev) => ({ ...prev, [id]: value }));
  }, []);

  /* ===========================================================
     SECTION 5 STATE — ACCOUNT
  =========================================================== */

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleConfirmDelete = useCallback(() => {
    // Demo only — deleting does nothing.
    setShowDeleteModal(false);
  }, []);

  /* ===========================================================
     DERIVED VALUES
  =========================================================== */

  const activeItem = useMemo(() => SIDEBAR_ITEMS.find((item) => item.id === activeSection), [activeSection]);

  /* ===========================================================
     MAIN RENDER
  =========================================================== */

  return (
    <div className="min-h-screen bg-[#030712] px-4 py-10 sm:px-6 lg:px-10">
      {/* ===========================================================
          TOAST
      =========================================================== */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3.5 text-cyan-100 backdrop-blur-xl shadow-2xl"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-300" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===========================================================
          DELETE ACCOUNT CONFIRMATION MODAL
      =========================================================== */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowDeleteModal(false)}
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
              <h3 className="text-lg font-semibold text-white/90">Are you sure?</h3>
              <p className="mt-2 text-sm text-white/50 leading-relaxed">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-red-500 to-orange-400 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={pageVariants} initial="hidden" animate="show" className="mx-auto max-w-6xl">
        {/* ===========================================================
            HERO SECTION
        =========================================================== */}
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-white/50">Customize your ProjectSphere experience.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* ===========================================================
              SIDEBAR
              Desktop: vertical nav. Mobile: horizontal scroll row.
          =========================================================== */}
          <motion.nav
            variants={fadeUp}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 lg:h-fit lg:sticky lg:top-6"
          >
            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible scrollbar-none [&::-webkit-scrollbar]:hidden">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`relative flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                      isActive ? "text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="settings-active-nav"
                        className="absolute inset-0 rounded-2xl bg-linear-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon className={`relative h-4 w-4 ${isActive ? "text-cyan-300" : ""}`} />
                    <span className="relative whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.nav>

          {/* ===========================================================
              RIGHT SETTINGS PANEL
              Each section slides/fades in via AnimatePresence.
          =========================================================== */}
          <motion.div variants={fadeUp}>
            <AnimatePresence mode="wait">
              {/* -----------------------------------------------------------
                  SECTION 1: PROFILE
              ----------------------------------------------------------- */}
              {activeSection === "profile" && (
                <motion.div key="profile" variants={panelVariants} initial="hidden" animate="show" exit="exit">
                  <SettingsCard>
                    <h2 className="text-lg font-semibold text-white/90 mb-6">Profile</h2>

                    {/* Avatar */}
                    <div className="mb-6 flex items-center gap-5">
                      <motion.button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        className="group relative"
                      >
                        <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-500 to-cyan-400 blur-md opacity-50" />
                        <img
                          src={avatarPreview || "/default-avatar.png"}
                          alt="Avatar preview"
                          className="relative h-20 w-20 rounded-full object-cover border-2 border-white/20"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                      </motion.button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                      />
                      <div>
                        <p className="text-sm font-medium text-white/80">Profile Photo</p>
                        <p className="text-xs text-white/40">Preview only — nothing is uploaded.</p>
                      </div>
                    </div>

                    {/* Form fields */}
                    <div className="space-y-5">
                      <div>
                        <FieldLabel>Full Name</FieldLabel>
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={handleProfileFieldChange("fullName")}
                          className={inputBaseClasses}
                        />
                      </div>
                      <div>
                        <FieldLabel>Username</FieldLabel>
                        <input
                          type="text"
                          value={profileForm.username}
                          onChange={handleProfileFieldChange("username")}
                          className={inputBaseClasses}
                        />
                      </div>
                      <div>
                        <FieldLabel>Bio</FieldLabel>
                        <textarea
                          rows={4}
                          value={profileForm.bio}
                          onChange={handleProfileFieldChange("bio")}
                          className={`${inputBaseClasses} resize-none`}
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSaveProfile}
                      className="mt-6 rounded-full bg-linear-to-r from-purple-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20"
                    >
                      Save Changes
                    </motion.button>
                  </SettingsCard>
                </motion.div>
              )}

              {/* -----------------------------------------------------------
                  SECTION 2: APPEARANCE
              ----------------------------------------------------------- */}
              {activeSection === "appearance" && (
                <motion.div key="appearance" variants={panelVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
                  <SettingsCard>
                    <h2 className="text-lg font-semibold text-white/90 mb-4">Theme</h2>
                    <ToggleRow
                      label="Dark Mode"
                      description="ProjectSphere is designed dark-first."
                      checked={darkMode}
                      onChange={setDarkMode}
                    />
                  </SettingsCard>

                  <SettingsCard>
                    <h2 className="text-lg font-semibold text-white/90 mb-5">Accent Color</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {ACCENT_COLORS.map((color) => {
                        const isSelected = accentColor === color.id;
                        return (
                          <motion.button
                            key={color.id}
                            type="button"
                            onClick={() => setAccentColor(color.id)}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.96 }}
                            className={`relative flex flex-col items-center gap-3 rounded-2xl border p-4 transition-colors ${
                              isSelected ? "border-white/30 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className={`h-10 w-10 rounded-full bg-linear-to-br ${color.swatch} shadow-lg`} />
                            <span className="text-xs font-medium text-white/75">{color.label}</span>
                            {isSelected && (
                              <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </SettingsCard>
                </motion.div>
              )}

              {/* -----------------------------------------------------------
                  SECTION 3: NOTIFICATIONS
              ----------------------------------------------------------- */}
              {activeSection === "notifications" && (
                <motion.div key="notifications" variants={panelVariants} initial="hidden" animate="show" exit="exit">
                  <SettingsCard>
                    <h2 className="text-lg font-semibold text-white/90 mb-3">Notifications</h2>
                    <div>
                      {NOTIFICATION_TOGGLES.map((toggle) => (
                        <ToggleRow
                          key={toggle.id}
                          label={toggle.label}
                          description={toggle.description}
                          checked={notificationToggles[toggle.id]}
                          onChange={handleNotificationToggle(toggle.id)}
                        />
                      ))}
                    </div>
                  </SettingsCard>
                </motion.div>
              )}

              {/* -----------------------------------------------------------
                  SECTION 4: PRIVACY
              ----------------------------------------------------------- */}
              {activeSection === "privacy" && (
                <motion.div key="privacy" variants={panelVariants} initial="hidden" animate="show" exit="exit">
                  <SettingsCard>
                    <h2 className="text-lg font-semibold text-white/90 mb-3">Privacy</h2>
                    <div>
                      {PRIVACY_TOGGLES.map((toggle) => (
                        <ToggleRow
                          key={toggle.id}
                          label={toggle.label}
                          description={toggle.description}
                          checked={privacyToggles[toggle.id]}
                          onChange={handlePrivacyToggle(toggle.id)}
                        />
                      ))}
                    </div>
                  </SettingsCard>
                </motion.div>
              )}

              {/* -----------------------------------------------------------
                  SECTION 5: ACCOUNT
              ----------------------------------------------------------- */}
              {activeSection === "account" && (
                <motion.div
                  key="account"
                  variants={panelVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="space-y-4"
                >
                  <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                    <motion.div variants={listItem}>
                      <SettingsCard className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                            <KeyRound className="h-4.5 w-4.5 text-white/60" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/85">Change Password</p>
                            <p className="text-xs text-white/40">Update your account password.</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
                        >
                          Change Password
                        </motion.button>
                      </SettingsCard>
                    </motion.div>

                    <motion.div variants={listItem}>
                      <SettingsCard className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                            <Download className="h-4.5 w-4.5 text-white/60" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/85">Export My Data</p>
                            <p className="text-xs text-white/40">Download a copy of your ProjectSphere data.</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
                        >
                          Export My Data
                        </motion.button>
                      </SettingsCard>
                    </motion.div>

                    <motion.div variants={listItem}>
                      <SettingsCard className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-red-400/20">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10">
                            <Trash2 className="h-4.5 w-4.5 text-red-300" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/85">Delete Account</p>
                            <p className="text-xs text-white/40">Permanently remove your account and all data.</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setShowDeleteModal(true)}
                          className="flex items-center gap-2 rounded-full bg-linear-to-r from-red-500 to-orange-400 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </motion.button>
                      </SettingsCard>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* -----------------------------------------------------------
                  SECTION 6: ABOUT
              ----------------------------------------------------------- */}
              {activeSection === "about" && (
                <motion.div key="about" variants={panelVariants} initial="hidden" animate="show" exit="exit">
                  <SettingsCard className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-purple-500 to-cyan-400 shadow-lg shadow-purple-500/20">
                      <span className="text-2xl font-bold text-white">P</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">ProjectSphere</h2>
                    <p className="mt-1 text-sm text-white/40">{APP_VERSION}</p>

                    <div className="mt-6">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">Built With</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {TECH_STACK.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/70"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <motion.a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
                    >
                      <FaGithub className="h-4 w-4" />
                      View on GitHub
                    </motion.a>
                  </SettingsCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}