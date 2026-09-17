import React from "react";
import { motion } from "framer-motion";
import {
  Github,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  Database,
  GitBranch,
  Code2,
  Server,
  Activity,
  BarChart3,
  Eye,
  Terminal,
  Wind,
  Boxes,
  Zap,
  Lock,
  ArrowUpRight,
  Heart,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Architecture", href: "#architecture" },
      { label: "Observability", href: "#observability" },
      { label: "Changelog", href: "#changelog" },
      { label: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#docs" },
      { label: "Getting Started", href: "#start" },
      { label: "API Reference", href: "#api" },
      { label: "Examples", href: "#examples" },
      { label: "Blog", href: "#blog" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: "#github" },
      { label: "Discord", href: "#discord" },
      { label: "Discussions", href: "#discussions" },
      { label: "Contributing", href: "#contributing" },
      { label: "Code of Conduct", href: "#coc" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "License", href: "#license" },
      { label: "Security", href: "#security" },
    ],
  },
];

const techBadges = [
  { icon: Server, label: "Gin", color: "text-amber-400" },
  { icon: Database, label: "PostgreSQL", color: "text-sky-400" },
  { icon: Code2, label: "sqlc", color: "text-violet-400" },
  { icon: GitBranch, label: "Goose", color: "text-emerald-400" },
  { icon: Activity, label: "Loki", color: "text-yellow-400" },
  { icon: BarChart3, label: "Prometheus", color: "text-orange-400" },
  { icon: Eye, label: "Tempo", color: "text-pink-400" },
  { icon: Terminal, label: "Fluent Bit", color: "text-cyan-400" },
  { icon: Wind, label: "Tailwind", color: "text-cyan-300" },
  { icon: Boxes, label: "shadcn/ui", color: "text-slate-300" },
  { icon: Zap, label: "Redux", color: "text-purple-400" },
  { icon: Lock, label: "Zod", color: "text-blue-400" },
];

const socialLinks = [
  { icon: Github, label: "GitHub", href: "#github" },
  { icon: Twitter, label: "Twitter", href: "#twitter" },
  { icon: Linkedin, label: "LinkedIn", href: "#linkedin" },
  { icon: MessageCircle, label: "Discord", href: "#discord" },
  { icon: Mail, label: "Email", href: "#email" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <motion.div variants={itemVariants} className="max-w-sm">
      <h3 className="text-sm font-semibold text-white">Stay in the loop</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/45">
        Get the latest updates, tips, and releases straight to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="mt-5">
        <div className="group relative flex items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-colors focus-within:border-violet-500/50 focus-within:bg-white/[0.06]">
          <Mail className="ml-3.5 h-4 w-4 shrink-0 text-white/30" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-white/30 outline-none"
            required
          />
          <button
            type="submit"
            className="mr-1.5 inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 transition-shadow hover:shadow-violet-600/40"
          >
            {subscribed ? "Subscribed" : "Subscribe"}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        {subscribed && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs font-medium text-emerald-400"
          >
            Thanks for subscribing!
          </motion.p>
        )}
      </form>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main footer
// ---------------------------------------------------------------------------

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden border-t border-white/5 bg-[#0a0a0f] text-white antialiased">
      {/* ----------------------------------------------------------------- */}
      {/* Background decorations */}
      {/* ----------------------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Radial glows */}
        <div className="absolute -bottom-1/3 left-1/4 h-[400px] w-[600px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute -top-1/4 right-1/4 h-[400px] w-[500px] rounded-full bg-sky-600/8 blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative mx-auto max-w-7xl px-6 pt-20 pb-10 lg:px-8"
      >
        {/* ================================================================= */}
        {/* Top section: brand + newsletter */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 shadow-lg shadow-violet-600/25">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white">
                  Go<span className="text-violet-400">React</span> Kit
                </span>
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">
                  Full-Stack Starter
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/45">
              A production-ready starter kit combining the performance of Go
              with the flexibility of React. Built with observability, type
              safety, and developer experience at its core.
            </p>

            {/* Social links */}
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/50 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Newsletter */}
          <div className="flex items-start lg:justify-end">
            <NewsletterForm />
          </div>
        </div>

        {/* ================================================================= */}
        {/* Divider */}
        {/* ================================================================= */}
        <motion.div variants={itemVariants} className="mt-16">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>

        {/* ================================================================= */}
        {/* Link columns */}
        {/* ================================================================= */}
        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {footerColumns.map((column) => (
            <motion.div key={column.title} variants={itemVariants}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {column.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ================================================================= */}
        {/* Tech stack badges */}
        {/* ================================================================= */}
        <motion.div variants={itemVariants} className="mt-16">
          <div className="flex items-center gap-3">
            <h4 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-white/40">
              Powered by
            </h4>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {techBadges.map(({ icon: Icon, label, color }, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/50 backdrop-blur-sm transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white/80"
              >
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                {label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* ================================================================= */}
        {/* Bottom bar */}
        {/* ================================================================= */}
        <motion.div variants={itemVariants} className="mt-14">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-white/35">
              &copy; {currentYear} GoReact Kit. All rights reserved.
            </p>
            <p className="inline-flex items-center gap-1.5 text-xs text-white/35">
              Built with
              <Heart className="h-3.5 w-3.5 fill-rose-500/80 text-rose-500/80" />
              using Go &amp; React
            </p>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium text-white/40">
                All systems operational
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
