import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  User2,
  Bot,
  Users,
  Star,
  GitBranch,
  Zap,
} from "lucide-react";

/**
 * HeroSection.jsx
 * ProjectSphere — Build. Showcase. Collaborate.
 *
 * Self-contained hero section. All content is hardcoded.
 * No backend / API calls. Export default only.
 */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const floatCard = {
  animate: (custom) => ({
    y: [0, custom?.amplitude ?? -10, 0],
    transition: {
      duration: custom?.duration ?? 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: custom?.delay ?? 0,
    },
  }),
};

const trustStats = [
  { label: "Projects", value: "10,000+" },
  { label: "Developers", value: "5,000+" },
  { label: "Collaborations", value: "1,200+" },
];

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  top: Math.random() * 100,
  left: Math.random() * 100,
  duration: Math.random() * 8 + 8,
  delay: Math.random() * 5,
}));

function GlowBlob({ className }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full blur-3xl opacity-40 ${className}`}
    />
  );
}

function FloatingParticles() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-white/30"
          style={{
            width: p.size,
            height: p.size,
            top: `${p.top}%`,
            left: `${p.left}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function GridPattern() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-linear(to right, #ffffff 1px, transparent 1px), linear-linear(to bottom, #ffffff 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage:
          "radial-linear(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        WebkitMaskImage:
          "radial-linear(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
      }}
    />
  );
}

/* ---------------- Floating illustration cards ---------------- */

function TrendingProjectCard() {
  return (
    <motion.div
      custom={{ amplitude: -14, duration: 6 }}
      animate="animate"
      variants={floatCard}
      whileHover={{ scale: 1.05, y: -6 }}
      className="absolute top-2 left-2 sm:top-0 sm:left-0 w-52 sm:w-60 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-9 w-9 rounded-xl bg-linear-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <span className="text-[10px] font-medium text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
          Trending
        </span>
      </div>
      <p className="text-sm font-semibold text-white">NeuroSync AI</p>
      <p className="text-xs text-slate-400 mt-1">Real-time collab whiteboard</p>
      <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 text-amber-400" /> 482
        </span>
        <span className="flex items-center gap-1">
          <GitBranch className="h-3 w-3 text-indigo-300" /> 96
        </span>
      </div>
    </motion.div>
  );
}

function DeveloperProfileCard() {
  return (
    <motion.div
      custom={{ amplitude: 14, duration: 7, delay: 0.4 }}
      animate="animate"
      variants={floatCard}
      whileHover={{ scale: 1.05, y: -6 }}
      className="absolute top-32 sm:top-24 right-0 w-48 sm:w-56 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10">
          <User2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Aditi Rao</p>
          <p className="text-[11px] text-slate-400">Full-stack Builder</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {["React", "Node", "AI"].map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function AIRecommendationCard() {
  return (
    <motion.div
      custom={{ amplitude: -12, duration: 6.5, delay: 0.8 }}
      animate="animate"
      variants={floatCard}
      whileHover={{ scale: 1.05, y: -6 }}
      className="absolute bottom-24 sm:bottom-16 left-0 w-56 sm:w-64 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-9 w-9 rounded-xl bg-linear-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <p className="text-xs font-semibold text-white">AI Match</p>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">
        "This teammate's skills fit your open-source project perfectly."
      </p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full w-[92%] rounded-full bg-linear-to-r from-violet-400 to-blue-400" />
      </div>
      <p className="text-[10px] text-slate-400 mt-1">92% compatibility</p>
    </motion.div>
  );
}

function CollaborationInviteCard() {
  return (
    <motion.div
      custom={{ amplitude: 10, duration: 5.5, delay: 0.2 }}
      animate="animate"
      variants={floatCard}
      whileHover={{ scale: 1.05, y: -6 }}
      className="absolute bottom-0 right-6 sm:right-2 w-52 sm:w-60 rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-9 w-9 rounded-xl bg-linear-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
          <Users className="h-4 w-4 text-white" />
        </div>
        <p className="text-xs font-semibold text-white">New Invite</p>
      </div>
      <p className="text-xs text-slate-300">
        Join <span className="text-white font-medium">Team Hexafold</span> for
        HackNova 2026
      </p>
      <div className="flex gap-2 mt-3">
        <button className="text-[11px] px-2.5 py-1 rounded-lg bg-linear-to-r from-purple-500 to-blue-500 text-white font-medium">
          Accept
        </button>
        <button className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10">
          Later
        </button>
      </div>
    </motion.div>
  );
}

/* ---------------- Main component ---------------- */

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#030712] text-white">
      {/* Background layers */}
      <div aria-hidden="true" className="absolute inset-0">
        <GlowBlob className="top-[-10%] left-[-10%] h-105 w-105 bg-purple-600/40" />
        <GlowBlob className="top-[10%] right-[-15%] h-120 w-120 bg-blue-600/30" />
        <GlowBlob className="bottom-[-20%] left-[20%] h-95 w-95 bg-fuchsia-600/20" />
        <GridPattern />
        <FloatingParticles />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#030712]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-10 pt-28 pb-20 sm:pt-32 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          {/* Left column */}
          <div className="text-center lg:text-left">
            <motion.div
              initial="hidden"
              animate="show"
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 backdrop-blur px-4 py-1.5 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              <span className="text-xs font-medium text-slate-300">
                Where builders launch what's next
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="show"
              custom={1}
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]"
            >
              <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-white to-slate-400">
                Build. Showcase.
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-fuchsia-400 to-blue-400">
                Collaborate.
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="show"
              custom={2}
              variants={fadeUp}
              className="mt-6 text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              ProjectSphere helps students and developers turn ideas into
              projects, discover collaborators and build an impressive
              portfolio.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="show"
              custom={3}
              variants={fadeUp}
              className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link
                     to="/projects/new"
                        className="group relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white bg-linear-to-r from-purple-500 to-blue-500 shadow-[0_0_30px_rgba(139,92,246,0.35)] transition-transform duration-300 hover:scale-[1.03] w-full sm:w-auto"
                     >
                          Create Project
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
               </Link>

              <Link
                         to="/projects"
                        className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-slate-200 border border-white/15 bg-white/3 backdrop-blur hover:bg-white/[0.07] transition-colors duration-300 w-full sm:w-auto"
                      >
                      <Zap className="h-4 w-4 text-purple-300" />
                      Explore Projects
               </Link>

            </motion.div>

            <motion.p
              initial="hidden"
              animate="show"
              custom={4}
              variants={fadeUp}
              className="mt-5 text-xs text-slate-500"
            >
              Trusted by student developers, hackathon teams and builders.
            </motion.p>
          </div>

          {/* Right column — floating cards illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative h-105 sm:h-115 lg:h-125 w-full max-w-md mx-auto"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-linear-to-br from-purple-600/20 to-blue-600/20 blur-3xl"
            />
            <TrendingProjectCard />
            <DeveloperProfileCard />
            <AIRecommendationCard />
            <CollaborationInviteCard />
          </motion.div>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial="hidden"
          animate="show"
          custom={5}
          variants={fadeUp}
          className="mt-24 sm:mt-28 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto border-t border-white/10 pt-10"
        >
          {trustStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-300 to-blue-300">
                {stat.value}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}