 import { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Menu,
  X,
  User,
  FolderKanban,
  Bookmark,
  BarChart3,
  Settings,
  LogOut,
  Layers,
  Sparkles,
  Check,
  XCircle,
  Heart,
  MessageCircle,
  UserPlus,
} from "lucide-react";

/**
 * ── Backend wiring notes ──────────────────────────────────────────────
 * Base URL comes from VITE_API_URL — adjust the fallback below if your
 * server runs on a different port.
 *
 * Endpoints assumed from your route files:
 *   GET  /users/me                    (user.routes.js)
 *   GET  /projects/search?q=          (project routes)
 *   GET  /invitations                 (invitation.routes.js)
 *   PATCH /invitations/:id/accept     (invitation.routes.js)
 *   PATCH /invitations/:id/reject     (invitation.routes.js)
 *   GET  /likes/notifications         (like.router.js)
 *   GET  /comments/notifications      (comment.routes.js)
 *
 * If your actual paths differ, only the API_ROUTES object below needs
 * to change — every fetch call reads from it.
 * ───────────────────────────────────────────────────────────────────── */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8500/api/v1";

const API_ROUTES = {
  me: `${BASE_URL}/users/currentuser`,
  search: (q) => `${BASE_URL}/projects/search?q=${encodeURIComponent(q)}`,
  invitations: `${BASE_URL}/invitations`,
  acceptInvitation: (id) => `${BASE_URL}/invitations/${id}/accept`,
  rejectInvitation: (id) => `${BASE_URL}/invitations/${id}/reject`,
  likeNotifications: `${BASE_URL}/likes/notifications`,
  commentNotifications: `${BASE_URL}/comments/notifications`,
  logout: `${BASE_URL}/users/logout`,
};

const NAV_LINKS = [
  { label: "Home", to: "/home" },
  { label: "Projects", to: "/projects" },
  { label: "Developers", to: "/developers" },
  { label: "AI Tools", to: "/ai-tools" },
];

