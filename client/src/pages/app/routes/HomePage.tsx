import React from "react";
import { motion } from "framer-motion";
import {
  Database,
  GitBranch,
  Code2,
  Server,
  Activity,
  BarChart3,
  Eye,
  Layers,
  Boxes,
  Wind,
  Terminal,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  Lock,
  Cpu,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const floatVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const backendStack = [
  {
    icon: Database,
    name: "PostgreSQL",
    description: "Robust relational database for reliable data persistence.",
    color: "from-sky-500 to-blue-600",
    shadow: "shadow-sky-500/20",
  },
  {
    icon: GitBranch,
    name: "Goose",
    description: "Database migration tool for versioned schema changes.",
    color: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: Code2,
    name: "sqlc",
    description: "Generate type-safe Go code from SQL queries.",
    color: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
  },
  {
    icon: Server,
    name: "Gin",
    description: "High-performance HTTP web framework for Go.",
    color: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
  },
];

const architecturePatterns = [
  { label: "Routes", icon: Globe },
  { label: "Services", icon: Layers },
  { label: "Handlers", icon: Cpu },
];

const observabilityStack = [
  {
    icon: Activity,
    name: "Loki",
    description: "Log aggregation system inspired by Prometheus.",
    color: "from-yellow-500 to-amber-600",
  },
  {
    icon: BarChart3,
    name: "Prometheus",
    description: "Metrics collection and alerting toolkit.",
    color: "from-orange-500 to-red-600",
  },
  {
    icon: Eye,
    name: "Tempo",
    description: "Distributed tracing backend for deep insights.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Terminal,
    name: "Fluent Bit",
    description: "Lightweight log and data processor.",
    color: "from-cyan-500 to-sky-600",
  },
];

const frontendStack = [
  {
    icon: Wind,
    name: "Tailwind CSS",
    description: "Utility-first CSS framework for rapid UI development.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    icon: Boxes,
    name: "shadcn/ui",
    description: "Beautifully designed, accessible UI components.",
    color: "from-slate-500 to-gray-700",
  },
  {
    icon: Zap,
    name: "Redux Toolkit",
    description: "Predictable state management for complex apps.",
    color: "from-purple-500 to-indigo-600",
  },
  {
    icon: Lock,
    name: "Zod",
    description: "TypeScript-first schema validation.",
    color: "from-blue-500 to-indigo-600",
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SectionHeading: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
}> = ({ eyebrow, title, description }) => (
  <motion.div
    variants={itemVariants}
    className="text-center max-w-2xl mx-auto mb-14"
  >
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium tracking-wide text-white/60 uppercase">
      <Sparkles className="h-3 w-3 text-violet-400" />
      {eyebrow}
    </span>
    <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
      {title}
    </h2>
    <p className="mt-4 text-base leading-relaxed text-white/50">
      {description}
    </p>
  </motion.div>
);

const StackCard: React.FC<{
  icon: React.ElementType;
  name: string;
  description: string;
  color: string;
  index: number;
  shadow?: string;
}> = ({ icon: Icon, name, description, color, index, shadow }) => (
  <motion.div
    custom={index}
    variants={floatVariants}
    whileHover={{ y: -6, transition: { duration: 0.25 } }}
    className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.06] ${shadow ?? ""}`}
  >
    {/* Glow effect */}
    <div
      className={`absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br ${color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
    />
    <div className="relative">
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-white/45">
        {description}
      </p>
    </div>
  </motion.div>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const HomePage: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0f] text-white antialiased selection:bg-violet-500/30">
      {/* ----------------------------------------------------------------- */}
      {/* Background decorations */}
      {/* ----------------------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Radial glows */}
        <div className="absolute -top-1/4 left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute top-1/3 -left-32 h-[500px] w-[500px] rounded-full bg-sky-600/8 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-600/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        {/* ================================================================= */}
        {/* Hero */}
        {/* ================================================================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/70 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Production-Ready Starter Kit
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="mt-8 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              Build Faster with
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Go &amp; React
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl text-base leading-relaxed text-white/50 sm:text-lg"
          >
            A meticulously crafted full-stack starter kit combining the raw
            performance of Go with the flexibility of React. Complete with
            observability, type-safe database access, and beautiful UI
            primitives — ready for production from day one.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-shadow hover:shadow-violet-600/40"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10"
            >
              <Code2 className="h-4 w-4" />
              View Documentation
            </motion.button>
          </motion.div>

          {/* Architecture pill strip */}
          <motion.div
            variants={itemVariants}
            className="mt-14 flex flex-wrap items-center justify-center gap-2"
          >
            {architecturePatterns.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/50 backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-white/40" />
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ================================================================= */}
        {/* Backend section */}
        {/* ================================================================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-32"
        >
          <SectionHeading
            eyebrow="Backend"
            title="Go-Powered Core"
            description="A battle-tested backend stack designed for performance, type safety, and maintainability."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {backendStack.map((item, i) => (
              <StackCard key={item.name} {...item} index={i} />
            ))}
          </div>

          {/* Architecture highlight */}
          <motion.div
            variants={itemVariants}
            className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm"
          >
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Clean Architecture
                </h3>
                <p className="mt-1 text-sm text-white/45">
                  Separation of concerns with a proven folder structure.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {["Routes", "Services", "Handlers"].map((layer, i) => (
                  <React.Fragment key={layer}>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70">
                      {layer}
                    </span>
                    {i < 2 && <ArrowRight className="h-4 w-4 text-white/25" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ================================================================= */}
        {/* Observability section */}
        {/* ================================================================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-32"
        >
          <SectionHeading
            eyebrow="Observability"
            title="Full Visibility Stack"
            description="Logs, metrics, and traces — everything you need to understand your system in production."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {observabilityStack.map((item, i) => (
              <StackCard key={item.name} {...item} index={i} />
            ))}
          </div>
        </motion.div>

        {/* ================================================================= */}
        {/* Frontend section */}
        {/* ================================================================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-32"
        >
          <SectionHeading
            eyebrow="Frontend"
            title="Modern React Experience"
            description="A carefully curated frontend stack for building beautiful, type-safe user interfaces."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {frontendStack.map((item, i) => (
              <StackCard key={item.name} {...item} index={i} />
            ))}
          </div>
        </motion.div>

        {/* ================================================================= */}
        {/* Feature highlights */}
        {/* ================================================================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-32"
        >
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-10 backdrop-blur-sm sm:p-14"
          >
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-600/10 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-600/10 blur-[100px]" />

            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Everything you need to ship
                </h3>
                <p className="mt-4 text-base leading-relaxed text-white/45">
                  Stop wiring together boilerplate. This starter kit gives you a
                  complete, opinionated foundation so you can focus on building
                  your product.
                </p>
                <div className="mt-8 space-y-3.5">
                  {[
                    "Type-safe database queries with sqlc",
                    "Versioned migrations with Goose",
                    "Structured logging with Loki & Fluent Bit",
                    "Distributed tracing with Tempo",
                    "Metrics & alerting with Prometheus",
                    "Accessible UI components with shadcn/ui",
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-400" />
                      <span className="text-sm text-white/60">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code preview */}
              <div className="relative">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl">
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
                    <div className="h-3 w-3 rounded-full bg-red-500/70" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <div className="h-3 w-3 rounded-full bg-green-500/70" />
                    <span className="ml-3 text-xs font-medium text-white/30">
                      main.go
                    </span>
                  </div>
                  {/* Code body */}
                  <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed">
                    <code>
                      <span className="text-violet-400">package</span>{" "}
                      <span className="text-white/80">main</span>
                      {"\n\n"}
                      <span className="text-violet-400">import</span>{" "}
                      <span className="text-white/50">(</span>
                      {"\n"}
                      {"  "}
                      <span className="text-emerald-400">
                        "github.com/gin-gonic/gin"
                      </span>
                      {"\n"}
                      {"  "}
                      <span className="text-emerald-400">"database/sql"</span>
                      {"\n"}
                      <span className="text-white/50">)</span>
                      {"\n\n"}
                      <span className="text-violet-400">func</span>{" "}
                      <span className="text-sky-400">main</span>
                      <span className="text-white/50">() {"{"}</span>
                      {"\n"}
                      {"  "}
                      <span className="text-white/70">r</span>{" "}
                      <span className="text-white/50">:=</span>{" "}
                      <span className="text-sky-400">gin.Default</span>
                      <span className="text-white/50">()</span>
                      {"\n\n"}
                      {"  "}
                      <span className="text-white/30">
                        // Routes → Services → Handlers
                      </span>
                      {"\n"}
                      {"  "}
                      <span className="text-white/70">r</span>
                      <span className="text-white/50">.</span>
                      <span className="text-sky-400">GET</span>
                      <span className="text-white/50">(</span>
                      <span className="text-emerald-400">"/api/health"</span>
                      <span className="text-white/50">, handler.Health)</span>
                      {"\n\n"}
                      {"  "}
                      <span className="text-white/70">r</span>
                      <span className="text-white/50">.</span>
                      <span className="text-sky-400">Run</span>
                      <span className="text-white/50">(</span>
                      <span className="text-emerald-400">":8080"</span>
                      <span className="text-white/50">)</span>
                      {"\n"}
                      <span className="text-white/50">{"}"}</span>
                    </code>
                  </pre>
                </div>

                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute -bottom-4 -right-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#12121a] px-4 py-2.5 shadow-xl"
                >
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white/80">
                    Production Ready
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ================================================================= */}
        {/* Bottom CTA */}
        {/* ================================================================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-32 text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Ready to build something great?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mx-auto mt-4 max-w-xl text-base text-white/45"
          >
            Clone the starter kit and go from zero to production in minutes, not
            weeks.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-shadow hover:shadow-violet-600/40"
            >
              Start Building Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
