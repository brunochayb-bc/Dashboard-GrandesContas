import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Negotiation } from '../types';
import { motion } from 'motion/react';
import { getBrandColor } from '../lib/brand-colors';

interface DashboardChartsProps {
  negotiations: Negotiation[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ negotiations }) => {
  // 1. Calculate Monthly Data (until Dec 2026)
  const monthlyData = useMemo(() => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    
    // Create map for months in 2026
    const dataMap: Record<string, number> = {};
    
    // Initialize months from April to Dec 2026
    for (let i = 3; i < 12; i++) {
      dataMap[months[i]] = 0;
    }

    negotiations.forEach(neg => {
      const date = new Date(neg.closeDate + 'T12:00:00');
      if (date.getFullYear() === 2026) {
        const monthName = months[date.getMonth()];
        if (dataMap[monthName] !== undefined) {
          dataMap[monthName] += neg.value;
        }
      }
    });

    return Object.entries(dataMap).map(([name, total]) => ({
      name,
      total,
    }));
  }, [negotiations]);

  // 2. Aggregate by Client
  const clientBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    negotiations.forEach(n => {
      map[n.client] = (map[n.client] || 0) + n.value;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5
  }, [negotiations]);

  // 3. Aggregate by Product
  const productBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    negotiations.forEach(n => {
      map[n.product] = (map[n.product] || 0) + n.value;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5
  }, [negotiations]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 mb-12 select-none">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Client */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-[0.65rem] font-black tracking-[0.2em] text-accent uppercase mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Distribuição por Cliente (Top 5)
          </h3>
          <div className="space-y-4">
            {clientBreakdown.map(([client, total]) => {
              const brandColor = getBrandColor(client);
              return (
                <div key={client} className="group cursor-default">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-white group-hover:text-accent transition-colors">{client}</span>
                    <span className="text-sm font-mono text-text-secondary">{formatCurrency(total)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(total / (clientBreakdown[0][1] || 1)) * 100}%` }}
                      className="h-full rounded-full transition-all"
                      style={{ backgroundColor: brandColor || '#60a5fa' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* By Product */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="text-[0.65rem] font-black tracking-[0.2em] text-accent uppercase mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Distribuição por Produto (Top 5)
          </h3>
          <div className="space-y-4">
            {productBreakdown.map(([product, total]) => (
              <div key={product} className="group cursor-default">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-white group-hover:text-accent transition-colors">{product}</span>
                  <span className="text-sm font-mono text-text-secondary">{formatCurrency(total)}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(total / (productBreakdown[0][1] || 1)) * 100}%` }}
                    className="h-full bg-[#60a5fa] rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Bar Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 font-sans">
          <div>
            <h3 className="text-[0.65rem] font-black tracking-[0.2em] text-accent uppercase flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Cronograma de Receita Prevista
            </h3>
            <p className="text-lg font-bold text-white italic">Previsão Mensal (2026)</p>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-glass-border">
             <span className="text-[0.6rem] font-bold tracking-widest text-text-secondary uppercase">Ano de Referência: 2026</span>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 500 }}
                tickFormatter={(val) => `R$ ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Total Previsto']}
                itemStyle={{ color: '#60a5fa' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar 
                dataKey="total" 
                radius={[6, 6, 0, 0]} 
                barSize={32}
              >
                {monthlyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.total > 0 ? '#60a5fa' : 'rgba(255,255,255,0.05)'} 
                    className="hover:brightness-125 transition-all cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};
