import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/axios";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { genders } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email address"),
  user_name: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be less than 30 characters"),
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
  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
    invalid_type_error: "Gender must be one of male, female, or other",
  }),
});

type RegisterSchema = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Shared input styling (matches dark glass theme)
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
const RegisterAccount = ({
  setShowOtp,
}: {
  setShowOtp: (value: boolean) => void;
}) => {
  const [viewPassword, setViewPassword] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      user_name: "",
      password: "",
      gender: "male",
    },
  });

  const { mutate: registerUser, isPending: isRegistering } = useMutation({
    mutationKey: ["register-account"],
    mutationFn: async (values: RegisterSchema) => {
      const { data } = await authApi.post("/register", values);
      return { ...data, email: values.email };
    },
    onSuccess: (data) => {
      toast({
        title: data.message || "Account created successfully",
        variant: "default",
        duration: 2000,
      });
      form.reset();
      localStorage.setItem(
        "current-email",
        JSON.stringify({
          email: data.email,
        }),
      );
      setShowOtp(true);
    },
    onError: (error: ErrResponse) => {
      toast({
        title:
          error.response?.data?.error?.message ||
          "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  const onSubmit = (values: RegisterSchema) => {
    registerUser(values);
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
        {/* Username */}
        {/* ============================================================= */}
        <FormField
          control={form.control}
          name="user_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Username</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="your_username"
                  autoComplete="username"
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-rose-400" />
            </FormItem>
          )}
        />

        {/* ============================================================= */}
        {/* Gender */}
        {/* ============================================================= */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="border-white/10 bg-[#12121a] text-white">
                  {genders.map((value) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="capitalize focus:bg-violet-500/15 focus:text-white"
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <FormLabel className={labelClass}>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={viewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
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
          whileHover={{ y: isRegistering ? 0 : -2 }}
          whileTap={{ scale: isRegistering ? 1 : 0.98 }}
          transition={{ duration: 0.2 }}
          className="pt-2"
        >
          <Button
            type="submit"
            disabled={isRegistering}
            className="group relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-shadow duration-300 hover:shadow-violet-600/50 disabled:opacity-60 disabled:shadow-none"
          >
            {/* Shine sweep */}
            {!isRegistering && (
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            )}

            {isRegistering ? (
              <span className="relative inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="relative inline-flex items-center gap-2">
                Create account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
};

export default RegisterAccount;
