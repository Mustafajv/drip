import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getRelatedProducts,
  updateProduct,
} from '@/services/api';
import type { Product, ProductFilters } from '@/types';

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

export function useProductAdminMutations() {
  const queryClient = useQueryClient();

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['product'] });
    queryClient.invalidateQueries({ queryKey: ['relatedProducts'] });
  };

  return {
    createProduct: useMutation({
      mutationFn: (product: Omit<Product, 'id'>) => createProduct(product),
      onSuccess: invalidateProducts,
    }),
    updateProduct: useMutation({
      mutationFn: (product: Product) => updateProduct(product),
      onSuccess: invalidateProducts,
    }),
    deleteProduct: useMutation({
      mutationFn: (productId: string) => deleteProduct(productId),
      onSuccess: invalidateProducts,
    }),
  };
}
