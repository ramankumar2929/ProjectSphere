// ============================================================================
// FeaturesSection.jsx
// ProjectSphere — "Why developers choose ProjectSphere" features grid
//
// Fully self-contained, dark-themed features section with glassmorphism
// cards, staggered scroll animations and hover glow/lift effects.
// Matches the visual language of HeroSection.jsx and StatsSection.jsx.
// ============================================================================

// Import required dependencies
import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  FolderGit2,
  Bot,
  Users,
  Trophy,
  Bookmark,
  BarChart3,
} from "lucide-react";

// ----------------------------------------------------------------------------
// Feature data — all content lives here so the JSX below stays clean.
// Each entry maps directly to one feature card.
// ----------------------------------------------------------------------------
const features = [
  {
    icon: FolderGit2,
    title: "Showcase Projects",
    description:
      "Present your projects with screenshots, live demos, GitHub repositories and detailed documentation.",
    tags: ["GitHub", "Portfolio", "Live Demo"],
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Bot,
    title: "AI Recommendations",
    description:
      "Discover projects, collaborators and opportunities powered by intelligent recommendations.",
    tags: ["AI", "Smart Match", "Suggestions"],
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Users,
    title: "Find Collaborators",
    description:
      "Connect with developers who complement your skills for hackathons, startups and open source projects.",
    tags: ["Teams", "Hackathons", "Networking"],
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Trophy,
    title: "Developer Portfolio",
    description:
      "Build a professional developer identity that can be shared with recruiters and companies.",
    tags: ["Resume", "Career", "Hiring"],
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Bookmark,
    title: "Collections & Bookmarks",
    description:
      "Save inspiring projects and organize them into personal collections for future reference.",
    tags: ["Save", "Collections", "Ideas"],
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track views, likes, engagement and understand how your projects perform over time.",
    tags: ["Views", "Likes", "Growth"],
    gradient: "from-cyan-500 to-blue-500",
  },
];

// ----------------------------------------------------------------------------
// Animation variants
// ----------------------------------------------------------------------------

// Parent grid — staggers each child card's entrance animation
const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// Individual card — fade-up on scroll into view
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ----------------------------------------------------------------------------
// FeatureCard — single reusable card, kept inline in this file
// ----------------------------------------------------------------------------
function FeatureCard({ icon: Icon, title, description, tags, gradient }) {
  return (
    <motion.div
      variants={cardVariants}
      // Hover lift (translateY -6px) + slight scale, per spec
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative rounded-2xl border border-white/10 bg-white/4] backdrop-blur-xl p-6 sm:p-7 overflow-hidden"
    >
      {/* Animated border glow — brightens on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/0 group-hover:ring-white/20 transition-all duration-500"
      />

      {/* Soft radial glow behind the card, intensifies on hover */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-1 rounded-2xl bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`}
      />

      {/* Card content sits above the glow layers */}
      <div className="relative z-10">
        {/* Gradient icon container — scales up slightly on hover */}
        <div
          className={`h-14 w-14 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Feature title */}
        <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>

        {/* Short description */}
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          {description}
        </p>

        {/* Feature tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// Main FeaturesSection component
// ----------------------------------------------------------------------------
function FeaturesSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#030712] text-white py-24 sm:py-28">
      {/* ---------------- Background effects ---------------- */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {/* Purple glow blob */}
        <div className="absolute top-10 right-1/4 h-100 w-100 rounded-full bg-purple-600/20 blur-3xl" />
        {/* Blue glow blob */}
        <div className="absolute bottom-0 left-1/4 h-100 w-100 rounded-full bg-blue-600/20 blur-3xl" />

        {/* Very subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        {/* ---------------- Section header ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 backdrop-blur px-4 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-purple-300" />
            <span className="text-xs font-medium tracking-wide text-slate-300">
              WHY DEVELOPERS CHOOSE PROJECTSPHERE
            </span>
          </div>

          {/* Heading with gradient text */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white via-white to-slate-400">
            Everything You Need To Build Your Developer Identity
          </h2>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed">
            From showcasing projects to finding teammates and tracking growth,
            ProjectSphere gives developers the tools they need to stand out.
          </p>
        </motion.div>

        {/* ---------------- Feature cards grid ---------------- */}
        {/* Staggered fade-up animation triggers once the grid scrolls into view */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              tags={feature.tags}
              gradient={feature.gradient}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Export component
export default FeaturesSection;