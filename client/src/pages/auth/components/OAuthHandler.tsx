import { Facebook } from "lucide-react";
import { motion } from "framer-motion";

const OAuthHandler = () => {
  // -------------------------------------------------------------------------
  // Shared button styling (dark glass, matching inputs & submit button)
  // -------------------------------------------------------------------------
  const oauthButtonClass =
    "group relative inline-flex h-11 w-full items-center justify-center gap-2.5 " +
    "overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] " +
    "text-sm font-medium text-white/80 backdrop-blur-sm " +
    "transition-all duration-200 " +
    "hover:border-white/20 hover:bg-white/[0.08] hover:text-white " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 " +
    "focus-visible:ring-offset-0";

  return (
    <>
      {/* ============================================================= */}
      {/* Divider */}
      {/* ============================================================= */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0d0d14] px-3 font-medium tracking-wider text-white/30">
            Or continue with
          </span>
        </div>
      </div>

      {/* ============================================================= */}
      {/* OAuth buttons */}
      {/* ============================================================= */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          onClick={() =>
            (window.location.href = `${
              import.meta.env.VITE_BACKEND_URL
            }/auth/google`)
          }
          className={oauthButtonClass}
        >
          {/* Subtle glow on hover */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            className="relative shrink-0"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          <span className="relative">Google</span>
        </motion.button>

        {/* Facebook */}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          onClick={() =>
            (window.location.href = `${
              import.meta.env.VITE_BACKEND_URL
            }/auth/facebook`)
          }
          className={oauthButtonClass}
        >
          {/* Subtle glow on hover */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <Facebook className="relative h-4.5 w-4.5 shrink-0 text-[#1877F2]" />
          <span className="relative">Facebook</span>
        </motion.button>
      </div>
    </>
  );
};

export default OAuthHandler;
