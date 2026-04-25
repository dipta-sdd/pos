"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Skeleton, ScrollShadow } from "@heroui/react";
import { Grid3X3, Package, ShoppingCart } from "lucide-react";

import api, { BACKEND_URL } from "@/lib/api";
import { useVendor } from "@/lib/contexts/VendorContext";
import { Product, Variant, ProductStock } from "@/lib/types/general";
import clsx from "clsx";

interface ProductSelectionProps {
  onSelect: (product: Product, variant: Variant, batch: ProductStock) => void;
  category?: string;
  search?: string;
}

export default function ProductSelection({
  onSelect,
  category = "all",
  search = "",
}: ProductSelectionProps) {
  const { vendor } = useVendor();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    if (!vendor?.id) return;
    setLoading(true);
    try {
      const params: any = {
        vendor_id: vendor.id,
        per_page: 100,
        search: search,
      };

      if (category !== "all") {
        params.category_id = category;
      }

      const response: any = await api.get(`/pos/products`, { params });
      setItems(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [vendor?.id, category, search]);

  return (
    <ScrollShadow className="h-full pr-2 no-scrollbar">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-10">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <Card
              key={i}
              className="h-56 bg-content1 border border-default-100 rounded-2xl shadow-none"
            >
              <Skeleton className="rounded-t-2xl h-3/5 bg-default-200" />
              <div className="space-y-3 p-3">
                <Skeleton className="w-3/5 rounded-lg h-3 bg-default-200" />
                <Skeleton className="w-4/5 rounded-lg h-3 bg-default-200" />
              </div>
            </Card>
          ))
        ) : items.length > 0 ? (
          items.map((item) => (
            <Card
              key={item.id}
              isPressable
              className="group bg-content1 border border-default-100 hover:border-primary/30 shadow-none hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl overflow-hidden h-auto"
              onPress={async () => {
                const stocksResponse: any = await api.get(
                  `/pos/products/stocks`,
                  {
                    params: { variant_id: item.id },
                  },
                );
                const stocks = stocksResponse.data;

                if (stocks.length > 0) {
                  // FEFO: First Expiry First Out
                  const sortedStocks = [...stocks].sort((a, b) => {
                    if (!a.expiry_date) return 1;
                    if (!b.expiry_date) return -1;
                    return (
                      new Date(a.expiry_date).getTime() -
                      new Date(b.expiry_date).getTime()
                    );
                  });

                  onSelect(
                    {
                      id: item.product_id,
                      name: item.product_name,
                      image_url: item.image_url,
                    } as Product,
                    {
                      id: item.id,
                      name: item.variant_name,
                      value: item.variant_value,
                      sku: item.sku,
                      barcode: item.barcode,
                    } as Variant,
                    sortedStocks[0],
                  );
                }
              }}
            >
              <CardBody className="p-0 flex flex-col h-full relative text-left">
                {/* Image Area */}
                <div className="aspect-square w-full bg-black/20 flex items-center justify-center relative overflow-hidden shrink-0">
                  {item.image_url ? (
                    <img
                      src={BACKEND_URL + item.image_url}
                      alt={item.product_name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-default-100 dark:bg-white/5">
                      <Package
                        // size={40}
                        className="text-default-400 dark:text-white/20 size-[80%]"
                      />
                    </div>
                  )}

                  {/* Stock Badge Overlay */}
                  <div
                    className={clsx(
                      "absolute top-2 right-2 px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-xl shadow-lg border border-default-200",
                      Number(item.total_quantity) > 0
                        ? "bg-success/20 text-success"
                        : "bg-danger/20 text-danger",
                    )}
                  >
                    {item.total_quantity} In Stock
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-3 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-default-100/50">
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight text-foreground/90 truncate leading-tight mb-1">
                      {item.product_name}
                    </p>
                    {item.variant_name === "Standard" &&
                    item.variant_value === "Default" ? null : (
                      <p className="text-[10px] text-default-500 font-bold truncate">
                        ${item.variant_name}: ${item.variant_value}`
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-1">
                    <p className="text-primary font-black text-sm tracking-tighter">
                      {vendor?.settings?.currency_symbol || "৳"}{Number(item.base_price || 0).toLocaleString()}
                    </p>
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-lg group-hover:shadow-primary/30">
                      <ShoppingCart size={14} />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-700 flex flex-col items-center">
            <Package size={64} className="mb-4 opacity-5" />
            <p className="font-bold uppercase tracking-widest text-xs text-gray-600">
              No products found matching filters
            </p>
          </div>
        )}
      </div>
    </ScrollShadow>
  );
}
