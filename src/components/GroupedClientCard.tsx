import React from 'react';
import { motion } from 'motion/react';
import { Package, TrendingUp } from 'lucide-react';
import { getBrandStripClass, getBrandColor } from '../lib/brand-colors';

interface GroupedClientCardProps {
  client: string;
  products: string[];
  totalValue: number;
}

export const GroupedClientCard: React.FC<GroupedClientCardProps> = ({ client, products, totalValue }) => {
  const brandColor = getBrandColor(client);
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalValue);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="glass-card flex flex-col overflow-hidden h-full"
    >
      <div className={`h-1.5 w-full ${getBrandStripClass(client)}`} />
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <p className="text-[0.6rem] text-text-secondary uppercase tracking-[0.2em] font-bold mb-1 opacity-60">Cliente</p>
          <h3 
            className="text-xl font-black tracking-tighter truncate"
            style={brandColor ? { color: brandColor } : { color: 'white' }}
          >
            {client}
          </h3>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-3">
            <Package className="w-3 h-3 text-accent" />
            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-text-secondary">Produtos em Negociação</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {products.map((product, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 bg-white/5 border border-glass-border rounded-md text-[10px] font-medium text-white/80"
              >
                {product}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-glass-border flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-[#4ade80]" />
            <span className="text-[0.55rem] font-bold uppercase tracking-widest text-[#4ade80]/70">Valor Total Estimado</span>
          </div>
          <div className="text-xl font-black text-[#4ade80] tracking-tighter">
            {formattedValue}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
