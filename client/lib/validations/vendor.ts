import { z } from "zod";

// Vendor onboarding validation schema
export const vendorOnboardingSchema = z.object({
  name: z
    .string()
    .min(1, "Vendor name is required")
    .min(3, "Vendor name must be at least 3 characters")
    .max(100, "Vendor name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_&.]+$/, "Vendor name contains invalid characters"),
  
  description: z
    .string()
    .min(0)
    .max(500, "Description must be less than 500 characters")
    .optional(),
  
  phone: z
    .string()
    .min(1, "Phone number is required")
    .min(11, "Phone number must be at least 11 digits")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  
  address: z
    .string()
    .min(1, "Address is required") 
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be less than 200 characters"),
  
  currency: z
    .string()
    .min(1, "Currency is required")
    .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter code (e.g., USD, EUR, BDT)"),
  
  timezone: z
    .string()
    .min(1, "Timezone is required")
    .regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, "Please select a valid timezone"),
  
  language: z
    .string()
    .min(1, "Language is required")
    .regex(/^[a-z]{2}$/, "Language must be a 2-letter code (e.g., en, es, fr)"),
});

export type VendorOnboardingFormData = z.infer<typeof vendorOnboardingSchema>;

// Optional: Create a partial schema for updates
export const vendorUpdateSchema = vendorOnboardingSchema.partial();

export type VendorUpdateFormData = z.infer<typeof vendorUpdateSchema>; 