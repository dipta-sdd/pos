"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Input,
  Button,
  Select,
  SelectItem,
  Card,
  CardBody,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import debounce from "lodash/debounce";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Variant as BaseVariant } from "@/lib/types/general";

interface Variant extends BaseVariant {
  product_name: string;
  variant_name: string;
}

const transferSchema = z.object({
  from_branch_id: z.coerce.number().min(1, "Source branch is required"),
  to_branch_id: z.coerce.number().min(1, "Destination branch is required"),
  notes: z.string().optional(),
  status: z.string().default("requested"),
  vendor_id: z.number(),
  items: z
    .array(
      z.object({
        variant_id: z.coerce.number().min(1, "Product is required"),
        quantity: z.coerce
          .number()
          .min(0.01, "Quantity must be greater than 0"),
        status: z.string().default("requested"),
        variant: z.any().optional(),
      }),
    )
    .min(1, "At least one item is required"),
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function CreateReceivingTransferForm() {
  const { vendor, membership } = useVendor();
  const router = useRouter();
  const allBranches = vendor?.branches || [];
  const assignedBranchIds =
    membership?.user_branch_assignments?.map((a) => a.branch_id) || [];

  const [searchResults, setSearchResults] = useState<Variant[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { register, handleSubmit, control, watch, setValue } =
    useForm<TransferFormData>({
      // @ts-ignore
      resolver: zodResolver(transferSchema),
      defaultValues: {
        notes: "",
        status: "requested",
        vendor_id: vendor?.id || 0,
        items: [],
      },
    });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = watch("items");

  const handleSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);

        return;
      }
      setSearchLoading(true);
      try {
        const response: any = await api.get(
          "/stock-transfers/search-variants",
          {
            params: {
              vendor_id: vendor?.id,
              search: query,
            },
          },
        );

        setSearchResults(response.data?.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    [vendor?.id],
  );

  const onAddProduct = (variant: Variant) => {
    const existingIndex = watchItems.findIndex(
      (i) => i.variant_id === variant.id,
    );

    if (existingIndex > -1) {
      toast.info("Product already in list");

      return;
    }

    append({
      variant_id: variant.id,
      quantity: 1,
      status: "requested",
      variant: variant,
    });
  };

  const onSubmit = async (data: any) => {
    try {
      await api.post("/stock-transfers", data);
      toast.success("Request created successfully");
      router.push(`/pos/vendor/${vendor?.id}/inventory/transfers/receiving`);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Create Incoming Request
          </h1>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm">
            <CardBody className="p-8">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <Select
                    isRequired
                    label="Request From"
                    placeholder="Select source branch"
                    variant="bordered"
                    {...register("from_branch_id")}
                  >
                    {allBranches.map((branch) => (
                      <SelectItem key={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    isRequired
                    label="Receive At"
                    placeholder="Select destination branch"
                    variant="bordered"
                    {...register("to_branch_id")}
                  >
                    {allBranches
                      .filter((b) => assignedBranchIds.includes(b.id))
                      .map((branch) => (
                        <SelectItem key={branch.id.toString()}>
                          {branch.name}
                        </SelectItem>
                      ))}
                  </Select>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3 shadow-sm overflow-hidden">
            <CardBody className="p-0">
              <div className="p-8 border-b flex justify-between items-center gap-4">
                <div className="flex-1 max-w-md">
                  <Autocomplete
                    isLoading={searchLoading}
                    placeholder="Search products by name, SKU, or barcode..."
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">🔍</span>
                      </div>
                    }
                    variant="bordered"
                    onInputChange={handleSearch}
                  >
                    {searchResults.map((variant) => (
                      <AutocompleteItem
                        key={variant.id}
                        textValue={`${variant.product_name} - ${variant.variant_name}`}
                        onPress={() => onAddProduct(variant)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {variant.product_name}
                          </span>
                          <span className="text-xs text-default-500">
                            {variant.variant_name}
                          </span>
                        </div>
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-default-50/50">
                      <th className="py-4 px-6 font-semibold text-sm">
                        Product Details
                      </th>
                      <th className="py-4 px-6 font-semibold text-sm w-48 text-center">
                        Requested Quantity
                      </th>
                      <th className="py-4 px-6 font-semibold text-sm w-24 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.length === 0 ? (
                      <tr>
                        <td
                          className="py-12 text-center text-default-400"
                          colSpan={3}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span>No items added yet</span>
                            <span className="text-sm">
                              Search and add products to request
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      fields.map((field, index) => {
                        const item = watchItems[index];

                        return (
                          <tr
                            key={field.id}
                            className="border-b hover:bg-default-50/50"
                          >
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-sm">
                                  {item.variant?.product_name}
                                </span>
                                <span className="text-xs text-default-500">
                                  {item.variant?.variant_name}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Input
                                size="sm"
                                type="number"
                                variant="bordered"
                                {...register(
                                  `items.${index}.quantity` as const,
                                )}
                                classNames={{
                                  input: "text-center pr-8",
                                  inputWrapper: "h-9",
                                }}
                                endContent={
                                  <span className="text-default-400 text-xs">
                                    {item.variant?.unit_abbreviation}
                                  </span>
                                }
                              />
                            </td>
                            <td className="py-4 px-6 text-center">
                              <Button
                                isIconOnly
                                color="danger"
                                size="sm"
                                variant="light"
                                onPress={() => remove(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <Button
            variant="bordered"
            onPress={() =>
              router.push(
                `/pos/vendor/${vendor?.id}/inventory/transfers/receiving`,
              )
            }
          >
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={fields.length === 0}
            type="submit"
          >
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
}
