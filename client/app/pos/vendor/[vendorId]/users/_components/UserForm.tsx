"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Button, Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";

interface UserFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

export default function UserForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
  readOnly = false,
}: UserFormProps) {
  const { vendor } = useVendor();
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);

  const userSchema = z.object({
    vendor_id: z.number().optional(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    mobile: z.string().optional(),
    role_id: z.number(),
    // Password is required only for creating a new user
    password: isEditing
      ? z.string().optional()
      : z.string().min(8, "Password must be at least 8 characters"),
  });

  type UserFormData = z.infer<typeof userSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      mobile: initialData?.mobile || "",
      role_id: initialData?.role_id ? Number(initialData.role_id) : undefined,
      vendor_id: vendor?.id,
    },
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchRoles();
    }
  }, [vendor?.id]);

  useEffect(() => {
    if (initialData && initialData.role_id) {
      setValue("role_id", Number(initialData.role_id));
    }
  }, [initialData, setValue]);

  const fetchRoles = async () => {
    try {
      const response = await api.get(
        `/roles?vendor_id=${vendor?.id}&per_page=100`
      );
      // @ts-ignore
      setRoles(response.data.data);
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/users/${initialData.id}`, {
          ...data,
          vendor_id: vendor?.id,
        });
        toast.success("User updated successfully");
      } else {
        await api.post("/users", { ...data, vendor_id: vendor?.id });
        toast.success("User created successfully");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/pos/vendor/${vendor?.id}/users`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-6 w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          isRequired
          label="First Name"
          placeholder="John"
          variant="bordered"
          {...register("firstName")}
          errorMessage={errors.firstName?.message}
          isInvalid={!!errors.firstName}
          isDisabled={readOnly}
        />

        <Input
          isRequired
          label="Last Name"
          placeholder="Doe"
          variant="bordered"
          {...register("lastName")}
          errorMessage={errors.lastName?.message}
          isInvalid={!!errors.lastName}
          isDisabled={readOnly}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          isRequired
          label="Email"
          placeholder="john.doe@example.com"
          type="email"
          variant="bordered"
          {...register("email")}
          errorMessage={errors.email?.message}
          isInvalid={!!errors.email}
          isDisabled={readOnly || isEditing} // Prevent email change generally or use specific logic
        />

        <Input
          label="Mobile"
          placeholder="+1234567890"
          variant="bordered"
          {...register("mobile")}
          errorMessage={errors.mobile?.message}
          isInvalid={!!errors.mobile}
          isDisabled={readOnly}
        />
      </div>

      {!isEditing && (
        <Input
          isRequired
          label="Password"
          placeholder="********"
          type="password"
          variant="bordered"
          {...register("password")}
          errorMessage={errors.password?.message}
          isInvalid={!!errors.password}
          isDisabled={readOnly}
        />
      )}

      {/* Role Selection */}
      <Select
        isRequired
        label="Role"
        placeholder="Select a role"
        variant="bordered"
        selectedKeys={watch("role_id") ? [String(watch("role_id"))] : []}
        onChange={(e) => setValue("role_id", Number(e.target.value))}
        errorMessage={errors.role_id?.message}
        isInvalid={!!errors.role_id}
        isDisabled={readOnly}
      >
        {roles.map((role) => (
          <SelectItem key={role.id} textValue={role.name}>
            {role.name}
          </SelectItem>
        ))}
      </Select>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          color="default"
          variant="flat"
          onPress={onCancel || (() => router.back())}
        >
          {readOnly ? "Go Back" : "Cancel"}
        </Button>
        {!readOnly && (
          <Button color="primary" isLoading={isSubmitting} type="submit">
            {isEditing ? "Update User" : "Create User"}
          </Button>
        )}
      </div>
    </form>
  );
}
