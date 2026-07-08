import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders, getOrders, updateAdminOrderStatus } from '@/services/api';
import type { OrderStatus } from '@/types';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAdminOrders,
  });
}

export function useAdminOrderMutations() {
  const queryClient = useQueryClient();

  return {
    updateStatus: useMutation({
      mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
        updateAdminOrderStatus(orderId, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      },
    }),
  };
}
