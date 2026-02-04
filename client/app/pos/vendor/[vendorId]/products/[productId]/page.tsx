"use client";

import { useEffect, useState } from "react";
import { useVendor } from "@/lib/contexts/VendorContext";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import ProductForm from "../_components/ProductForm";
import api from "@/lib/api";
import { useParams } from "next/navigation";

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

  if (contextLoading || loading) return <div className="p-6">Loading...</div>;
  if (!product) return <div className="p-6">Product not found.</div>;

  return (
    <PermissionGuard permission="can_manage_products">
      <div className="p-6">
        <PageHeader
          description={`Editing ${product.name}`}
          title="Edit Product"
        />
        <div className="mt-6 max-w-5xl">
          <ProductForm initialData={product} isEditing />
        </div>
      </div>
    </PermissionGuard>
  );
}
