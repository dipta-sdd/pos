"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";

import ProductForm from "../_components/ProductForm";

import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import api from "@/lib/api";
import ResourceNotFound from "@/components/ui/ResourceNotFound";

export default function EditProductPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const params = useParams();
  const productId = params.productId;
  const vendorId = params.vendorId;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response: any = await api.get(`/products/${productId}`);

      setProduct(response?.data);
    } catch (error) {
      console.error("Failed to fetch product", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintLabels = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    const variant = product.variants?.[0]; // Default to first variant
    const barcode = variant?.barcode || product.sku || "N/A";

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label - ${product.name}</title>
          <style>
            @page { size: 40mm 20mm; margin: 0; }
            body { 
              font-family: sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
              height: 20mm;
              width: 40mm;
              padding: 2mm;
              box-sizing: border-box;
              text-align: center;
            }
            .name { font-size: 8pt; font-weight: bold; overflow: hidden; white-space: nowrap; width: 100%; }
            .price { font-size: 10pt; font-weight: 900; margin: 1mm 0; }
            .barcode { font-size: 12pt; font-family: 'Libre Barcode 39', cursive; }
            .sku { font-size: 6pt; color: #666; }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
        </head>
        <body>
          <div class="name">${product.name}</div>
          <div class="price">${vendor?.settings?.currency_symbol || "$"}${variant?.price || product.base_price}</div>
          <div class="barcode">*${barcode}*</div>
          <div class="sku">${barcode}</div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (contextLoading || loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-3">
            <Skeleton className="w-48 h-8 rounded-lg" />
            <Skeleton className="w-64 h-4 rounded-lg" />
          </div>
          <Skeleton className="w-32 h-10 rounded-lg" />
        </div>
        <div className="mt-6 max-w-5xl space-y-8">
          {/* General Information Card */}
          <div className="bg-white dark:bg-default-50 rounded-xl border border-default-200 p-6 space-y-6">
            <Skeleton className="w-48 h-6 rounded-lg" />
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image Skeleton */}
              <Skeleton className="w-32 h-32 rounded-xl flex-shrink-0" />

              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="md:col-span-2">
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Variants Card */}
          <div className="bg-white dark:bg-default-50 rounded-xl border border-default-200 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="w-40 h-6 rounded-lg" />
              <Skeleton className="w-32 h-8 rounded-lg" />
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-default-200 rounded-lg space-y-4"
                >
                  <div className="flex justify-between">
                    <Skeleton className="w-24 h-4 rounded" />
                    <Skeleton className="w-8 h-8 rounded" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <ResourceNotFound
        backLabel="Back to Products"
        backLink={`/pos/vendor/${vendorId}/products`}
        title="Product"
      />
    );
  }

  return (
    <PermissionGuard permission="can_manage_catalog">
      <div className="p-6">
        <PageHeader
          description={`Editing ${product.name}`}
          title="Edit Product"
        >
          <Button
            startContent={<Printer size={18} />}
            variant="flat"
            onPress={handlePrintLabels}
          >
            Print Labels
          </Button>
        </PageHeader>
        <div className="mt-6 max-w-5xl">
          <ProductForm isEditing initialData={product} />
        </div>
      </div>
    </PermissionGuard>
  );
}
