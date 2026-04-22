import React, { useRef, useEffect, useState } from "react";
import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { SearchIcon } from "@/components/icons";
import { Box } from "lucide-react";
import { clsx } from "clsx";

interface KeyboardSearchProps {
  onSearch: (query: string) => Promise<any[]>;
  onSelect: (item: any) => void;
  isFocused: boolean;
}

export const KeyboardSearch: React.FC<KeyboardSearchProps> = ({
  onSearch,
  onSelect,
  isFocused,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasSearched, setHasSentSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus management
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleInputChange = async (value: string) => {
    setInputValue(value);
    if (value.length < 1) {
      setItems([]);
      setHasSentSearched(false);
      return;
    }

    setIsLoading(true);
    const results = await onSearch(value);
    setItems(results);
    setIsLoading(false);
    setHasSentSearched(true);
  };

  const isNotFound = hasSearched && items.length === 0 && !isLoading && inputValue.length > 0;

  return (
    <div className="mb-4">
      <Autocomplete
        ref={inputRef}
        aria-label="Search products"
        placeholder="Scan Barcode or Type Product Name..."
        variant="bordered"
        size="lg"
        radius="lg"
        isLoading={isLoading}
        items={items}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onSelectionChange={(key) => {
          if (key) {
            const selected = items.find((i) => String(i.id) === String(key));
            if (selected) {
              onSelect(selected);
              setInputValue("");
              setItems([]);
              setHasSentSearched(false);
            }
          }
        }}
        startContent={<SearchIcon className={clsx(isNotFound ? "text-danger" : "text-default-400")} />}
        endContent={<span className="text-default-400 text-tiny font-black">[F1]</span>}
        classNames={{
          base: "max-w-full",
          listboxWrapper: "max-h-[400px]",
          inputWrapper: clsx(
            "h-[60px] border-2 transition-colors",
            isNotFound ? "bg-danger-50 border-danger-200" : "bg-default-50"
          )
        }}
        listboxProps={{
          emptyContent: inputValue.length > 0 ? "No products found." : "Start typing...",
        }}
      >
        {(item) => (
          <AutocompleteItem 
            key={item.id} 
            textValue={item.product_name}
            className="py-2"
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-3 items-center">
                <Avatar
                  size="sm"
                  src={item.image_url}
                  fallback={<Box className="w-4 h-4 text-default-500" />}
                  className="bg-default-100"
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
                <span className={`text-[10px] font-bold px-1.5 rounded ${Number(item.total_quantity) > 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
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
