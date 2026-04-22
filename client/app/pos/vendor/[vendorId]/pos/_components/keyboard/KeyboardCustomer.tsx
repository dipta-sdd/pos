import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Input,
  Card,
  CardBody,
  Listbox,
  ListboxItem,
  ScrollShadow,
} from "@heroui/react";
import { User, Phone, Search } from "lucide-react";
import debounce from "lodash/debounce";

import api from "@/lib/api";
import { Customer } from "@/lib/types/general";

interface KeyboardCustomerProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer | null) => void;
  onTempChange: (name: string, mobile: string) => void;
  isFocused: boolean;
}

export const KeyboardCustomer: React.FC<KeyboardCustomerProps> = ({
  selectedCustomer,
  onSelect,
  onTempChange,
  isFocused,
}) => {
  const [name, setName] = useState(selectedCustomer?.name || "");
  const [mobile, setMobile] = useState(selectedCustomer?.phone || "");
  const [results, setResults] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);

  // Sync internal state with selectedCustomer prop
  useEffect(() => {
    if (selectedCustomer) {
      setName(selectedCustomer.name);
      setMobile(selectedCustomer.phone || "");
      setShowResults(false);
    }
  }, [selectedCustomer]);

  // Focus management
  useEffect(() => {
    if (isFocused && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [isFocused]);

  const searchCustomers = async (val: string) => {
    if (val.length < 2) {
      setResults([]);
      setShowResults(false);

      return;
    }

    setIsLoading(true);
    try {
      // Using the requested 'pos' prefix endpoint
      const res: any = await api.get("/pos/customers", {
        params: { search: val },
      });
      const data = res.data.data || [];

      setResults(data);
      setShowResults(data.length > 0);
    } catch (err) {
      console.error("Customer search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchCustomers, 300), []);

  const handleNameChange = (val: string) => {
    setName(val);
    onTempChange(val, mobile);
    if (!selectedCustomer) debouncedSearch(val);
  };

  const handleMobileChange = (val: string) => {
    setMobile(val);
    onTempChange(name, val);
    if (!selectedCustomer) debouncedSearch(val);
  };

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    setShowResults(false);
  };

  const clearSelection = () => {
    onSelect(null);
    setName("");
    setMobile("");
    onTempChange("", "");
    nameRef.current?.focus();
  };

  return (
    <Card
      className="border border-default-200 relative overflow-visible"
      shadow="sm"
    >
      <CardBody className="p-4 gap-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-default-400">
            Customer Info [F2]
          </span>
          {selectedCustomer && (
            <button
              className="text-[10px] text-danger font-bold hover:underline"
              onClick={clearSelection}
            >
              CLEAR
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Input
            ref={nameRef}
            classNames={{
              label: "font-bold text-[10px] uppercase",
              input: "font-medium",
            }}
            label="Name / Identifier"
            placeholder="Walk-in Customer"
            size="sm"
            startContent={<User className="text-default-400" size={14} />}
            value={name}
            variant="bordered"
            onValueChange={handleNameChange}
          />
          <Input
            ref={mobileRef}
            classNames={{
              label: "font-bold text-[10px] uppercase",
              input: "font-mono",
            }}
            label="Mobile Number"
            placeholder="01XXXXXXXXX"
            size="sm"
            startContent={<Phone className="text-default-400" size={14} />}
            value={mobile}
            variant="bordered"
            onValueChange={handleMobileChange}
          />
        </div>

        {/* Floating Results Dropdown */}
        {showResults && !selectedCustomer && (
          <div className="absolute top-[100%] left-0 right-0 z-[100] mt-1 bg-content1 border border-default-200 rounded-lg shadow-2xl overflow-hidden">
            <ScrollShadow className="max-h-[200px]">
              <Listbox
                aria-label="Customer search results"
                onAction={(key) => {
                  const c = results.find((r) => String(r.id) === String(key));

                  if (c) handleSelect(c);
                }}
              >
                {results.map((c) => (
                  <ListboxItem key={c.id} className="py-2" textValue={c.name}>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{c.name}</span>
                        <span className="text-[10px] text-default-400 font-mono">
                          {c.phone || "No phone"}
                        </span>
                      </div>
                      <Search className="text-primary opacity-50" size={14} />
                    </div>
                  </ListboxItem>
                ))}
              </Listbox>
            </ScrollShadow>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
