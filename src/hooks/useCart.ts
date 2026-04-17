import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '@/stores/cartStore';
import { createOrder } from '@/services/api';
import type { Product, OrderData } from '@/types';

export function useAddToCart() {
  const addItem = useCartStore(state => state.addItem);

  return useMutation({
    mutationFn: async ({
      product,
      size,
      color,
    }: {
      product: Product;
      size: string;
      color: string;
    }) => {
      addItem(product, size, color);
      return { success: true };
    },
  });
}

export function usePlaceOrder() {
  const { items, clearCart } = useCartStore.getState();

  return useMutation({
    mutationFn: async (orderData: OrderData) => {
      const currentItems = useCartStore.getState().items;
      const order = await createOrder(orderData, currentItems);
      return order;
    },
    onSuccess: () => {
      clearCart();
    },
  });
}

// Re-export the store for convenience
export { useCartStore } from '@/stores/cartStore';
