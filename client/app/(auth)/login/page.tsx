"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Input,
  Button,
  Checkbox,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
} from "@heroui/react";

import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useAuth } from "@/lib/hooks/useAuth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputType, setInputType] = useState<"email" | "mobile">("email");
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      inputType: "email",
    },
  });

  const toggleInputType = () => {
    const newType = inputType === "email" ? "mobile" : "email";

    setInputType(newType);
    setValue("inputType", newType);

    // Clear the other field when switching
    if (newType === "email") {
      setValue("mobile", "");
    } else {
      setValue("email", "");
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the login function from auth context
      const success = await login(
        data.email || "",
        data.password,
        data.mobile || ""
      );

      if (success) {
        // Redirect to POS dashboard
        router.push("/pos");
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen-w-nav p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="flex flex-col items-center pb-0">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-default-500 text-sm">
            Sign in to your account to continue
          </p>
        </CardHeader>
        <CardBody className="px-8 py-6 overflow-hidden">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register("inputType")} />

            {inputType === "email" && (
              <Input
                label="Email address"
                placeholder="Enter your email"
                type="email"
                variant="bordered"
                startContent={<Mail className="text-default-400" size={20} />}
                endContent={
                  <button
                    className="text-xs text-primary hover:underline focus:outline-none"
                    type="button"
                    onClick={toggleInputType}
                  >
                    Use Mobile
                  </button>
                }
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                {...register("email")}
              />
            )}

            {inputType === "mobile" && (
              <Input
                label="Mobile number"
                placeholder="Enter your mobile number"
                type="tel"
                variant="bordered"
                startContent={<Phone className="text-default-400" size={20} />}
                endContent={
                  <button
                    className="text-xs text-primary hover:underline focus:outline-none"
                    type="button"
                    onClick={toggleInputType}
                  >
                    Use Email
                  </button>
                }
                isInvalid={!!errors.mobile}
                errorMessage={errors.mobile?.message}
                {...register("mobile")}
              />
            )}

            <Input
              label="Password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              variant="bordered"
              startContent={<Lock className="text-default-400" size={20} />}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff
                      className="text-default-400 pointer-events-none"
                      size={20}
                    />
                  ) : (
                    <Eye
                      className="text-default-400 pointer-events-none"
                      size={20}
                    />
                  )}
                </button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
            />

            <div className="flex items-center justify-between">
              <Checkbox defaultSelected size="sm">
                Remember me
              </Checkbox>
              <Link
                className="text-sm text-primary hover:underline font-medium transition-colors duration-200"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              fullWidth
              color="primary"
              isLoading={isLoading}
              type="submit"
              className="font-medium shadow-md"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <Divider className="flex-1" />
            <span className="text-xs text-default-400">OR CONTINUE WITH</span>
            <Divider className="flex-1" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="bordered"
              startContent={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="currentColor"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="currentColor"
                  />
                </svg>
              }
            >
              Google
            </Button>
            <Button
              variant="bordered"
              startContent={
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              }
            >
              Twitter
            </Button>
          </div>
        </CardBody>
        <CardFooter className="justify-center pb-6 pt-2">
          <p className="text-default-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link
              className="font-medium text-primary hover:text-primary-600 transition-colors duration-200"
              href="/signup"
            >
              Sign up for free
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
