import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

import { PosState, PosTab, CartItem, PosPayment } from "../types/pos";
import { Product, Variant, ProductStock } from "../types/general";

const STORAGE_KEY = "pos_state";

const DEFAULT_TAB = (): PosTab => ({
  id: uuidv4(),
  name: "New Sale",
  customer: null,
  items: [],
  payments: [],
  discount_type: "percentage",
  discount_value: 0,
  coupon_code: "",
  extra_charge: 0,
  notes: "",
  createdAt: new Date().toISOString(),
});

export function usePosState() {
  const [state, setState] = useState<PosState>({
    tabs: [],
    activeTabId: "",
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (parsed.tabs && parsed.tabs.length > 0) {
          // Ensure each tab has the required arrays
          const sanitizedTabs = parsed.tabs.map((tab: any) => ({
            ...tab,
            items: tab.items || [],
            payments: tab.payments || [],
            discount_type: tab.discount_type || "percentage",
            discount_value: tab.discount_value || 0,
            coupon_code: tab.coupon_code || "",
            extra_charge: tab.extra_charge || 0,
          }));

          setState({ ...parsed, tabs: sanitizedTabs });
        } else {
          const firstTab = DEFAULT_TAB();

          setState({ tabs: [firstTab], activeTabId: firstTab.id });
        }
      } catch {
        const firstTab = DEFAULT_TAB();

        setState({ tabs: [firstTab], activeTabId: firstTab.id });
      }
    } else {
      const firstTab = DEFAULT_TAB();

      setState({ tabs: [firstTab], activeTabId: firstTab.id });
    }
    setIsInitialized(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isInitialized]);

  const activeTab =
    state.tabs.find((t) => t.id === state.activeTabId) || state.tabs[0];

  const addTab = useCallback(() => {
    const newTab = DEFAULT_TAB();

    setState((prev) => ({
      tabs: [...prev.tabs, newTab],
      activeTabId: newTab.id,
    }));
  }, []);

  const closeTab = useCallback((id: string) => {
    setState((prev) => {
      const newTabs = prev.tabs.filter((t) => t.id !== id);

      if (newTabs.length === 0) {
        const firstTab = DEFAULT_TAB();

        return { tabs: [firstTab], activeTabId: firstTab.id };
      }
      const newActiveId =
        prev.activeTabId === id
          ? newTabs[newTabs.length - 1].id
          : prev.activeTabId;

      return { tabs: newTabs, activeTabId: newActiveId };
    });
  }, []);

  const setActiveTab = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeTabId: id }));
  }, []);

  const updateActiveTab = useCallback((updates: Partial<PosTab>) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === prev.activeTabId ? { ...t, ...updates } : t,
      ),
    }));
  }, []);

  const addToCart = useCallback(
    (
      product: Product,
      variant: Variant,
      batch: ProductStock,
      quantity: number = 1,
      forcedId?: string,
      defaultTaxRate: number = 0,
    ) => {
      let resultId = "";

      setState((prev) => {
        const activeTab = prev.tabs.find((t) => t.id === prev.activeTabId);

        if (!activeTab) return prev;

        const existingItemIndex = (activeTab.items || []).findIndex(
          (item) =>
            item.variant.id === variant.id && item.batch.id === batch.id,
        );

        let newItems = [...(activeTab.items || [])];

        if (existingItemIndex > -1) {
          const item = newItems[existingItemIndex];
          const newQty = item.quantity + quantity;

          resultId = item.id;
          newItems[existingItemIndex] = calculateItemTotals({
            ...item,
            quantity: newQty,
          });
        } else {
          resultId = forcedId || uuidv4();
          const newItem: CartItem = {
            id: resultId,
            product,
            variant,
            batch,
            quantity,
            price: Number(batch.selling_price || product.base_price || 0),
            discount: 0,
            tax_rate: defaultTaxRate,
            tax_amount: 0,
            subtotal: 0,
            total: 0,
          };

          newItems.push(calculateItemTotals(newItem));
        }

        return {
          ...prev,
          tabs: prev.tabs.map((t) =>
            t.id === prev.activeTabId ? { ...t, items: newItems } : t,
          ),
        };
      });

      return resultId;
    },
    [],
  );

  const updateCartItem = useCallback(
    (itemId: string, updates: Partial<CartItem>) => {
      setState((prev) => {
        const activeTab = prev.tabs.find((t) => t.id === prev.activeTabId);

        if (!activeTab) return prev;

        const newItems = activeTab.items.map((item) => {
          if (item.id === itemId) {
            return calculateItemTotals({ ...item, ...updates });
          }

          return item;
        });

        return {
          ...prev,
          tabs: prev.tabs.map((t) =>
            t.id === prev.activeTabId ? { ...t, items: newItems } : t,
          ),
        };
      });
    },
    [],
  );

  const removeFromCart = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === prev.activeTabId
          ? { ...t, items: (t.items || []).filter((i) => i.id !== itemId) }
          : t,
      ),
    }));
  }, []);

  const clearCart = useCallback(() => {
    updateActiveTab({
      items: [],
      customer: null,
      payments: [],
      notes: "",
    });
  }, [updateActiveTab]);

  const addPayment = useCallback((payment: Omit<PosPayment, "id">) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === prev.activeTabId
          ? {
              ...t,
              payments: [...t.payments, { ...payment, id: uuidv4() }],
            }
          : t,
      ),
    }));
  }, []);

  const updatePayment = useCallback(
    (paymentId: string, updates: Partial<PosPayment>) => {
      setState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId
            ? {
                ...t,
                payments: t.payments.map((p) =>
                  p.id === paymentId ? { ...p, ...updates } : p,
                ),
              }
            : t,
        ),
      }));
    },
    [],
  );

  const removePayment = useCallback((paymentId: string) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === prev.activeTabId
          ? {
              ...t,
              payments: (t.payments || []).filter((p) => p.id !== paymentId),
            }
          : t,
      ),
    }));
  }, []);

  return {
    state,
    activeTab,
    isInitialized,
    addTab,
    closeTab,
    setActiveTab,
    updateActiveTab,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    addPayment,
    updatePayment,
    removePayment,
  };
}

function calculateItemTotals(item: CartItem): CartItem {
  const subtotal = item.price * item.quantity;
  const discountAmount = item.discount;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * Number(item.tax_rate || 0)) / 100;
  const total = afterDiscount + taxAmount;

  return {
    ...item,
    subtotal,
    tax_amount: taxAmount,
    total,
  };
}
