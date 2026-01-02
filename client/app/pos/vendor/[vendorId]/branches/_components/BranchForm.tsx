"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { toast } from "sonner";
import { useState } from "react";

const branchSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Branch name must be at least 2 characters." }),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  vendor_id: z.number().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BranchForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: BranchFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      vendor_id: vendor?.id,
    },
  });

  const onSubmit = async (data: BranchFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/branches/${initialData.id}`, data);
        toast.success("Branch updated successfully");
      } else {
        await api.post("/branches", data);
        toast.success("Branch created successfully");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/pos/vendor/${vendor?.id}/branches`);
        router.refresh();
      }
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          form.setError(key as any, {
            type: "server",
            message: errors[key][0],
          });
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8 w-full max-w-2xl"
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded border border-gray-200 dark:border-gray-700 w-full">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              {...form.register("name")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Main Branch"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              {...form.register("description")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                {...form.register("phone")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., +1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                {...form.register("address")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 123 Main St"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update Branch"
              : "Create Branch"}
        </button>
      </div>
    </form>
  );
}
