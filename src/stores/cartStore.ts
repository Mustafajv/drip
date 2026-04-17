import { create } from 'zustand';
import type { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  totalItems: () => number;
  subtotal: () => number;
  tax: () => number;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product, size, color) => {
    const { items } = get();
    const existingIndex = items.findIndex(
      item =>
        item.product.id === product.id &&
        item.selectedSize === size &&
        item.selectedColor === color
    );

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1,
      };
      set({ items: updated, isOpen: true });
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${size}-${color}-${Date.now()}`,
        product,
        selectedSize: size,
        selectedColor: color,
        quantity: 1,
      };
      set({ items: [...items, newItem], isOpen: true });
    }
  },

  removeItem: (itemId) => {
    set({ items: get().items.filter(item => item.id !== itemId) });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set({
      items: get().items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set({ isOpen: !get().isOpen }),

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: () =>
    get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  tax: () => get().subtotal() * 0.2,
  total: () => get().subtotal() + get().tax(),
}));
