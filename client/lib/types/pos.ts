import { Customer, Product, Variant, ProductStock } from "./general";

export interface CartItem {
  id: string; // Unique ID for the cart item (since same variant can be in cart twice with different batches)
  product: Product;
  variant: Variant;
  batch: ProductStock;
  quantity: number;
  price: number;
  discount: number;
  tax_rate: number;
  tax_amount: number;
  subtotal: number;
  total: number;
}

export interface PosPayment {
  id: string;
  methodId: number;
  methodName: string;
  isCash: boolean;
  tenderedAmount: number;
  appliedAmount: number;
  changeAmount: number;
}

export interface PosTab {
  id: string;
  name: string;
  customer: Customer | null;
  tempCustomer?: {
    name: string;
    mobile: string;
  };
  items: CartItem[];
  payments: PosPayment[];
  discount_type: "percentage" | "fixed";
  discount_value: number;
  coupon_code: string;
  extra_charge: number;
  notes: string;
  createdAt: string;
}

export interface PosState {
  tabs: PosTab[];
  activeTabId: string;
}
