import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Negotiation } from '../types';
import { NegotiationFormModal } from './NegotiationFormModal';

interface DataEntryProps {
  negotiations: Negotiation[];
  onBack: () => void;
  exposedEditRef?: React.MutableRefObject<((neg: Negotiation) => void) | null>;
}

export function DataEntry({ negotiations, onBack, exposedEditRef }: DataEntryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Negotiation | 'area-product'; direction: 'asc' | 'desc' } | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta negociação?')) return;
    try {
      await deleteDoc(doc(db, 'negotiations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `negotiations/${id}`);
    }
  };

  const handleEdit = (neg: Negotiation) => {
    setSelectedNegotiation(neg);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedNegotiation(null);
    setIsModalOpen(true);
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
          <h2 className="text-lg font-black tracking-widest text-white uppercase leading-none">Gestão</h2>
          <p className="text-[0.6rem] text-text-secondary font-semibold tracking-widest uppercase mt-2">Lançamentos & Registros</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-white/5 border border-glass-border rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-accent rounded-xl hover:brightness-110 transition-all shadow-lg shadow-accent/20 uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Novo Registro
          </button>
        </div>
      </div>

      <NegotiationFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        negotiation={selectedNegotiation}
      />

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
