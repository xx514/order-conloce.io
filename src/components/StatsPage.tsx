import { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useStore } from '../store';
import { TrendingUp, ShoppingBag, Hash, CreditCard } from 'lucide-react';

interface StatsPageProps {
  store: ReturnType<typeof useStore>;
}

export default function StatsPage({ store }: StatsPageProps) {
  const { orders } = store;

  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalQuantity = orders.reduce((sum, o) => 
      sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);
    
    // Last 7 days trend
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayOrders = orders.filter(o => isSameDay(new Date(o.createTime), date));
      return {
        name: format(date, 'MM/dd'),
        sales: dayOrders.reduce((sum, o) => sum + o.total, 0)
      };
    });

    // Sales by product
    const productSalesMap: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        productSalesMap[item.productName] = (productSalesMap[item.productName] || 0) + item.total;
      });
    });
    const productSales = Object.entries(productSalesMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    return { totalSales, totalOrders, totalQuantity, last7Days, productSales };
  }, [orders]);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Grid */}
      <div className="grid grid-cols-1 gap-4">
        <StatCard 
          title="总销售额" 
          value={`¥${stats.totalSales.toFixed(2)}`} 
          icon={CreditCard} 
          color="bg-blue-600" 
        />
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="总订单数" 
            value={stats.totalOrders} 
            icon={Hash} 
            color="bg-emerald-500" 
          />
          <StatCard 
            title="总销售数量" 
            value={stats.totalQuantity} 
            icon={ShoppingBag} 
            color="bg-orange-500" 
          />
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={18} className="text-blue-600" />
          <h3 className="font-semibold">最近7天销售趋势</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.last7Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#2563EB" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Category Stats */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
        <h3 className="font-semibold mb-6 text-center">商品销售额排行 (Top 5)</h3>
        <div className="space-y-4">
          {stats.productSales.length === 0 ? (
            <p className="text-center text-gray-400 py-4">暂无数据</p>
          ) : (
            stats.productSales.map((item, index) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-blue-600">¥{item.value.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / stats.totalSales) * 100}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
