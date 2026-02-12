"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Switch } from "@heroui/react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { UnitOfMeasure } from "@/lib/types/general";

interface UnitOfMeasureFormProps {
  initialData?: UnitOfMeasure | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UnitOfMeasureForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: UnitOfMeasureFormProps) {
  const { vendor } = useVendor();

  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    abbreviation: z.string().min(1, "Abbreviation is required"),
    is_decimal_allowed: z.boolean(),
    vendor_id: z.number(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      abbreviation: initialData?.abbreviation || "",
      is_decimal_allowed: initialData?.is_decimal_allowed ?? false,
      vendor_id: vendor?.id,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/units-of-measure/${initialData.id}`, data);
        toast.success("Unit updated successfully");
      } else {
        await api.post("/units-of-measure", data);
        toast.success("Unit created successfully");
      }
      if (onSuccess) onSuccess();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.entries(error.response?.data?.errors).forEach(([key, value]) => {
          setError(key as any, {
            type: "manual",
            message: (value as string[])[0],
          });
        });
      }
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          isRequired
          label="Unit Name"
          placeholder="e.g. Kilogram"
          variant="bordered"
          {...register("name")}
          errorMessage={errors.name?.message}
          isInvalid={!!errors.name}
        />
        <Input
          isRequired
          label="Abbreviation"
          placeholder="e.g. kg"
          variant="bordered"
          {...register("abbreviation")}
          errorMessage={errors.abbreviation?.message}
          isInvalid={!!errors.abbreviation}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          isSelected={watch("is_decimal_allowed")}
          onValueChange={(val) => setValue("is_decimal_allowed", val)}
        />
        <span className="text-sm font-medium">Decimal Allowed</span>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Unit" : "Create Unit"}
        </Button>
      </div>
    </form>
  );
}
