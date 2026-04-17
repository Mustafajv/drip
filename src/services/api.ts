import { products } from '@/data/products';
import type { Product, ProductFilters, Order, OrderData, CartItem } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProducts(filters?: Partial<ProductFilters>): Promise<Product[]> {
  await delay(300);

  let filtered = [...products];

  if (filters) {
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories!.includes(p.category));
    }
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(p => p.sizes.some(s => filters.sizes!.includes(s)));
    }
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(p =>
        p.colors.some(c => filters.colors!.includes(c.name))
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.tags.some(t => t.toLowerCase().includes(search))
      );
    }
  }

  return filtered;
}

export async function getProductById(id: string): Promise<Product | null> {
  await delay(200);
  return products.find(p => p.id === id) ?? null;
}

export async function getRelatedProducts(productId: string, limit = 3): Promise<Product[]> {
  await delay(250);
  const product = products.find(p => p.id === productId);
  if (!product) return [];

  return products
    .filter(p => p.id !== productId && (p.category === product.category || p.tags.some(t => product.tags.includes(t))))
    .slice(0, limit);
}

export async function createOrder(
  orderData: OrderData,
  items: CartItem[]
): Promise<Order> {
  await delay(800);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const order: Order = {
    id: `ORD-${Date.now()}`,
    items,
    shipping: {
      firstName: orderData.firstName,
      lastName: orderData.lastName,
      address: orderData.address,
      city: orderData.city,
      postalCode: orderData.postalCode,
    },
    subtotal,
    tax,
    total,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  return order;
}
