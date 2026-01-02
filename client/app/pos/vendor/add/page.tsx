"use client";

import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useRouter } from "next/navigation";

import Input from "@/components/input";
import { timezones } from "@/components/timezone";
import { Navbar2 } from "@/components/navbar2";
import {
  vendorOnboardingSchema,
  type VendorOnboardingFormData,
} from "@/lib/validations/vendor";
import api from "@/lib/api";
import { Membership, User } from "@/lib/types/auth";
import { useAuth } from "@/lib/hooks/useAuth";

export default function POS() {
  const currencies = [{ key: "BDT", label: "BDT" }];
  const languages = [{ key: "en", label: "English" }];

  const { user, setUser } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
  } = useForm<VendorOnboardingFormData>({
    resolver: zodResolver(vendorOnboardingSchema),
    defaultValues: {
      currency: "BDT",
      language: "en",
      timezone: "Asia/Dhaka",
    },
  });

  const onSubmit = async (data: VendorOnboardingFormData) => {
    try {
      const response = await api.post("/vendors", data);
      const membership: Membership = response.data as Membership;

      setUser({
        ...(user as User),
        memberships: [...(user as User).memberships, membership],
      });
      router.push(`/pos/vendor/${membership.vendor.id}`);

      // You can add navigation here: router.push('/pos/[vendorId]')
    } catch (_error) {
      // console.error("Error creating vendor:", error);
      // console.error("Error creating vendor:", error);
      // TODO: Show error message to user
      // You can add toast notification here
    }
  };

  return (
    <div className="w-full flex flex-col items-stretch">
      <Navbar2 />
      <div className="min-h-screen-w-nav flex items-center justify-center p-4">
        <div className="w-full bg-white dark:bg-gray-800 rounded-sm shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <p className="text-lg font-medium mb-1">
              You need to create a Vendor to get started.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please fill out the form below to set up your vendor profile. This
              information will help us configure your POS experience.
            </p>
          </div>
          <form
            noValidate
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <Input
                isRequired
                id="vendor-name"
                label="Vendor Name"
                type="text"
                variant="bordered"
                {...register("name")}
                errorMessage={errors.name?.message}
                isInvalid={!!errors.name}
              />
            </div>
            <div>
              <Input
                id="vendor-description"
                label="Description"
                type="text"
                variant="bordered"
                {...register("description")}
                errorMessage={errors.description?.message}
                isInvalid={!!errors.description}
              />
            </div>
            <div>
              <Input
                isRequired
                id="vendor-phone"
                label="Phone Number"
                type="tel"
                variant="bordered"
                {...register("phone")}
                errorMessage={errors.phone?.message}
                isInvalid={!!errors.phone}
              />
            </div>
            <div>
              <Input
                isRequired
                id="vendor-address"
                label="Address"
                type="text"
                variant="bordered"
                {...register("address")}
                errorMessage={errors.address?.message}
                isInvalid={!!errors.address}
              />
            </div>
            <div>
              <Autocomplete
                isRequired
                defaultItems={currencies}
                errorMessage={errors.currency?.message}
                id="vendor-currency"
                isInvalid={!!errors.currency}
                label="Currency"
                selectedKey={watch("currency")}
                variant="bordered"
                onSelectionChange={(key) => {
                  setValue("currency", key as string);
                  trigger("currency");
                }}
              >
                {(currency) => (
                  <AutocompleteItem key={currency.key}>
                    {currency.key}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
            <div>
              <Autocomplete
                isRequired
                defaultItems={timezones}
                errorMessage={errors.timezone?.message}
                id="vendor-timezone"
                isInvalid={!!errors.timezone}
                label="Timezone"
                selectedKey={watch("timezone")}
                variant="bordered"
                onSelectionChange={(key) => {
                  setValue("timezone", key as string);
                  trigger("timezone");
                }}
              >
                {(timezone) => (
                  <AutocompleteItem key={timezone.zone}>
                    {timezone.zone + " " + timezone.utc}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
            <div>
              <Select
                errorMessage={errors.language?.message}
                id="vendor-language"
                isInvalid={!!errors.language}
                label="Language"
                selectedKeys={[watch("language")]}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;

                  setValue("language", selectedKey);
                  trigger("language");
                }}
              >
                {languages.map((language) => (
                  <SelectItem key={language.key}>{language.label}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="pt-2 space-y-2">
              <Button
                className="w-full"
                color="primary"
                isLoading={isSubmitting}
                spinner={
                  <svg
                    className="animate-spin h-5 w-5 text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                }
                type="submit"
                variant="ghost"
              >
                Create Vendor
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
