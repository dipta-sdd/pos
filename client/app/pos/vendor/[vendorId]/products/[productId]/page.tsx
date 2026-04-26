"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@heroui/button";

import ProductForm from "../_components/ProductForm";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import api from "@/lib/api";

export default function EditProductPage() {
  const { vendor, isLoading: contextLoading } = useVendor();
  const params = useParams();
  const productId = params.productId;
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const variant = product.variants?.[0]; // Default to first variant
    const barcode = variant?.barcode || product.sku || 'N/A';
    
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
          <div class="price">${vendor?.settings?.currency_symbol || '$'}${variant?.price || product.base_price}</div>
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

  if (contextLoading || loading) return <div className="p-6">Loading...</div>;
  if (!product) return <div className="p-6">Product not found.</div>;

  return (
    <PermissionGuard permission="can_edit_products">
      <div className="p-6">
        <PageHeader
          description={`Editing ${product.name}`}
          title="Edit Product"
        >
          <Button 
            variant="flat" 
            startContent={<Printer size={18} />}
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
