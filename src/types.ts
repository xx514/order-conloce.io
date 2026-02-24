export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  total: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  createTime: string; // ISO string
}

export type TabType = 'products' | 'orders' | 'stats';
