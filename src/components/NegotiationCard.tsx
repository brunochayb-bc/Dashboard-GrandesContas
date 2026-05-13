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
  const formattedMRRValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(negotiation.value);

  const formattedSetupValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(negotiation.setupValue || 0);

  const brandColor = getBrandColor(negotiation.client);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        borderColor: brandColor ? `${brandColor}80` : 'rgba(96, 165, 250, 0.4)',
        boxShadow: brandColor 
          ? `0 10px 30px -10px ${brandColor}40, 0 0 20px ${brandColor}20` 
          : '0 10px 30px -10px rgba(0,0,0,0.5), 0 0 20px rgba(96, 165, 250, 0.1)',
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className={`glass-card flex flex-col transition-all group overflow-hidden cursor-pointer ${
        isActiveClient ? 'border-opacity-100 shadow-lg' : 'hover:border-transparent'
      } ${negotiation.status === 'fechado' ? 'opacity-30 grayscale hover:opacity-50 transition-opacity' : ''}`}
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
              className="text-base font-black text-white mb-1 group-hover:text-accent transition-colors truncate"
              style={brandColor ? { color: brandColor } : {}}
            >
              {negotiation.product}
            </div>

            {/* 3. Area Label & Status */}
            <div className="flex items-center gap-2">
              <span className="inline-block px-1.5 py-0.5 bg-white/5 text-text-secondary text-[0.55rem] font-bold uppercase tracking-widest rounded border border-glass-border">
                {negotiation.area}
              </span>
              <span className={`inline-block px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-widest rounded border ${
                (negotiation.team || 'Vendas') === 'Vendas' 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
              }`}>
                {negotiation.team || 'Vendas'}
              </span>
              {negotiation.status === 'fechado' && (
                <span className="inline-block px-1.5 py-0.5 bg-[#4ade80]/10 text-[#4ade80] text-[0.55rem] font-black uppercase tracking-widest rounded border border-[#4ade80]/20">
                  FECHADO
                </span>
              )}
            </div>
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
        <div className="space-y-3 pt-3 border-t border-glass-border">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[0.55rem] text-text-secondary uppercase leading-tight font-bold">Prev. Fechamento</span>
              <span className="text-[11px] font-medium text-white">{formattedDate}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-glass-border">
              <span className="text-[0.45rem] text-accent uppercase font-black tracking-widest mb-1">Recorrente/MRR</span>
              <span className="text-[0.7rem] font-black text-white">{formattedMRRValue}</span>
            </div>
            <div className="flex flex-col bg-white/5 p-2 rounded-lg border border-glass-border">
              <span className="text-[0.45rem] text-blue-400 uppercase font-black tracking-widest mb-1 text-right">Setup/Único</span>
              <span className="text-[0.7rem] font-black text-white text-right">{formattedSetupValue}</span>
            </div>
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
