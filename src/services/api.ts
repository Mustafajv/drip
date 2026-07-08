import type { Product, ProductFilters, Order, OrderData, CartItem, AdminOrder, OrderStatus } from '@/types';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function createProductParams(filters?: Partial<ProductFilters>) {
  const params = new URLSearchParams();

  if (filters?.categories?.length) params.set('categories', filters.categories.join(','));
  if (filters?.sizes?.length) params.set('sizes', filters.sizes.join(','));
  if (filters?.colors?.length) params.set('colors', filters.colors.join(','));
  if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters?.search) params.set('search', filters.search);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export async function getProducts(filters?: Partial<ProductFilters>): Promise<Product[]> {
  return apiRequest<Product[]>(`/products${createProductParams(filters)}`);
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await apiRequest<Product>(`/products/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Product not found')) {
      return null;
    }

    throw error;
  }
}

export async function getRelatedProducts(productId: string, limit = 3): Promise<Product[]> {
  const product = await getProductById(productId);
  if (!product) return [];

  const products = await getProducts();

  return products
    .filter(p => p.id !== productId && (p.category === product.category || p.tags.some(t => product.tags.includes(t))))
    .slice(0, limit);
}

export async function createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  return apiRequest<Product>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(product: Product): Promise<Product> {
  return apiRequest<Product>(`/admin/products/${product.id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(productId: string): Promise<string> {
  await apiRequest<void>(`/admin/products/${productId}`, {
    method: 'DELETE',
  });

  return productId;
}

export async function createOrder(
  orderData: OrderData,
  items: CartItem[]
): Promise<Order> {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      orderData,
      items: items.map(item => ({
        productId: item.product.id,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        quantity: item.quantity,
      })),
    }),
  });
}

export async function getOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders');
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  return apiRequest<AdminOrder[]>('/admin/orders');
}

export async function updateAdminOrderStatus(orderId: string, status: OrderStatus): Promise<AdminOrder> {
  return apiRequest<AdminOrder>(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
