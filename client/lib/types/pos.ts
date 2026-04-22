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

export interface PosTab {
  id: string;
  name: string;
  customer: Customer | null;
  items: CartItem[];
  selectedPaymentMethodId: number | null;
  receivedAmount: number;
  notes: string;
  createdAt: string;
}

export interface PosState {
  tabs: PosTab[];
  activeTabId: string;
}
