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
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setAccessToken } from "@/reducers/fullAppReducer";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const { mutate: handleOtp, isPending } = useMutation({
    mutationKey: ["otp-handler"],
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const { data } = await authApi.post("/otp-email-checker", {
        otp,
        email,
      });
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: data.message || t("auth.otp.toast.success"),
      });
      setShowOtp(false);
      localStorage.removeItem("current-email");
      const { accessToken, refreshToken } = data;
      dispatch(setAccessToken(accessToken));
      localStorage.setItem("refreshToken", refreshToken);
      queryClient.invalidateQueries({
        queryKey: ["authenticateUser-refresh", "authenticateUser"],
      });
      navigate("/");
    },
    onError: (error: ErrResponse) => {
      toast({
        title: error.response?.data.message || t("auth.otp.toast.error"),
        variant: "destructive",
      });
      setShowOtp(false);
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const storageData = JSON.parse(
      localStorage.getItem("current-email") as string,
    );
    if (!storageData || !storageData.email) {
      toast({
        title: "Email is required ",
        variant: "destructive",
      });
      return;
    }
    handleOtp({ otp: data.pin, email: storageData.email });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.otp.field.label")}</FormLabel>
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
                {t("auth.otp.field.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} variant={"app"}>
          {isPending
            ? t("auth.otp.button.loading")
            : t("auth.otp.button.submit")}
        </Button>
      </form>
    </Form>
  );
}
