import { useEffect, useState } from "react";
import { OtpHandler } from "../components/OtpHandler";
import RegisterAccount from "../components/RegisterAccount";
import OAuthHandler from "../components/OAuthHandler";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  ArrowRight,
  ShieldCheck,
  Database,
  Server,
  Activity,
  Sparkles,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

// ---------------------------------------------------------------------------
// Left panel highlights
// ---------------------------------------------------------------------------
const highlights = [
  {
    icon: Server,
    title: "Go-Powered Backend",
    description:
      "Gin, sqlc, and PostgreSQL for type-safe, high-performance APIs.",
  },
  {
    icon: Activity,
    title: "Full Observability",
    description: "Loki, Prometheus, and Tempo built in from day one.",
  },
  {
    icon: Database,
    title: "Type-Safe Queries",
    description: "sqlc generates Go code directly from your SQL.",
  },
  {
    icon: ShieldCheck,
    title: "Production Ready",
    description: "Migrations, auth, and best practices included.",
  },
];

const RegisterUser = () => {
  const [showOtp, setShowOtp] = useState(false);

  useEffect(() => {
    const storageData = JSON.parse(
      localStorage.getItem("current-email") as string,
    );
    if (storageData && storageData.email) {
      setShowOtp(true);
    }
  }, []);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#0a0a0f] text-white antialiased">
      {/* ================================================================= */}
      {/* Ambient background glows */}
      {/* ================================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute -top-1/4 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute bottom-0 -left-32 h-[500px] w-[500px] rounded-full bg-sky-600/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-600/8 blur-[120px]" />
      </div>

      {/* ================================================================= */}
      {/* Left panel — brand & highlights (hidden on mobile) */}
      {/* ================================================================= */}
      <div className="relative hidden w-1/2 flex-col justify-between border-r border-white/[0.06] bg-white/[0.02] p-12 backdrop-blur-sm lg:flex xl:p-16">
        {/* Top: logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="group inline-flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 shadow-lg shadow-violet-600/30"
            >
              <Code2 className="h-5.5 w-5.5 text-white" />
              <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight text-white">
                Go<span className="text-violet-400">React</span> Kit
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
                Starter
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Middle: headline + highlights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="my-auto max-w-lg py-12"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium tracking-wide text-white/60 uppercase">
              <Sparkles className="h-3 w-3 text-violet-400" />
              Get Started
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
          >
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              Join the
            </span>{" "}
            <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Go &amp; React
            </span>{" "}
            <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
              ecosystem
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-4 text-sm leading-relaxed text-white/45"
          >
            Create your account and get instant access to a production-ready
            full-stack starter kit with observability, type safety, and
            beautiful UI primitives.
          </motion.p>

          {/* Highlight list */}
          <div className="mt-10 space-y-5">
            {highlights.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={itemVariants}
                className="group flex items-start gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm transition-colors group-hover:border-violet-500/30 group-hover:bg-violet-500/10">
                  <Icon className="h-4.5 w-4.5 text-violet-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/40">
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom: trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center gap-2 text-xs text-white/30"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Trusted by developers building production apps
        </motion.div>
      </div>

      {/* ================================================================= */}
      {/* Right panel — form */}
      {/* ================================================================= */}
      <div className="relative flex w-full items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12 xl:px-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-center lg:hidden"
          >
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 shadow-lg shadow-violet-600/30">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                Go<span className="text-violet-400">React</span> Kit
              </span>
            </Link>
          </motion.div>

          <AnimatePresence mode="wait">
            {showOtp ? (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <OtpHandler setShowOtp={(val: boolean) => setShowOtp(val)} />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                {/* Heading */}
                <div className="text-center lg:text-left">
                  <motion.h2
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
                  >
                    Create your account
                  </motion.h2>
                  <motion.p
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-2 text-sm leading-relaxed text-white/45"
                  >
                    Start building with the Go &amp; React starter kit in
                    seconds.
                  </motion.p>
                  <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 lg:mx-0" />
                </div>

                {/* Form card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
                  {/* Card glow */}
                  <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-violet-600/10 blur-[80px]" />

                  <div className="relative space-y-6">
                    <RegisterAccount
                      setShowOtp={(val: boolean) => setShowOtp(val)}
                    />

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/[0.08]" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0d0d14] px-3 font-medium tracking-wider text-white/30">
                          or continue with
                        </span>
                      </div>
                    </div>

                    <OAuthHandler />
                  </div>
                </div>

                {/* Sign-in prompt */}
                <div className="flex items-center justify-center gap-1.5 text-sm">
                  <span className="text-white/45">
                    Already have an account?
                  </span>
                  <Link
                    to="/authenticate/login"
                    className="group inline-flex items-center gap-1 font-semibold text-violet-400 transition-colors hover:text-violet-300"
                  >
                    Sign in
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
