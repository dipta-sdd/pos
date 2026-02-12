"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input, Button, Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { BillingCounter } from "@/lib/types/general";
import { useAuth } from "@/lib/hooks/useAuth";

interface CashSessionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CashSessionForm({
  onSuccess,
  onCancel,
}: CashSessionFormProps) {
  const { vendor } = useVendor();
  const { user } = useAuth();
  const [counters, setCounters] = useState<BillingCounter[]>([]);

  const schema = z.object({
    billing_counter_id: z.any(),
    user_id: z.number(),
    opening_balance: z.coerce.number().min(0, "Balance must be positive"),
    started_at: z.string().min(1, "Start time is required"),
    status: z.enum(["open", "closed"]),
  });

  type FormData = {
    billing_counter_id: number;
    user_id: number;
    opening_balance: number;
    started_at: string;
    status: "open" | "closed";
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      user_id: user?.id,
      opening_balance: 0,
      started_at: new Date().toISOString(),
      status: "open",
    },
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchCounters();
    }
  }, [vendor?.id]);

  const fetchCounters = async () => {
    try {
      const response: any = await api.get(
        `/billing-counters?vendor_id=${vendor?.id}&per_page=100`,
      );

      setCounters(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch counters", error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await api.post("/cash-register-sessions", data);
      toast.success("Cash session opened successfully");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
      <Select
        isRequired
        label="Billing Counter"
        placeholder="Select counter"
        selectedKeys={
          watch("billing_counter_id")
            ? [String(watch("billing_counter_id"))]
            : []
        }
        variant="bordered"
        onChange={(e) => setValue("billing_counter_id", Number(e.target.value))}
      >
        {counters.map((c) => (
          <SelectItem key={c.id} textValue={c.name}>
            {c.name}
          </SelectItem>
        ))}
      </Select>

      <Input
        isRequired
        label="Opening Balance"
        type="number"
        variant="bordered"
        {...register("opening_balance")}
        errorMessage={errors.opening_balance?.message}
        isInvalid={!!errors.opening_balance}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button color="default" variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="primary" isLoading={isSubmitting} type="submit">
          Open Register
        </Button>
      </div>
    </form>
  );
}
