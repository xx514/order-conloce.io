import { useState, useEffect, useMemo } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2, X, ChevronDown, Calendar, ChevronRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useStore } from '../store';
import { Order, OrderItem } from '../types';

interface OrderPageProps {
  store: ReturnType<typeof useStore>;
}

export default function OrderPage({ store }: OrderPageProps) {
  const { products, orders, addOrder, deleteOrder } = store;
  const [isAdding, setIsAdding] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Form state for a single item being added to the current order
  const [customerName, setCustomerName] = useState('');
  const [currentItem, setCurrentItem] = useState({
    productId: '',
    price: '',
    quantity: '1'
  });

  // List of items for the order currently being created
  const [newOrderItems, setNewOrderItems] = useState<OrderItem[]>([]);

  // Auto-fill price when product is selected in the "add item" form
  useEffect(() => {
    if (currentItem.productId) {
      const product = products.find(p => p.id === currentItem.productId);
      if (product) {
        setCurrentItem(prev => ({ ...prev, price: product.price.toString() }));
      }
    }
  }, [currentItem.productId, products]);

  const addItemToOrder = () => {
    const product = products.find(p => p.id === currentItem.productId);
    if (!product) return;

    const price = parseFloat(currentItem.price) || 0;
    const quantity = parseFloat(currentItem.quantity) || 0;

    const newItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      price: price,
      quantity: quantity,
      unit: product.unit,
      total: price * quantity
    };

    setNewOrderItems(prev => [...prev, newItem]);
    setCurrentItem({ productId: '', price: '', quantity: '1' });
  };

  const removeItemFromNewOrder = (index: number) => {
    setNewOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalOrderAmount = useMemo(() => 
    newOrderItems.reduce((sum, item) => sum + item.total, 0), 
  [newOrderItems]);

  const handleSubmitOrder = (e: FormEvent) => {
    e.preventDefault();
    if (newOrderItems.length === 0) return;

    addOrder({
      customerName: customerName || '匿名客户',
      items: newOrderItems,
      total: totalOrderAmount
    });

    setIsAdding(false);
    setNewOrderItems([]);
    setCustomerName('');
    setCurrentItem({ productId: '', price: '', quantity: '1' });
  };

  const selectedOrder = useMemo(() => 
    orders.find(o => o.id === selectedOrderId),
  [orders, selectedOrderId]);

  // Detail View
  if (selectedOrder) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedOrderId(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-2"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">返回订单列表</span>
        </button>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-6">
          <div className="flex justify-between items-start border-b border-gray-50 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{selectedOrder.customerName}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Calendar size={14} />
                {format(new Date(selectedOrder.createTime), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wider">订单详情</p>
              <p className="text-xs font-mono text-gray-600">#{selectedOrder.id.slice(-6)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">商品清单</h4>
            {selectedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-500">
                    ¥{item.price.toFixed(2)} × {item.quantity} {item.unit}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">¥{item.total.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-between items-center">
            <span className="font-medium text-gray-500">合计金额</span>
            <span className="text-2xl font-black text-blue-600">¥{selectedOrder.total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('确定要删除此订单吗？')) {
              deleteOrder(selectedOrder.id);
              setSelectedOrderId(null);
            }
          }}
          className="w-full py-4 text-red-500 bg-red-50 rounded-2xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Trash2 size={20} />
          删除订单
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Button / Form */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform"
        >
          <Plus size={20} />
          新建订单
        </button>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">新建订单</h3>
            <button type="button" onClick={() => { setIsAdding(false); setNewOrderItems([]); setCustomerName(''); }} className="text-gray-400">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">客户名称</label>
            <input
              type="text"
              placeholder="请输入客户名称"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          
          {/* Add Item to Current Order Form */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">选择商品</label>
              <div className="relative">
                <select
                  value={currentItem.productId}
                  onChange={e => setCurrentItem({ ...currentItem, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all text-sm"
                >
                  <option value="">请选择商品</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">单价</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentItem.price}
                  onChange={e => setCurrentItem({ ...currentItem, price: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">数量</label>
                <input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addItemToOrder}
              disabled={!currentItem.productId}
              className="w-full py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              + 添加到清单
            </button>
          </div>

          {/* Current Order Items List */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">当前清单 ({newOrderItems.length})</h4>
            {newOrderItems.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-4">清单为空</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {newOrderItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-[10px] text-gray-500">¥{item.price} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">¥{item.total.toFixed(2)}</span>
                      <button onClick={() => removeItemFromNewOrder(idx)} className="text-red-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">合计</span>
            <span className="text-2xl font-black text-blue-600">¥{totalOrderAmount.toFixed(2)}</span>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={newOrderItems.length === 0}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
          >
            确认提交订单
          </button>
        </div>
      )}

      {/* Order List */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest px-2">订单历史 ({orders.length})</h2>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            暂无订单
          </div>
        ) : (
          orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrderId(order.id)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 space-y-3 active:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-blue-500" />
                    <h4 className="font-semibold text-gray-900 truncate max-w-[200px]">
                      {order.customerName}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 ml-6">
                    {order.items[0]?.productName}
                    {order.items.length > 1 && <span className="text-gray-400 font-normal ml-1">等{order.items.length}件</span>}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                    <Calendar size={12} />
                    {format(new Date(order.createTime), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
              
              <div className="flex justify-between items-end pt-2 border-t border-gray-50">
                <div className="text-xs text-gray-500">
                  共 {order.items.reduce((sum, i) => sum + i.quantity, 0)} 件商品
                </div>
                <div className="text-lg font-bold text-gray-900">
                  ¥{order.total.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
