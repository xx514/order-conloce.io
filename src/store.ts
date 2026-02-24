import { useState, useEffect } from 'react';
import { Product, Order } from './types';

const STORAGE_KEYS = {
  PRODUCTS: 'minimal_app_products',
  ORDERS: 'minimal_app_orders',
};

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Initial load
  useEffect(() => {
    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Save on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addOrder = (order: Omit<Order, 'id' | 'createTime'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  return {
    products,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    deleteOrder,
  };
}
