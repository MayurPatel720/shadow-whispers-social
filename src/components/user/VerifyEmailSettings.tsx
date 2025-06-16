
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const VerifyEmailSettings: React.FC<{ email: string }> = ({ email }) => {
  const { refreshUser } = useAuth();
  const [otpResent, setOtpResent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async ({ otp }: { otp: string }) => {
    setSubmitting(true);
    try {
      await api.post("/api/users/verify-email", {
        email,
        otp,
      });
      toast({
        title: "Email Verified! 🎉",
        description: "You may now post and explore all features.",
      });
      setVerified(true);
      // Refresh user data to update isEmailVerified status
      await refreshUser();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Invalid or expired code.",
        description:
          error?.response?.data?.message ||
          "Verification failed. Please check your code and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setOtpResent(false);
    try {
      await api.post("/api/users/resend-verification-email", { email });
      toast({
        title: "OTP Resent",
        description: "Check your inbox for the new code.",
      });
      setOtpResent(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to resend code",
        description:
          error?.response?.data?.message ||
          "We couldn't send a new code right now. Try again soon!",
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (verified) return null;

  return (
    <Card className="bg-gray-800/50 border-purple-500/30 mb-4 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-purple-300 flex items-center gap-2">
          <MailCheck className="text-purple-400" size={22} />
          Verify Your Email Address
        </CardTitle>
        <CardDescription className="text-gray-300 text-sm">
          You must verify your email to access all features (posting, chat, etc).
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="mb-3 text-sm text-gray-200">
          Code sent to: <span className="text-purple-400 font-medium">{email}</span>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        className="gap-2"
                      >
                        <InputOTPGroup>
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="w-12 h-12 text-lg font-bold bg-gray-700 border-purple-500/50 text-white focus:border-purple-400 focus:ring-purple-400/20"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-center font-medium" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-medium rounded-lg"
              disabled={submitting || form.watch("otp").length !== 6}
            >
              {submitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </Form>
        <div className="flex flex-col items-center gap-2 mt-3">
          <Button
            variant="ghost"
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-purple-400 hover:text-purple-300 px-3 py-2 text-sm"
          >
            {resendLoading ? "Resending..." : "Resend code"}
          </Button>
          {otpResent && (
            <span className="text-xs text-green-400 font-medium">A new code has been sent!</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerifyEmailSettings;
