import React, { useRef, useEffect, useState } from "react";
import { Autocomplete, AutocompleteItem, Avatar, Kbd } from "@heroui/react";
import { Package } from "lucide-react";
import { clsx } from "clsx";

import { SearchIcon } from "@/components/icons";
import { BACKEND_URL } from "@/lib/api";

interface KeyboardSearchProps {
  onSearch: (query: string) => Promise<any[] | { data: any[] }>;
  onSelect: (item: any, query: string) => void;
  isFocused: boolean;
  focusTrigger: number;
}

export const KeyboardSearch: React.FC<KeyboardSearchProps> = ({
  onSearch,
  onSelect,
  isFocused,
  focusTrigger,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasSearched, setHasSentSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus management
  useEffect(() => {
  
    if (isFocused && inputRef.current) {
      const timer = setTimeout(() => {
        const el = inputRef.current;
        if (el) {
          if (typeof el.focus === "function") {
            el.focus();
          }
          // Also try to find internal input if it's a wrapper
          const innerInput =
            el.querySelector?.("input") || (el as any).inputElement;
          if (innerInput && typeof innerInput.focus === "function") {
            innerInput.focus();
            innerInput.select?.();
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isFocused, focusTrigger]);

  const handleInputChange = async (value: string) => {
    setInputValue(value);
    if (value.length < 1) {
      setItems([]);
      setHasSentSearched(false);

      return;
    }

    setIsLoading(true);
    const results = await onSearch(value);

    // Handle Laravel pagination (data: []) or direct array
    const data = Array.isArray(results)
      ? results
      : (results as any)?.data || [];

    setItems(data);
    setIsLoading(false);
    setHasSentSearched(true);
  };

  const isNotFound =
    hasSearched && items.length === 0 && !isLoading && inputValue.length > 0;

  return (
    <div className="mb-4">
      <Autocomplete
        ref={(el: any) => {
          (inputRef as any).current = el;
        }}
        aria-label="Search products"
        classNames={{
          base: "max-w-full",
          listboxWrapper: "max-h-[400px]",
          // @ts-ignore
          inputWrapper: clsx(
            "h-[60px] border-2 transition-colors",
            isNotFound ? "bg-danger-50 border-danger-200" : "bg-default-50",
          ),
        }}
        endContent={
          <Kbd>F1</Kbd>
        }
        inputValue={inputValue}
        isLoading={isLoading}
        items={items}
        listboxProps={{
          emptyContent:
            inputValue.length > 0 ? "No products found." : "Start typing...",
        }}
        placeholder="Scan Barcode or Type Product Name..."
        radius="lg"
        size="lg"
        startContent={
          <SearchIcon
            className={clsx(isNotFound ? "text-danger" : "text-default-400")}
          />
        }
        variant="bordered"
        onInputChange={handleInputChange}
        onSelectionChange={(key) => {
          if (key) {
            const selected = items.find((i) => String(i.id) === String(key));

            if (selected) {

              // Explicitly blur to prevent Autocomplete from stealing focus back
              if (inputRef.current) {
                const input = inputRef.current.querySelector("input");
                if (input) {
                  input.blur(); 
                }
              }
              onSelect(selected, inputValue);
              setInputValue("");
              setItems([]);
              setHasSentSearched(false);
            }
          }
        }}
      >
        {(item) => (
          <AutocompleteItem
            key={item.id}
            className="py-2"
            textValue={item.product_name}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-3 items-center">
                <Avatar
                  className="bg-default-100 dark:bg-white/5"
                  fallback={<Package className="w-4 h-4 text-default-500 dark:text-white/20" />}
                  size="sm"
                  radius="sm"
                  src={item.image_url ? BACKEND_URL + item.image_url : undefined}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{item.product_name}</span>
                  <span className="text-[10px] text-default-400 uppercase tracking-wider">
                    {item.variant_name}: {item.variant_value} • SKU: {item.sku}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-mono font-black text-primary">
                  ${Number(item.base_price || 0).toLocaleString()}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 rounded ${Number(item.total_quantity) > 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                >
                  Stock: {Number(item.total_quantity)}
                </span>
              </div>
            </div>
          </AutocompleteItem>
        )}
      </Autocomplete>
    </div>
  );
};
