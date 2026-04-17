import { useQuery } from '@tanstack/react-query';
import { getProducts, getProductById, getRelatedProducts } from '@/services/api';
import type { ProductFilters } from '@/types';

export function useProducts(filters?: Partial<ProductFilters>) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}

export function useRelatedProducts(productId: string) {
  return useQuery({
    queryKey: ['relatedProducts', productId],
    queryFn: () => getRelatedProducts(productId),
    enabled: !!productId,
  });
}
