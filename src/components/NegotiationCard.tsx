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
      whileHover={{ y: -4 }}
      className={`glass-card flex flex-col transition-all group overflow-hidden ${isActiveClient ? 'border-opacity-100' : ''}`}
      style={{ 
        borderColor: isActiveClient && brandColor ? brandColor : undefined,
        boxShadow: isActiveClient && brandColor ? `0 0 25px ${brandColor}40` : undefined
      }}
    >
      {/* Institutional Brand Strip */}
      <div className={`h-1 w-full ${getBrandStripClass(negotiation.client)} shadow-sm`} />

      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-base font-bold text-white mb-0.5 group-hover:text-accent transition-colors truncate max-w-[150px]">
              {negotiation.product}
            </div>
            <span className="inline-block px-1.5 py-0 bg-white/10 text-accent text-[0.6rem] font-bold uppercase tracking-wider rounded border border-glass-border">
              {negotiation.area}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(negotiation);
            }}
            className="text-text-secondary hover:text-white p-1"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 mb-4">
          <p className="text-[0.7rem] text-text-secondary truncate">
            Cliente:{' '}
            <span 
              className={`font-bold transition-all ${isActiveClient ? 'text-sm' : 'text-[0.7rem]'}`}
              style={brandColor ? { color: brandColor } : { color: 'white' }}
            >
              {negotiation.client}
            </span>
          </p>
        </div>

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
