import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Save, X, Edit2, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { Negotiation } from '../types';
import { motion } from 'motion/react';

interface DataEntryProps {
  negotiations: Negotiation[];
  onBack: () => void;
  exposedEditRef?: React.MutableRefObject<((neg: Negotiation) => void) | null>;
}

export function DataEntry({ negotiations, onBack, exposedEditRef }: DataEntryProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [displayValue, setDisplayValue] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Negotiation | 'area-product'; direction: 'asc' | 'desc' } | null>(null);

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

  const resetForm = () => {
    setFormData({
      client: '',
      area: '',
      product: '',
      closeDate: '',
      value: 0,
      observations: '',
    });
    setDisplayValue('');
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        userId: auth.currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp(),
      };

      if (editingId) {
        const docRef = doc(db, 'negotiations', editingId);
        await updateDoc(docRef, { ...formData });
      } else {
        await addDoc(collection(db, 'negotiations'), data);
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'negotiations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta negociação?')) return;
    try {
      await deleteDoc(doc(db, 'negotiations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `negotiations/${id}`);
    }
  };

  const handleEdit = (neg: Negotiation) => {
    setFormData({
      client: neg.client,
      area: neg.area,
      product: neg.product,
      closeDate: neg.closeDate,
      value: neg.value,
      observations: neg.observations,
    });
    setDisplayValue(formatBRL(neg.value));
    setEditingId(neg.id!);
    setIsAdding(true);
  };

  // Expose handleEdit to parent
  React.useEffect(() => {
    if (exposedEditRef) {
      exposedEditRef.current = handleEdit;
    }
  }, [exposedEditRef]);

  const sortedNegotiations = useMemo(() => {
    let sortableItems = [...negotiations];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'area-product') {
          aValue = `${a.area} ${a.product}`.toLowerCase();
          bValue = `${b.area} ${b.product}`.toLowerCase();
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
          if (typeof aValue === 'string') aValue = aValue.toLowerCase();
          if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [negotiations, sortConfig]);

  const requestSort = (key: keyof Negotiation | 'area-product') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Negotiation | 'area-product' }) => {
    if (!sortConfig || sortConfig.key !== columnKey) return <div className="w-4 h-4 opacity-0 group-hover:opacity-20 transition-opacity"><ChevronUp className="w-4 h-4" /></div>;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-accent" /> : <ChevronDown className="w-4 h-4 text-accent" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 select-none">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter text-white italic">Gestão</h2>
          <p className="text-[0.7rem] text-text-secondary font-semibold tracking-widest uppercase mt-1">Lançamentos & Registros</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-white/5 border border-glass-border rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-accent rounded-xl hover:brightness-110 transition-all shadow-lg shadow-accent/20 uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" /> Novo Registro
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-12 overflow-hidden"
        >
          <div className="p-4 bg-white/5 border-b border-glass-border flex justify-between items-center select-none">
            <h3 className="text-[0.7rem] uppercase tracking-widest font-bold text-accent italic">
              {editingId ? 'Editar Registro' : 'Lançar Novo Registro'}
            </h3>
            <button onClick={resetForm} className="text-text-secondary hover:text-white transition-opacity">
              <X className="w-4 h-4" />
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
                onClick={resetForm}
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
      )}

      {/* Spreadsheet View */}
      <div className="glass-card overflow-x-auto overflow-hidden">
        <table className="w-full text-left font-sans text-sm select-none">
          <thead>
            <tr className="bg-white/5 text-text-secondary border-b border-glass-border">
              <th 
                className="px-8 py-5 font-bold text-[0.6rem] tracking-[0.2em] uppercase cursor-pointer group hover:text-white transition-colors"
                onClick={() => requestSort('client')}
              >
                <div className="flex items-center gap-2">
                  CLIENTE <SortIcon columnKey="client" />
                </div>
              </th>
              <th 
                className="px-8 py-5 font-bold text-[0.6rem] tracking-[0.2em] uppercase cursor-pointer group hover:text-white transition-colors"
                onClick={() => requestSort('area-product')}
              >
                <div className="flex items-center gap-2">
                  ÁREA / PRODUTO <SortIcon columnKey="area-product" />
                </div>
              </th>
              <th 
                className="px-8 py-5 font-bold text-[0.6rem] tracking-[0.2em] uppercase cursor-pointer group hover:text-white transition-colors"
                onClick={() => requestSort('closeDate')}
              >
                <div className="flex items-center gap-2">
                  PREVISÃO DE FECHAMENTO <SortIcon columnKey="closeDate" />
                </div>
              </th>
              <th 
                className="px-8 py-5 font-bold text-[0.6rem] tracking-[0.2em] uppercase text-right cursor-pointer group hover:text-white transition-colors"
                onClick={() => requestSort('value')}
              >
                <div className="flex items-center justify-end gap-2">
                  VALOR <SortIcon columnKey="value" />
                </div>
              </th>
              <th className="px-8 py-5 font-bold text-[0.6rem] tracking-[0.2em] uppercase text-center">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {sortedNegotiations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-24 text-center text-text-secondary opacity-50 uppercase tracking-[0.3em] text-xs">Sem registros para exibição</td>
              </tr>
            ) : (
              sortedNegotiations.map((neg) => (
                <tr key={neg.id} className="hover:bg-white/5 group transition-colors">
                  <td className="px-8 py-5 text-white font-bold">{neg.client}</td>
                  <td className="px-8 py-5">
                    <div className="text-white font-medium">{neg.product}</div>
                    <div className="text-[0.6rem] text-accent font-bold tracking-widest uppercase mt-1">{neg.area}</div>
                  </td>
                  <td className="px-8 py-5 text-text-secondary">
                    {new Date(neg.closeDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-[#4ade80]">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(neg.value)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-4">
                      <button onClick={() => handleEdit(neg)} className="text-text-secondary hover:text-accent transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(neg.id!)} className="text-text-secondary hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
