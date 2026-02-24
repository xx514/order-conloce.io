import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ShoppingCart, BarChart3, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useStore } from './store';
import { TabType } from './types';
import ProductPage from './components/ProductPage';
import OrderPage from './components/OrderPage';
import StatsPage from './components/StatsPage';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const store = useStore();

  const tabs = [
    { id: 'products', label: '商品', icon: Package },
    { id: 'orders', label: '订单', icon: ShoppingCart },
    { id: 'stats', label: '统计', icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex justify-center items-center">
        <h1 className="text-lg font-semibold tracking-tight">
          {tabs.find(t => t.id === activeTab)?.label}管理
        </h1>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'products' && <ProductPage store={store} />}
            {activeTab === 'orders' && <OrderPage store={store} />}
            {activeTab === 'stats' && <StatsPage store={store} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-6 py-3 pb-8 flex justify-around items-center z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-200 relative",
                isActive ? "text-blue-600" : "text-gray-400"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
