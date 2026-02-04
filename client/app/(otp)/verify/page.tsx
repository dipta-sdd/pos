"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Divider,
  InputOtp,
} from "@heroui/react";
import { Mail, Phone, ShieldCheck, Timer } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";

// Helper functions to mask sensitive data
const maskEmail = (email: string) => {
  const [username, domain] = email.split("@");

  if (username.length <= 2) return `${username[0]}***@${domain}`;

  return `${username[0]}${"*".repeat(username.length - 2)}${username[username.length - 1]}@${domain}`;
};

const maskPhone = (phone: string) => {
  if (phone.length <= 4) return phone;

  return `${phone.slice(0, 2)}${"*".repeat(phone.length - 4)}${phone.slice(-2)}`;
};

export default function VerifyPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [canResend, setCanResend] = useState(false);
  const hasSentRef = useRef(false);

  useEffect(() => {
    if (user?.email_verified_at && user?.mobile_verified_at) {
      router.push("/pos");
    } else if (user && !hasSentRef.current) {
      hasSentRef.current = true;
      sendOtps();
    }
  }, [user, router]);

  useEffect(() => {
    if (!expiryTime) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(
        0,
        Math.floor((expiryTime.getTime() - now.getTime()) / 1000),
      );

      setTimeLeft(diff);

      if (diff <= 0) {
        setCanResend(true);
      } else {
        setCanResend(false);
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sendOtps = async () => {
    setIsLoading(true);
    setCanResend(false);
    try {
      const response = await api.post("/otp/send", { type: "all" });
      const data = response.data as any;

      toast.success(data.message || "Verification codes sent");

      if (data.expires_at) {
        const expiresAt = new Date(data.expires_at);

        setExpiryTime(expiresAt);

        const now = new Date();

        setTimeLeft(Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send codes");
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (value: string) => {
    if (value.length !== 6) return;

    setIsLoading(true);
    try {
      await api.post("/otp/verify", { otp: value });
      toast.success(`Verified successfully`);
      setOtp("");
      await refreshUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid Code");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="flex flex-col items-center pb-0 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Two-Step Verification</h1>
          <p className="text-default-500 text-sm">
            We sent unique codes to your email and mobile. Enter either code to
            verify.
          </p>
        </CardHeader>
        <CardBody className="px-8 py-6 space-y-6">
          {/* OTP Sent Message */}
          <div className="text-center text-default-600 text-sm space-y-2">
            <p>An OTP has been sent to your email and phone number:</p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-center gap-2">
                <Mail className="text-default-400" size={16} />
                <span className="font-medium">{maskEmail(user.email)}</span>
              </div>
              {user.mobile && (
                <div className="flex items-center justify-center gap-2">
                  <Phone className="text-default-400" size={16} />
                  <span className="font-medium">{maskPhone(user.mobile)}</span>
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* Input Section */}
          {(!user.email_verified_at || !user.mobile_verified_at) && (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-default-600 font-medium">
                Enter 6-digit verification code
              </p>
              <InputOtp
                isDisabled={isLoading}
                length={6}
                value={otp}
                onComplete={verifyOtp}
                onValueChange={setOtp}
              />

              {timeLeft > 0 && (
                <div className="flex items-center gap-2 text-warning text-sm font-medium">
                  <Timer size={16} />
                  <span>Expires in {formatTime(timeLeft)}</span>
                </div>
              )}

              <Button
                className="mt-2"
                color="primary"
                isDisabled={isLoading || !canResend}
                size="sm"
                variant="light"
                onPress={sendOtps}
              >
                {canResend
                  ? "Send Verification Codes"
                  : `Resend available in ${formatTime(timeLeft)}`}
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
