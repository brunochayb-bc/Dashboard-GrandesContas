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
      <div className={`h-1.5 w-full ${getBrandStripClass(negotiation.client)} shadow-sm`} />

      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xl font-bold text-white mb-1 group-hover:text-accent transition-colors">
              {negotiation.product}
            </div>
            <span className="inline-block px-2 py-0.5 bg-white/10 text-accent text-[0.7rem] font-bold uppercase tracking-wider rounded border border-glass-border">
              {negotiation.area}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(negotiation);
            }}
            className="text-text-secondary hover:text-white"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-sm text-text-secondary">
            Cliente:{' '}
            <span 
              className={`font-bold transition-all ${isActiveClient ? 'text-base' : 'text-sm'}`}
              style={brandColor ? { color: brandColor } : { color: 'white' }}
            >
              {negotiation.client}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-glass-border">
          <div className="flex flex-col">
            <span className="text-[0.7rem] text-text-secondary uppercase">Previsão de Fechamento</span>
            <span className="text-sm font-semibold">{formattedDate}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.7rem] text-text-secondary uppercase">Previsto</span>
            <span className="text-sm font-bold text-[#4ade80]">{formattedValue}</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 mt-auto">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white border border-glass-border rounded-xl hover:bg-white/5 transition-all"
        >
          <Info className="w-4 h-4" />
          {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
        </button>
      </div>

      {showDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-6 pb-6 bg-black/10 border-t border-glass-border"
        >
          <p className="text-xs text-text-secondary leading-relaxed pt-4 italic">
            {negotiation.observations || 'Nenhuma observação informada.'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
