"use client";

import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";

import Input from "@/components/input";

export default function POS() {
  const animals = [
    { key: "cat", label: "Cat" },
    { key: "dog", label: "Dog" },
    { key: "elephant", label: "Elephant" },
    { key: "lion", label: "Lion" },
    { key: "tiger", label: "Tiger" },
    { key: "giraffe", label: "Giraffe" },
    { key: "dolphin", label: "Dolphin" },
    { key: "penguin", label: "Penguin" },
    { key: "zebra", label: "Zebra" },
    { key: "shark", label: "Shark" },
    { key: "whale", label: "Whale" },
    { key: "otter", label: "Otter" },
    { key: "crocodile", label: "Crocodile" },
  ];

  return (
    <div className="min-h-screen-w-nav flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-sm shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="mb-4">
          <p className="text-lg font-medium mb-1">
            You need to create a Vendor to get started.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please fill out the form below to set up your vendor profile. This
            information will help us configure your POS experience.
          </p>
        </div>
        <form className="space-y-4">
          <div>
            <Input
              id="vendor-name"
              isRequired
              label="Vendor Name"
              name="name"
              type="text"
              variant="bordered"
            />
          </div>
          <div>
            <Input
              id="vendor-description"
              isRequired
              label="Description"
              name="description"
              type="text"
              variant="bordered"
            />
          </div>
          <div>
            <Input
              id="vendor-phone"
              isRequired
              label="Phone Number"
              name="phone"
              type="tel"
              variant="bordered"
            />
          </div>
          <div>
            <Input
              id="vendor-address"
              isRequired
              label="Address"
              name="address"
              type="text"
              variant="bordered"
            />
          </div>
          <div>
            <Input
              id="vendor-currency"
              isRequired
              label="Currency"
              name="currency"
              type="text"
              variant="bordered"
            />
          </div>
          <div>
            <Input
              id="vendor-timezone"
              isRequired
              label="Timezone"
              name="timezone"
              type="text"
              variant="bordered"
            />
          </div>
          <div>
            <Select
              id="vendor-language"
              name="language"
              label="Language"
              variant="bordered"
            >
              {animals.map((animal) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="pt-2">
            <Button
              color="primary"
              className="w-full "
              variant="ghost"
              isLoading={true}
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
            >
              Create Vendor
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
