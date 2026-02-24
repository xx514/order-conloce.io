import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../store';

interface ProductPageProps {
  store: ReturnType<typeof useStore>;
}

export default function ProductPage({ store }: ProductPageProps) {
  const { products, addProduct, updateProduct, deleteProduct } = store;
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: '件'
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      updateProduct(editingId, {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        unit: formData.unit
      });
      setEditingId(null);
    } else {
      addProduct({
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        unit: formData.unit
      });
      setIsAdding(false);
    }
    setFormData({ name: '', price: '', unit: '件' });
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit
    });
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: '', price: '', unit: '件' });
  };

  return (
    <div className="space-y-6">
      {/* Add Button / Form */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform"
        >
          <Plus size={20} />
          新增商品
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">{editingId ? '编辑商品' : '新增商品'}</h3>
            <button type="button" onClick={cancelEdit} className="text-gray-400">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">商品名称</label>
            <input
              required
              type="text"
              placeholder="例如：苹果"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">单价 (元)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">单位</label>
              <input
                type="text"
                placeholder="件/盒/斤"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium shadow-md shadow-blue-100 active:scale-95 transition-transform"
          >
            {editingId ? '保存修改' : '确认添加'}
          </button>
        </form>
      )}

      {/* Product List */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest px-2">商品列表 ({products.length})</h2>
        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            暂无商品，请先添加
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 flex justify-between items-center group">
              <div>
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-500">
                  <span className="text-blue-600 font-semibold">¥{product.price.toFixed(2)}</span>
                  <span className="mx-1">/</span>
                  {product.unit}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(product)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
