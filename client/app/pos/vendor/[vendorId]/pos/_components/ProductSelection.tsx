"use client";

import { useState, useEffect, useRef } from "react";
import { Input, Card, CardBody, Image, Skeleton } from "@heroui/react";
import { Search, Barcode, Grid3X3, List } from "lucide-react";

import api from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Product, Variant, ProductStock } from "@/lib/types/general";

interface ProductSelectionProps {
  onSelect: (product: Product, variant: Variant, batch: ProductStock) => void;
}

export default function ProductSelection({ onSelect }: ProductSelectionProps) {
  const { vendor } = useVendor();
  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async (query = "") => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      // Using branch-products endpoint to get stock info
      const response: any = await api.get(`/branch-products`, {
        params: {
          vendor_id: vendor.id,
          search: query,
          per_page: 20,
        },
      });

      setItems(response.data.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [vendor?.id]);

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !vendor?.id) return;

    try {
      // Find variant by barcode
      const response: any = await api.get(`/branch-products`, {
        params: {
          vendor_id: vendor.id,
          search: barcode,
          per_page: 1,
        },
      });

      const variantData = response.data.data[0];

      if (variantData) {
        // Fetch batches for this variant
        const stocksResponse: any = await api.get(`/branch-products/stocks`, {
          params: { variant_id: variantData.id },
        });

        const stocks = stocksResponse.data;

        if (stocks.length > 0) {
          // FEFO Logic: Sort by expiry date
          const sortedStocks = [...stocks].sort((a, b) => {
            if (!a.expiry_date) return 1;
            if (!b.expiry_date) return -1;

            return (
              new Date(a.expiry_date).getTime() -
              new Date(b.expiry_date).getTime()
            );
          });

          const selectedBatch = sortedStocks[0];
          // Mocking the full product/variant object for now based on variantData
          const product: any = {
            id: variantData.product_id,
            name: variantData.product_name,
            image_url: variantData.image_url,
          };
          const variant: any = {
            id: variantData.id,
            name: variantData.variant_name,
            sku: variantData.sku,
            barcode: variantData.barcode,
          };

          onSelect(product, variant, selectedBatch);
          setBarcode("");
        } else {
          // Handle no stock
        }
      }
    } catch (error) {
      console.error("Barcode scan failed", error);
    }
  };

  // Keep barcode input focused
  useEffect(() => {
    const handleGlobalKeyDown = () => {
      // Don't focus if we are typing in another input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      barcodeRef.current?.focus();
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <form onSubmit={handleBarcodeSubmit}>
          <Input
            ref={barcodeRef}
            className="w-full"
            placeholder="Scan Barcode (Always Ready)"
            size="lg"
            startContent={<Barcode className="text-default-400" />}
            value={barcode}
            variant="bordered"
            onValueChange={setBarcode}
          />
        </form>
        <Input
          className="w-full"
          placeholder="Search by name or SKU..."
          size="lg"
          startContent={<Search className="text-default-400" />}
          value={search}
          variant="flat"
          onValueChange={(val) => {
            setSearch(val);
            fetchProducts(val);
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-[200px]">
                <Skeleton className="rounded-lg h-3/5" />
                <div className="space-y-3 p-3">
                  <Skeleton className="w-3/5 rounded-lg h-3" />
                  <Skeleton className="w-4/5 rounded-lg h-3" />
                </div>
              </Card>
            ))
          ) : items.length > 0 ? (
            items.map((item) => (
              <Card
                key={item.id}
                isPressable
                className="group border-none shadow-sm hover:shadow-md transition-all h-[220px]"
                onPress={async () => {
                  // When clicking, we still want FEFO batch
                  const stocksResponse: any = await api.get(
                    `/branch-products/stocks`,
                    {
                      params: { variant_id: item.id },
                    },
                  );
                  const stocks = stocksResponse.data;

                  if (stocks.length > 0) {
                    const sortedStocks = [...stocks].sort((a, b) => {
                      if (!a.expiry_date) return 1;
                      if (!b.expiry_date) return -1;

                      return (
                        new Date(a.expiry_date).getTime() -
                        new Date(b.expiry_date).getTime()
                      );
                    });

                    const product: any = {
                      id: item.product_id,
                      name: item.product_name,
                      image_url: item.image_url,
                    };
                    const variant: any = {
                      id: item.id,
                      name: item.variant_name,
                      sku: item.sku,
                      barcode: item.barcode,
                    };

                    onSelect(product, variant, sortedStocks[0]);
                  }
                }}
              >
                <CardBody className="p-0 overflow-hidden relative">
                  <div className="h-32 bg-default-100 flex items-center justify-center overflow-hidden">
                    {item.image_url ? (
                      <Image
                        alt={item.product_name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                        src={item.image_url}
                      />
                    ) : (
                      <Grid3X3 className="w-10 h-10 text-default-300" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold truncate text-default-700">
                      {item.product_name}
                    </p>
                    <p className="text-[10px] text-default-400 truncate">
                      {item.variant_name} • {item.sku}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-primary font-bold text-sm">
                        ${Number(item.base_price || 0).toFixed(2)}
                      </p>
                      <div
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${Number(item.total_quantity) > 0 ? "bg-success-50 text-success" : "bg-danger-50 text-danger"}`}
                      >
                        Stock: {Number(item.total_quantity)}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-default-400 flex flex-col items-center">
              <List className="w-12 h-12 mb-2 opacity-20" />
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
