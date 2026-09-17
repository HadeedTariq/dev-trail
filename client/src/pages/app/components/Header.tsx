import { useFullApp } from "@/store/hooks/useFullApp";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ProfileDropDown from "./ProfileDropDown";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, ArrowRight, Sparkles } from "lucide-react";

export default function Header() {
  const MARQUEE_HEIGHT = 42;

  const { user } = useFullApp();

  const [isVisible, setIsVisible] = useState(true);
  const [topOffset, setTopOffset] = useState(MARQUEE_HEIGHT);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

      if (currentScrollY < MARQUEE_HEIGHT) {
        // Still in marquee zone — header sits below marquee
        setIsVisible(true);
        setTopOffset(MARQUEE_HEIGHT - currentScrollY);
      } else if (currentScrollY < 80) {
        setIsVisible(true);
        setTopOffset(0);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down — hide header
        setIsVisible(false);
        setTopOffset(0);
      } else {
        // Scrolling up — show header at top: 0
        setIsVisible(true);
        setTopOffset(0);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 w-full transition-[transform,top] duration-300 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Ambient glow behind the header */}
      {/* ----------------------------------------------------------------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/4 h-40 w-96 rounded-full bg-violet-600/10 blur-[80px]" />
        <div className="absolute -top-20 right-1/4 h-40 w-96 rounded-full bg-sky-600/10 blur-[80px]" />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Glass container */}
      {/* ----------------------------------------------------------------- */}
      <div
        className="relative border-b border-white/[0.06] 
        bg-[#0a0a0f]/70 backdrop-blur-xl 
        supports-[backdrop-filter]:bg-[#0a0a0f]/60
        shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_8px_32px_-12px_rgba(0,0,0,0.6)]"
      >
        {/* Top gradient accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* ============================================================= */}
          {/* Logo */}
          {/* ============================================================= */}
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-sky-500 shadow-lg shadow-violet-600/30"
            >
              <Code2 className="h-5 w-5 text-white" />
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
            </motion.div>

            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight text-white">
                Go<span className="text-violet-400">React</span> Kit
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-white/30">
                Starter
              </span>
            </div>
          </Link>

          {/* ============================================================= */}
          {/* Right-side actions */}
          {/* ============================================================= */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileDropDown />
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  {/* Login — ghost style */}
                  <Link to="/authenticate/login">
                    <button className="group relative inline-flex items-center gap-1.5 rounded-xl border border-transparent px-4 py-2.5 text-sm font-medium text-white/60 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.05] hover:text-white">
                      Login
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-60" />
                    </button>
                  </Link>

                  {/* Register — gradient style */}
                  <Link to="/authenticate/register">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-shadow duration-300 hover:shadow-violet-600/50"
                    >
                      {/* Shine sweep on hover */}
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="relative">Register</span>
                    </motion.button>
                  </Link>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
