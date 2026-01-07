"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Check, X, Phone } from "lucide-react";
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
  Progress,
} from "@heroui/react";

import { signupSchema, type SignupFormData } from "@/lib/validations/auth";
import { useAuth } from "@/lib/hooks/useAuth";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const watchedPassword = watch("password");

  const handleSubmitForm = async (data: SignupFormData) => {
    if (!acceptedTerms) {
      setError("Please accept the terms and conditions");

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });

      if (success) {
        // Redirect to POS dashboard
        router.push("/pos");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return null;

    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2)
      return {
        strength: "Weak",
        color: "danger",
        value: 25,
      };
    if (score <= 3)
      return {
        strength: "Fair",
        color: "warning",
        value: 50,
      };
    if (score <= 4)
      return {
        strength: "Good",
        color: "primary",
        value: 75,
      };

    return {
      strength: "Strong",
      color: "success",
      value: 100,
    };
  };

  const passwordStrength = getPasswordStrength(watchedPassword);
  const passwordsMatch =
    watchedPassword === watch("confirmPassword") && watchedPassword !== "";

  return (
    <div className="flex items-center justify-center p-4 min-h-screen">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="flex flex-col items-center pb-0">
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-default-500 text-sm">
            Join us and start your journey today
          </p>
        </CardHeader>
        <CardBody className="px-8 py-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(handleSubmitForm)}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="First name"
                variant="bordered"
                startContent={<User className="text-default-400" size={20} />}
                isInvalid={!!errors.firstName}
                errorMessage={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                label="Last name"
                placeholder="Last name"
                variant="bordered"
                startContent={<User className="text-default-400" size={20} />}
                isInvalid={!!errors.lastName}
                errorMessage={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

            {/* Email Field */}
            <Input
              label="Email address"
              placeholder="Enter your email"
              type="email"
              variant="bordered"
              startContent={<Mail className="text-default-400" size={20} />}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email")}
            />

            {/* Mobile Field */}
            <Input
              label="Mobile number"
              placeholder="Enter your mobile number"
              type="tel"
              variant="bordered"
              startContent={<Phone className="text-default-400" size={20} />}
              isInvalid={!!errors.mobile}
              errorMessage={errors.mobile?.message}
              {...register("mobile")}
            />

            {/* Password Field */}
            <div>
              <Input
                label="Password"
                placeholder="Create a password"
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

              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="mt-2 flex items-center gap-2">
                  <Progress
                    size="sm"
                    value={passwordStrength.value}
                    color={
                      passwordStrength.color as
                        | "danger"
                        | "warning"
                        | "primary"
                        | "success"
                    }
                    className="flex-1"
                  />
                  <span
                    className={`text-xs font-medium text-${passwordStrength.color}`}
                  >
                    {passwordStrength.strength}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <Input
                label="Confirm password"
                placeholder="Confirm your password"
                type={showConfirmPassword ? "text" : "password"}
                variant="bordered"
                startContent={<Lock className="text-default-400" size={20} />}
                endContent={
                  <div className="flex items-center gap-2">
                    {watchedPassword &&
                      watch("confirmPassword") &&
                      (passwordsMatch ? (
                        <Check className="text-success" size={20} />
                      ) : (
                        <X className="text-danger" size={20} />
                      ))}
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
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
                  </div>
                }
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              {/* Password Match Indicator */}
              {watchedPassword && watch("confirmPassword") && (
                <p
                  className={`mt-1 text-xs ${passwordsMatch ? "text-success" : "text-danger"}`}
                >
                  {passwordsMatch
                    ? "Passwords match!"
                    : "Passwords do not match"}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <Checkbox
              isSelected={acceptedTerms}
              className="mb-2 items-start"
              classNames={{
                label: "mt-[-2px]",
              }}
              onValueChange={setAcceptedTerms}
              size="sm"
              color="success"
            >
              I agree to the{" "}
              <Link
                className="text-success hover:underline font-medium"
                href="/terms"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                className="text-success hover:underline font-medium"
                href="/privacy"
              >
                Privacy Policy
              </Link>
            </Checkbox>

            <Button
              fullWidth
              color="success"
              className="text-white font-medium shadow-md"
              isLoading={isLoading}
              isDisabled={isLoading || !acceptedTerms}
              type="submit"
            >
              {isLoading ? "Creating account..." : "Create account"}
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
            Already have an account?{" "}
            <Link
              className="font-medium text-success hover:text-success-600 transition-colors duration-200"
              href="/login"
            >
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
