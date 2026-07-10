function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">

      <div className="w-full max-w-6xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-linear-to-br from-blue-600/20 to-purple-600/20">
          <h1 className="text-5xl font-bold text-white mb-4">
            ProjectSphere
          </h1>

          <p className="text-slate-300 text-lg mb-10">
            Showcase your projects, collaborate with developers and build your portfolio with AI assistance.
          </p>

          <div className="space-y-4 text-slate-200">
            <div>🚀 Showcase amazing projects</div>
            <div>🤝 Collaborate with your team</div>
            <div>📊 Powerful analytics dashboard</div>
            <div>🤖 AI powered project assistant</div>
            <div>🔖 Collections and bookmarks</div>
          </div>
        </div>

        {/* Right Side */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">
              {title}
            </h2>

            <p className="text-slate-400">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

      </div>
    </div>
  );
}

export default AuthLayout;