import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, DollarSign, User, Info, MoreHorizontal } from 'lucide-react';
import { Negotiation } from '../types';
import { getBrandStripClass, getBrandColor } from '../lib/brand-colors';

interface NegotiationCardProps {
  negotiation: Negotiation;
  isActiveClient?: boolean;
  onEdit?: (neg: Negotiation) => void;
}

export const NegotiationCard: React.FC<NegotiationCardProps> = ({ negotiation, isActiveClient, onEdit }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formattedDate = new Date(negotiation.closeDate + 'T12:00:00').toLocaleDateString('pt-BR');
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(negotiation.value);

  const brandColor = getBrandColor(negotiation.client);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -6, 
        scale: 1.01,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className={`glass-card flex flex-col transition-all group overflow-hidden cursor-pointer ${isActiveClient ? 'border-opacity-100' : 'hover:border-accent/30'}`}
      style={{ 
        borderColor: isActiveClient && brandColor ? brandColor : undefined,
        boxShadow: isActiveClient && brandColor ? `0 0 25px ${brandColor}40` : undefined,
        backgroundColor: isActiveClient ? 'rgba(255,255,255,0.03)' : undefined
      }}
    >
      {/* Institutional Brand Strip */}
      <div className={`h-1 w-full ${getBrandStripClass(negotiation.client)} shadow-sm group-hover:h-1.5 transition-all duration-300`} />

      <div className="p-4 flex-1 text-left">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 overflow-hidden">
            {/* 1. Client */}
            <p className="text-[0.65rem] text-text-secondary uppercase tracking-widest font-bold mb-1 truncate">
              {negotiation.client}
            </p>
            
            {/* 2. Product */}
            <div 
              className="text-base font-black text-white mb-2 group-hover:text-accent transition-colors truncate"
              style={brandColor ? { color: brandColor } : {}}
            >
              {negotiation.product}
            </div>

            {/* 3. Area Label */}
            <span className="inline-block px-1.5 py-0.5 bg-white/5 text-text-secondary text-[0.55rem] font-bold uppercase tracking-widest rounded border border-glass-border">
              {negotiation.area}
            </span>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(negotiation);
            }}
            className="text-text-secondary hover:text-white p-1 ml-2"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Grid with Date and Value */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-glass-border">
          <div className="flex flex-col">
            <span className="text-[0.55rem] text-text-secondary uppercase leading-tight">Previsão</span>
            <span className="text-xs font-semibold">{formattedDate}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[0.55rem] text-text-secondary uppercase leading-tight">Valor</span>
            <span className="text-xs font-bold text-[#4ade80]">{formattedValue}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 mt-auto">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[0.65rem] font-semibold text-white border border-glass-border rounded-lg hover:bg-white/5 transition-all"
        >
          <Info className="w-3 h-3" />
          {showDetails ? 'Ocultar' : 'Detalhes'}
        </button>
      </div>

      {showDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 pb-4 bg-black/10 border-t border-glass-border"
        >
          <p className="text-[0.65rem] text-text-secondary leading-tight pt-3 italic">
            {negotiation.observations || 'Sem observações.'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