const TRENDING_TECH = ["React", "Node.js", "AI", "Next.js", "MongoDB"];

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, { credentials: "include", ...options });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Navbar] fetch failed for ${url}:`, err.message);
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    invitations: [],
    likes: [],
    comments: [],
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const debounceRef = useRef(null);

  // ── Scroll shadow ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Load current user ──
  useEffect(() => {
    (async () => {
      const data = await safeFetch(API_ROUTES.me);
      console.log("current user data=", data)
      if (data?.data) setUser(data.data);
    })();

    const stored = localStorage.getItem("ps_recent_searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // ── Load notifications ──
  useEffect(() => {
    (async () => {
      const [invites, likes, comments] = await Promise.all([
        safeFetch(API_ROUTES.invitations),
        safeFetch(API_ROUTES.likeNotifications),
        safeFetch(API_ROUTES.commentNotifications),
      ]);
      setNotifications({
        invitations: invites?.data ?? [],
        likes: likes?.data ?? [],
        comments: comments?.data ?? [],
      });
    })();
  }, []);

  // ── Close dropdowns on outside click ──
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Debounced search ──
  const runSearch = useCallback((q) => {
    clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const data = await safeFetch(API_ROUTES.search(q));
      setSearchResults(data?.data ?? []);
    }, 300);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    runSearch(val);
  };

  const commitSearch = (query) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("ps_recent_searches", JSON.stringify(updated));
    setSearchOpen(false);
    navigate(`/projects?q=${encodeURIComponent(query)}`);
  };

  const respondInvitation = async (id, action) => {
    const url = action === "accept" ? API_ROUTES.acceptInvitation(id) : API_ROUTES.rejectInvitation(id);
    const result = await safeFetch(url, { method: "PATCH" });
    if (result !== null) {
      setNotifications((prev) => ({
        ...prev,
        invitations: prev.invitations.filter((inv) => inv._id !== id),
      }));
    }
  };

  const notifCount =
    notifications.invitations.length + notifications.likes.length + notifications.comments.length;

  const profileMenu = [
    { label: "My Profile", icon: User, to: "/profile" },
    { label: "My Projects", icon: FolderKanban, to: "/projects/mine" },
    { label: "Collections", icon: Layers, to: "/collections" },
    { label: "Bookmarks", icon: Bookmark, to: "/bookmarks" },
    { label: "Analytics", icon: BarChart3, to: "/analytics" },
    { label: "Settings", icon: Settings, to: "/settings" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled ? "border-white/10 bg-[#020617]/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)]" : "border-transparent bg-[#020617]/40"
      } backdrop-blur-xl`}
    >
      <div className="mx-auto flex max-w-360 items-center justify-between gap-6 px-6 py-3">
        {/* ── Logo ── */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2.5"
            aria-label="ProjectSphere home"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 via-purple-500 to-blue-500 shadow-[0_0_18px_rgba(139,92,246,0.55)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_rgba(139,92,246,0.85)]">
              <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.25} />
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-[15px] font-semibold tracking-tight text-white">
                Project<span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-blue-400">Sphere</span>
              </span>
              <span className="text-[10.5px] font-medium tracking-wide text-slate-500">
                Build • Showcase • Collaborate
              </span>
            </div>
          </button>
        </div>

        {/* ── Center nav (desktop) ── */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative px-4 py-2 text-[13.5px] font-medium transition-colors duration-200 ${
                  isActive ? "text-white" : "text-slate-400 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-px left-3 right-3 h-0.5 rounded-full bg-linear-to-r from-violet-400 to-blue-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Search ── */}
        <div ref={searchRef} className="relative hidden flex-1 max-w-md md:block">
          <motion.div
            animate={{
              width: searchOpen ? "100%" : "80%",
              y: searchOpen ? 4 : 0,
            }}
            className="ml-auto"
          >
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-300 ${
                searchOpen
                  ? "border-violet-400/50 bg-white/6 shadow-[0_0_0_4px_rgba(139,92,246,0.15),0_0_24px_rgba(139,92,246,0.25)]"
                  : "border-white/10 bg-white/3 hover:border-white/20"
              }`}
            >
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === "Enter" && commitSearch(searchQuery)}
                placeholder="Search projects, developers, tags..."
                className="w-full bg-transparent text-[13px] text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1f]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              >
                {searchQuery.trim() && searchResults.length > 0 ? (
                  <div className="mb-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Results</p>
                    <div className="flex flex-col gap-1">
                      {searchResults.slice(0, 5).map((res) => (
                        <button
                          key={res._id}
                          onClick={() => navigate(`/projects/${res._id}`)}
                          className="rounded-lg px-2.5 py-2 text-left text-[13px] text-slate-200 transition-colors hover:bg-white/6"
                        >
                          {res.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Recent searches</p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => commitSearch(s)}
                          className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-[12px] text-slate-300 transition-colors hover:border-violet-400/40 hover:text-white"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Trending technologies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TRENDING_TECH.map((tech) => (
                      <button
                        key={tech}
                        onClick={() => commitSearch(tech)}
                        className="rounded-full border border-violet-400/20 bg-linear-to-r from-violet-500/10 to-blue-500/10 px-3 py-1 text-[12px] font-medium text-violet-200 transition-all hover:border-violet-400/50 hover:shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right section ── */}
        <div className="flex shrink-0 items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/projects/new")}
            className="hidden items-center gap-1.5 rounded-lg bg-linear-to-r from-violet-500 to-blue-500 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(139,92,246,0.65)] sm:flex"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </motion.button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-slate-300 transition-colors hover:border-white/20 hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {notifCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-linear-to-r from-fuchsia-500 to-violet-500 px-1 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(217,70,239,0.7)]">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-[calc(100%+10px)] z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1f]/95 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                >
                  <div className="max-h-96 overflow-y-auto p-3">
                    {notifications.invitations.length === 0 &&
                    notifications.likes.length === 0 &&
                    notifications.comments.length === 0 ? (
                      <p className="px-2 py-6 text-center text-[13px] text-slate-500">You're all caught up.</p>
                    ) : (
                      <>
                        {notifications.invitations.map((inv) => (
                          <div
                            key={inv._id}
                            className="mb-1.5 flex items-start gap-2.5 rounded-xl p-2.5 transition-colors hover:bg-white/5"
                          >
                            <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                            <div className="flex-1">
                              <p className="text-[12.5px] text-slate-200">
                                {inv.senderName ?? "Someone"} invited you to join{" "}
                                <span className="font-medium text-white">{inv.projectTitle ?? "a project"}</span>
                              </p>
                              <div className="mt-1.5 flex gap-2">
                                <button
                                  onClick={() => respondInvitation(inv._id, "accept")}
                                  className="flex items-center gap-1 rounded-md bg-violet-500/15 px-2 py-1 text-[11px] font-medium text-violet-300 hover:bg-violet-500/25"
                                >
                                  <Check className="h-3 w-3" /> Accept
                                </button>
                                <button
                                  onClick={() => respondInvitation(inv._id, "reject")}
                                  className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-white/10"
                                >
                                  <XCircle className="h-3 w-3" /> Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {notifications.likes.map((like) => (
                          <div key={like._id} className="mb-1.5 flex items-start gap-2.5 rounded-xl p-2.5 transition-colors hover:bg-white/5">
                            <Heart className="mt-0.5 h-4 w-4 shrink-0 text-pink-400" />
                            <p className="text-[12.5px] text-slate-200">
                              {like.userName ?? "Someone"} liked{" "}
                              <span className="font-medium text-white">{like.projectTitle ?? "your project"}</span>
                            </p>
                          </div>
                        ))}
                        {notifications.comments.map((c) => (
                          <div key={c._id} className="mb-1.5 flex items-start gap-2.5 rounded-xl p-2.5 transition-colors hover:bg-white/5">
                            <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                            <p className="text-[12.5px] text-slate-200">
                              {c.userName ?? "Someone"} commented on{" "}
                              <span className="font-medium text-white">{c.projectTitle ?? "your project"}</span>
                            </p>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/3 py-1 pl-1 pr-2 transition-colors hover:border-white/20"
            >
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt=""
                className="h-7 w-7 rounded-md object-cover"
              />
              <div className="hidden flex-col items-start leading-tight lg:flex">
                <span className="text-[12.5px] font-medium text-white">{user?.fullName ?? "Guest"}</span>
                <span className="text-[10.5px] text-slate-500">{user?.username ?? "Student"}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1f]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                >
                  {profileMenu.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        navigate(item.to);
                        setProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-slate-300 transition-colors hover:bg-white/6 hover:text-white"
                    >
                      <item.icon className="h-4 w-4 text-slate-500" />
                      {item.label}
                    </button>
                  ))}
                  <div className="my-1.5 h-px bg-white/10" />
                  <button
                    onClick={async () => {
                      await safeFetch(API_ROUTES.logout, { method: "POST" });
                      navigate("/login");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-slate-300 lg:hidden"
          >
            {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#020617]/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-[14px] font-medium ${
                      isActive ? "bg-violet-500/10 text-white" : "text-slate-400"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <button
                onClick={() => navigate("/projects/new")}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-linear-to-r from-violet-500 to-blue-500 px-4 py-2.5 text-[13px] font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Create Project
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
