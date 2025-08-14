import { z } from "zod";

// Login validation schema
export const loginSchema = z.object({
  email: z.string().optional(),
  mobile: z.string().optional(),
  password: z.string().min(1, "Password is required"),
  inputType: z.enum(["email", "mobile"]),
}).superRefine((data, ctx) => {
  // Validate based on inputType
  if (data.inputType === "email") {
    if (!data.email || data.email.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email is required",
        path: ["email"],
      });
    } else if (!z.string().email().safeParse(data.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid email address",
        path: ["email"],
      });
    }
  } else if (data.inputType === "mobile") {
    if (!data.mobile || data.mobile.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mobile number is required",
        path: ["mobile"],
      });
    } else if (!/^[0-9+\-\s()]{10,}$/.test(data.mobile)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mobile number must be at least 10 digits",
        path: ["mobile"],
      });
    }
  }
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Signup validation schema
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    mobile: z
      .string()
      .min(10, "Mobile number must be at least 10 digits")
      .regex(/^[0-9+\-\s()]+$/, "Please enter a valid mobile number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
