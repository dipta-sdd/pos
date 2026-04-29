"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Select, SelectItem, Textarea } from "@heroui/react";
import { useEffect, useState } from "react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Expense, ExpenseCategory, Branch } from "@/lib/types/general";

interface ExpenseFormProps {
  initialData?: Expense | null;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ExpenseForm({
  initialData,
  isEditing = false,
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  const { vendor } = useVendor();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const branches = vendor?.branches || [];

  const expenseSchema = z.object({
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().optional(),
    expense_category_id: z.any(),
    branch_id: z.any(),
    expense_date: z.string().min(1, "Date is required"),
    vendor_id: z.number(),
  });

  type FormData = {
    amount: number;
    description?: string;
    expense_category_id: number;
    branch_id: number;
    expense_date: string;
    vendor_id: number;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      amount: initialData?.amount ? Number(initialData.amount) : 0,
      description: initialData?.description || "",
      expense_category_id: initialData?.expense_category_id,
      branch_id: initialData?.branch_id,
      expense_date: initialData?.expense_date
        ? new Date(initialData.expense_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      vendor_id: vendor?.id,
    },
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchCategories();
    }
  }, [vendor?.id]);

  const fetchCategories = async () => {
    try {
      const response: any = await api.get(
        `/expense-categories?vendor_id=${vendor?.id}&per_page=100`,
      );

      setCategories(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch expense categories", error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (isEditing && initialData?.id) {
        await api.put(`/expenses/${initialData.id}`, data);
        toast.success("Expense updated successfully");
      } else {
        await api.post("/expenses", data);
        toast.success("Expense created successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          isRequired
          label="Amount"
          type="number"
          variant="bordered"
          {...register("amount")}
          errorMessage={errors.amount?.message}
          isInvalid={!!errors.amount}
        />

        <Input
          isRequired
          label="Date"
          type="date"
          variant="bordered"
          {...register("expense_date")}
          errorMessage={errors.expense_date?.message}
          isInvalid={!!errors.expense_date}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          isRequired
          label="Category"
          selectedKeys={
            watch("expense_category_id")
              ? [String(watch("expense_category_id"))]
              : []
          }
          variant="bordered"
          onChange={(e) =>
            setValue("expense_category_id", Number(e.target.value))
          }
        >
          {categories.map((c) => (
            <SelectItem key={c.id} textValue={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </Select>

        <Select
          isRequired
          label="Branch"
          selectedKeys={watch("branch_id") ? [String(watch("branch_id"))] : []}
          variant="bordered"
          onChange={(e) => setValue("branch_id", Number(e.target.value))}
        >
          {branches.map((b) => (
            <SelectItem key={b.id} textValue={b.name}>
              {b.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      <Textarea
        label="Description"
        placeholder="Expense details..."
        variant="bordered"
        {...register("description")}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          {isEditing ? "Update Expense" : "Create Expense"}
        </Button>
      </div>
    </form>
  );
}
