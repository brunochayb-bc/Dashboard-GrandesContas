import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { Negotiation } from '../types';

interface NegotiationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  negotiation: Negotiation | null;
}

export function NegotiationFormModal({ isOpen, onClose, negotiation }: NegotiationFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  
  const [formData, setFormData] = useState({
    client: '',
    area: '',
    product: '',
    closeDate: '',
    value: 0,
    observations: '',
  });

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  useEffect(() => {
    if (negotiation) {
      setFormData({
        client: negotiation.client,
        area: negotiation.area,
        product: negotiation.product,
        closeDate: negotiation.closeDate,
        value: negotiation.value,
        observations: negotiation.observations || '',
      });
      setDisplayValue(formatBRL(negotiation.value));
    } else {
      setFormData({
        client: '',
        area: '',
        product: '',
        closeDate: '',
        value: 0,
        observations: '',
      });
      setDisplayValue('');
    }
  }, [negotiation, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        userId: auth.currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp(),
      };

      if (negotiation?.id) {
        const docRef = doc(db, 'negotiations', negotiation.id);
        await updateDoc(docRef, { ...formData });
      } else {
        await addDoc(collection(db, 'negotiations'), data);
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, negotiation ? OperationType.UPDATE : OperationType.CREATE, 'negotiations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl"
          >
            <div className="p-4 bg-white/5 border-b border-glass-border flex justify-between items-center sticky top-0 z-20 backdrop-blur-md">
              <h3 className="text-[0.7rem] uppercase tracking-widest font-black text-accent">
                {negotiation ? 'Editar Registro' : 'Lançar Novo Registro'}
              </h3>
              <button 
                onClick={onClose} 
                className="text-text-secondary hover:text-white transition-opacity p-1"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-secondary mb-2">Cliente</label>
                  <input
                    required
                    tabIndex={1}
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 focus:outline-none focus:border-accent text-sm text-white transition-all"
                    placeholder="Nome da empresa ou contato"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-secondary mb-2">Área</label>
                    <input
                      required
                      tabIndex={2}
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 focus:outline-none focus:border-accent text-sm text-white transition-all"
                      placeholder="Ex: Comercial"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-secondary mb-2">Produto</label>
                    <input
                      required
                      tabIndex={3}
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 focus:outline-none focus:border-accent text-sm text-white transition-all"
                      placeholder="Ex: SaaS Premium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-left">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-secondary mb-2">Previsão de Fechamento</label>
                    <input
                      required
                      tabIndex={4}
                      type="date"
                      value={formData.closeDate}
                      onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                      className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 focus:outline-none focus:border-accent text-sm text-white transition-all appearance-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-secondary mb-2">Valor Previsto (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-accent">R$</span>
                      <input
                        required
                        tabIndex={5}
                        type="text"
                        value={displayValue}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          const val = parseFloat(raw) / 100 || 0;
                          setFormData({ ...formData, value: val });
                          setDisplayValue(formatBRL(val));
                        }}
                        className="w-full bg-white/5 border border-glass-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-accent text-sm text-white font-mono transition-all"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-secondary mb-2">Observações Detalhadas</label>
                  <textarea
                    tabIndex={6}
                    rows={2}
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    className="w-full bg-white/5 border border-glass-border rounded-xl py-3 px-4 focus:outline-none focus:border-accent text-sm text-white resize-none transition-all"
                    placeholder="Notas internas..."
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-glass-border">
                <button
                  type="button"
                  tabIndex={8}
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-bold text-text-secondary hover:text-white transition-colors tracking-widest uppercase"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  tabIndex={7}
                  disabled={loading}
                  className="flex items-center gap-2 px-10 py-2.5 text-xs font-bold text-white bg-accent rounded-xl hover:brightness-110 transition-all disabled:opacity-50 tracking-widest uppercase shadow-lg shadow-accent/20"
                >
                  <Save className="w-4 h-4" /> {loading ? 'Salvando...' : 'Finalizar Registro'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
