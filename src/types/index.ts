export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: 'outerwear' | 'knitwear' | 'footwear' | 'accessories' | 'trousers';
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  tags: string[];
  collection: string;
  materials: string;
  care: string;
  isLimited: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  email: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  paymentMethod: 'credit_card' | 'apple_pay';
}

export interface Order {
  id: string;
  items: OrderItem[];
  shipping: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
  };
  subtotal: number;
  tax: number;
  total: number;
  status: 'confirmed' | 'processing' | 'shipped';
  createdAt: string;
}

export type OrderStatus = Order['status'];

export interface AdminOrder extends Order {
  email: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ProductFilters {
  categories: string[];
  sizes: string[];
  colors: string[];
  maxPrice: number;
  search: string;
}
