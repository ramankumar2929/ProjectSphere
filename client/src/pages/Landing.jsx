import { Link } from "react-router-dom";
import {
  Rocket,
  Brain,
  Users,
  FolderKanban,
  ArrowRight,
} from "lucide-react";

function Landing() {
  const features = [
    {
      icon: <FolderKanban size={32} />,
      title: "Showcase Projects",
      description:
        "Create beautiful project portfolios and present your work professionally.",
    },
    {
      icon: <Users size={32} />,
      title: "Collaborate",
      description:
        "Find teammates, contributors and collaborators for your next big idea.",
    },
    {
      icon: <Brain size={32} />,
      title: "AI Powered",
      description:
        "Generate descriptions, tags and improve your projects using AI tools.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">

      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 blur-[150px] rounded-full"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-8 md:px-16 py-6">

        <div className="flex items-center gap-3">
          <Rocket className="text-blue-500" size={34} />
          <h1 className="text-3xl font-bold">
            Project<span className="text-blue-500">Sphere</span>
          </h1>
        </div>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-5 py-2 rounded-xl border border-slate-700 hover:border-blue-500 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 md:px-16 py-24 flex flex-col items-center text-center">

        <div className="inline-block px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-blue-400 text-sm mb-8">
          🚀 The Future of Student Project Showcasing
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold max-w-5xl leading-tight">
          Showcase Your
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-500">
            {" "}Projects{" "}
          </span>
          Like Never Before
        </h1>

        <p className="text-slate-400 text-xl mt-8 max-w-3xl leading-relaxed">
          Build your portfolio, collaborate with developers,
          and use AI-powered tools to make your projects stand out.
        </p>

        <div className="flex gap-5 mt-12 flex-wrap justify-center">

          <Link
            to="/register"
            className="group px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 transition text-lg font-semibold flex items-center gap-3"
          >
            Get Started
            <ArrowRight
              className="group-hover:translate-x-1 transition"
              size={22}
            />
          </Link>

          <Link
            to="/login"
            className="px-8 py-4 rounded-2xl border border-slate-700 hover:border-blue-500 hover:bg-slate-900 transition text-lg"
          >
            Sign In
          </Link>

        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 px-8 md:px-16 py-10">

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-md">
            <h2 className="text-5xl font-bold text-blue-500">AI</h2>
            <p className="text-slate-400 mt-3">
              Powered Project Assistance
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-md">
            <h2 className="text-5xl font-bold text-purple-500">24/7</h2>
            <p className="text-slate-400 mt-3">
              Project Discovery & Networking
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-md">
            <h2 className="text-5xl font-bold text-green-500">∞</h2>
            <p className="text-slate-400 mt-3">
              Possibilities For Collaboration
            </p>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-8 md:px-16 py-24">

        <h2 className="text-4xl font-bold text-center mb-16">
          Why Choose ProjectSphere?
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">

          {features.map((feature, index) => (
            <div
              key={index}
              className="
                bg-slate-900/70
                border border-slate-800
                rounded-3xl
                p-8
                backdrop-blur-md
                hover:border-blue-500
                hover:-translate-y-2
                transition-all
                duration-300
              "
            >
              <div className="text-blue-500 mb-6">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-bold mb-4">
                {feature.title}
              </h3>

              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* AI Section */}
      <section className="relative z-10 px-8 md:px-16 py-24">

        <div className="
          max-w-6xl mx-auto
          bg-linear-to-r
          from-blue-900/20
          to-purple-900/20
          border border-slate-800
          rounded-[40px]
          p-12
          text-center
          backdrop-blur-xl
        ">

          <Brain size={70} className="mx-auto text-blue-500 mb-8" />

          <h2 className="text-5xl font-bold mb-6">
            AI Powered Experience
          </h2>

          <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Generate project descriptions, improve documentation,
            create tags and enhance your project presentation
            with intelligent AI assistance.
          </p>

        </div>

      </section>

      {/* CTA */}
      <section className="relative z-10 px-8 md:px-16 py-24 text-center">

        <h2 className="text-5xl font-bold mb-6">
          Ready To Build Your Developer Identity?
        </h2>

        <p className="text-slate-400 text-xl mb-12">
          Join ProjectSphere and showcase your best work.
        </p>

        <Link
          to="/register"
          className="
            inline-flex
            items-center
            gap-3
            px-10
            py-5
            rounded-2xl
            bg-blue-600
            hover:bg-blue-700
            text-lg
            font-semibold
            transition
          "
        >
          Start Building
          <ArrowRight size={22} />
        </Link>

      </section>

    </div>
  );
}

export default Landing;