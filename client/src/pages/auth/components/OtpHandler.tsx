import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { authApi } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setAccessToken } from "@/reducers/fullAppReducer";
import { useNavigate, useSearchParams } from "react-router-dom";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export function OtpHandler({
  setShowOtp,
}: {
  setShowOtp: (value: boolean) => void;
}) {
  const [params] = useSearchParams();
  const inviteToken = params.get("invite");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const { mutate: handleOtp, isPending } = useMutation({
    mutationKey: ["otp-handler"],
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const { data } = await authApi.post(
        "/otp-email-checker",
        {
          otp,
          email,
        },
        {
          params: inviteToken ? { invite: inviteToken } : undefined,
        }
      );
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: data?.message || "Email verified successfully.",
      });

      setShowOtp(false);
      localStorage.removeItem("current-email");

      const { accessToken, refreshToken } = data;
      if (accessToken) {
        dispatch(setAccessToken(accessToken));
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      queryClient.invalidateQueries({
        queryKey: ["authenticateUser-refresh", "authenticateUser"],
      });

      if (data?.workspaceId) {
        navigate(`/workspace/${data.workspaceId}`);
      } else {
        navigate("/");
      }
    },
    onError: (error: ErrResponse) => {
      toast({
        title:
          error.response?.data?.error.message ||
          error.response?.data?.error?.message ||
          "Verification failed. Please check the code and try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const rawStorage = localStorage.getItem("current-email");
    let storageEmail = "";

    if (rawStorage) {
      try {
        const parsed = JSON.parse(rawStorage);
        storageEmail = parsed?.email || "";
      } catch {
        storageEmail = rawStorage;
      }
    }

    if (!storageEmail) {
      toast({
        title: "Email not found. Please re-enter your email.",
        variant: "destructive",
      });
      return;
    }

    handleOtp({ otp: data.pin, email: storageEmail });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Enter the 6-digit verification code sent to your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} variant="app">
          {isPending ? "Verifying..." : "Verify Email"}
        </Button>
      </form>
    </Form>
  );
}
