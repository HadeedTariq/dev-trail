import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/axios";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAccessToken } from "@/reducers/fullAppReducer";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be less than 100 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

type LoginSchema = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Shared input styling (matches RegisterAccount & OAuthHandler)
// ---------------------------------------------------------------------------
const inputClass =
  "h-11 rounded-xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 " +
  "backdrop-blur-sm transition-colors " +
  "focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/20 " +
  "focus-visible:ring-offset-0";

const labelClass = "text-sm font-medium text-white/70";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const CredentialsLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [viewPassword, setViewPassword] = useState(false);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const queryClient = useQueryClient();

  const { mutate: loginWithCredentials, isPending: isLoggingIn } = useMutation({
    mutationKey: ["login-credentials"],
    mutationFn: async ({
      email,
      password,
    }: {
      email?: string;
      password: string;
    }) => {
      const payload = { email, password };

      const response = await authApi.post(
        "/authenticate-with-credentials",
        payload,
      );
      return response.data;
    },
    onSuccess: (data: any) => {
      const { accessToken, refreshToken } = data;
      toast({
        title: data.message || "Logged in successfully",
        variant: "default",
        duration: 2000,
      });
      dispatch(setAccessToken(accessToken));
      localStorage.setItem("refreshToken", refreshToken);
      queryClient.invalidateQueries({
        queryKey: ["authenticateUser-refresh", "authenticateUser"],
      });
      navigate("/");
    },
    onError: (error: ErrResponse) => {
      toast({
        title:
          error.response?.data?.error?.message ||
          "Login failed. Please check your credentials.",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  const onSubmit = (data: LoginSchema) => {
    const { email, password } = data;

    const emailResult = z.string().email().safeParse(email);
    if (!emailResult.success) {
      toast({
        title: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    loginWithCredentials({ email: email, password });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* ============================================================= */}
        {/* Email */}
        {/* ============================================================= */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-rose-400" />
            </FormItem>
          )}
        />

        {/* ============================================================= */}
        {/* Password */}
        {/* ============================================================= */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className={labelClass}>Password</FormLabel>
                <Link
                  to="/authenticate/forgot-password"
                  className="text-xs font-medium text-violet-400 transition-colors hover:text-violet-300"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={viewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`${inputClass} pr-11`}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setViewPassword(!viewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/35 transition-colors hover:text-white/70 focus:outline-none"
                    aria-label={
                      viewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {viewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-rose-400" />
            </FormItem>
          )}
        />

        {/* ============================================================= */}
        {/* Submit */}
        {/* ============================================================= */}
        <motion.div
          whileHover={{ y: isLoggingIn ? 0 : -2 }}
          whileTap={{ scale: isLoggingIn ? 1 : 0.98 }}
          transition={{ duration: 0.2 }}
          className="pt-2"
        >
          <Button
            type="submit"
            disabled={isLoggingIn}
            className="group relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-shadow duration-300 hover:shadow-violet-600/50 disabled:opacity-60 disabled:shadow-none"
          >
            {/* Shine sweep */}
            {!isLoggingIn && (
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            )}

            {isLoggingIn ? (
              <span className="relative inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="relative inline-flex items-center gap-2">
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
};

export default CredentialsLogin;
