import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDocFromServer,
  doc 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User 
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import { Negotiation, ViewType } from './types';
import { Sidebar } from './components/Sidebar';
import { NegotiationCard } from './components/NegotiationCard';
import { GroupedClientCard } from './components/GroupedClientCard';
import { DataEntry } from './components/DataEntry';
import { DashboardCharts } from './components/DashboardCharts';
import { NegotiationFormModal } from './components/NegotiationFormModal';
import { TrendingUp, LogIn, Filter, Bell, Search, Menu as MenuIcon, Briefcase, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { getBrandColor } from './lib/brand-colors';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [view, setView] = useState<ViewType>('dashboard');
  const [activeFilter, setActiveFilter] = useState('area-all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [isChartsOpen, setIsChartsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNegForEdit, setSelectedNegForEdit] = useState<Negotiation | null>(null);

  const editRef = useRef<((neg: Negotiation) => void) | null>(null);

  const activeClientColor = getBrandColor(selectedClient);

  // 1. Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
  }, []);

  // 2. Data Connection Test
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // 3. Firestore Listener
  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const q = query(
      collection(db, 'negotiations'),
      orderBy('closeDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Negotiation[];
      setNegotiations(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'negotiations');
    });

    return unsubscribe;
  }, [user, isAuthReady]);

  const areas = useMemo(() => {
    return Array.from(new Set(negotiations.map(n => n.area))).sort();
  }, [negotiations]);

  const products = useMemo(() => {
    return Array.from(new Set(negotiations.map(n => n.product))).sort();
  }, [negotiations]);

  const clientsList = useMemo(() => {
    return Array.from(new Set(negotiations.map(n => n.client))).sort();
  }, [negotiations]);

  const filteredNegotiations = useMemo(() => {
    let result = [...negotiations];

    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.client.toLowerCase().includes(queryLower) || 
        n.product.toLowerCase().includes(queryLower)
      );
    }

    if (selectedClient !== 'all') {
      result = result.filter(n => n.client === selectedClient);
    }

    if (selectedProductFilter !== 'all') {
      result = result.filter(n => n.product === selectedProductFilter);
    }

    if (activeFilter.startsWith('area-')) {
      const areaVal = activeFilter.split('area-')[1];
      if (areaVal !== 'all') {
        result = result.filter(n => n.area === areaVal);
      }
    } else if (activeFilter.startsWith('product-')) {
      const productVal = activeFilter.split('product-')[1];
      if (productVal !== 'all') {
        result = result.filter(n => n.product === productVal);
      }
    }

    return result;
  }, [negotiations, activeFilter, searchQuery, selectedClient, selectedProductFilter]);

  // Calculations reflect filters
  const totalRevenue = useMemo(() => {
    return filteredNegotiations.reduce((sum, n) => sum + n.value, 0);
  }, [filteredNegotiations]);

  const groupedByClient = useMemo(() => {
    const groups: Record<string, { client: string, products: Set<string>, totalValue: number }> = {};
    
    filteredNegotiations.forEach(neg => {
      if (!groups[neg.client]) {
        groups[neg.client] = {
          client: neg.client,
          products: new Set(),
          totalValue: 0
        };
      }
      groups[neg.client].products.add(neg.product);
      groups[neg.client].totalValue += neg.value;
    });
    
    return Object.values(groups).sort((a, b) => b.totalValue - a.totalValue);
  }, [filteredNegotiations]);

  const lastUpdated = useMemo(() => {
    if (negotiations.length === 0) return null;
    const timestamps = negotiations
      .map(n => n.createdAt?.toDate?.() || new Date(0))
      .filter(d => d.getTime() > 0);
    
    if (timestamps.length === 0) return null;
    return new Date(Math.max(...timestamps.map(t => t.getTime())));
  }, [negotiations]);

  const login = async () => {
    console.log("Iniciando login...");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      console.log("Login bem-sucedido:", result.user.email);
    } catch (error: any) {
      console.error("Erro detalhado no Login:", error);
      alert(`Erro ao tentar login: ${error.message || 'Erro desconhecido'}`);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0f172a]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Comentado para permitir acesso público como solicitado
  /*
  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#141414] text-white p-6 select-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
              <Briefcase className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4 text-white uppercase">Dashboard Grandes Contas</h1>
          <p className="font-mono tracking-widest text-xs uppercase mb-12">
            <span className="text-yellow-400 font-black">Negociações em andamento</span>
          </p>
          <button 
            onClick={login}
            className="flex items-center gap-3 bg-white text-black px-10 py-4 rounded-xl font-bold hover:scale-105 transition-all shadow-xl shadow-white/10 group"
          >
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Acessar com Google
          </button>
        </motion.div>
      </div>
    );
  }
  */

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
      <Sidebar 
        view={view} 
        setView={setView} 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        areas={areas}
        products={products}
        clientsList={clientsList}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden relative">
        {/* Superior Header */}
        <div className="p-4 lg:px-10 lg:pt-10 pb-0 shrink-0">
          <header className="glass-header glass-effect py-4 px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between sticky top-0 z-20 shrink-0 select-none gap-4">
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-4 self-start sm:self-auto">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 bg-white/5 rounded-lg text-text-secondary hover:text-white border border-glass-border"
                >
                  <MenuIcon className="w-5 h-5" />
                </button>
                
                {/* Search */}
                <div className="flex items-center bg-white/5 border border-glass-border rounded-xl px-4 py-2 w-full sm:w-64 focus-within:ring-2 focus-within:ring-accent/30 transition-all">
                  <Search className="w-4 h-4 text-text-secondary mr-2 shrink-0" />
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar..." 
                    className="bg-transparent text-sm w-full outline-none text-white placeholder:text-text-secondary pr-4"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {/* Client Selector */}
                <div className="relative group w-full lg:w-auto">
                  <select 
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className={`bg-white/5 border rounded-xl px-4 py-2 text-[11px] font-bold text-white outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer whitespace-nowrap min-w-[140px] appearance-none pr-8 ${
                      selectedClient !== 'all' ? 'border-transparent shadow-lg' : 'border-glass-border'
                    }`}
                    style={selectedClient !== 'all' && activeClientColor ? { backgroundColor: `${activeClientColor}20`, borderColor: activeClientColor } : {}}
                  >
                    <option value="all" className="bg-[#1e293b]">Todos os Clientes</option>
                    {clientsList.map(c => (
                      <option key={c} value={c} className="bg-[#1e293b]">{c}</option>
                    ))}
                  </select>
                  {selectedClient !== 'all' && (
                    <div 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full shadow-sm animate-pulse"
                      style={{ backgroundColor: activeClientColor || '#60a5fa' }}
                    />
                  )}
                </div>

                {/* Product Selector */}
                <select 
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="bg-white/5 border border-glass-border rounded-xl px-4 py-2 text-[11px] font-bold text-white outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer whitespace-nowrap min-w-[140px]"
                >
                  <option value="all" className="bg-[#1e293b]">Todos os Produtos</option>
                  {products.map(p => (
                    <option key={p} value={p} className="bg-[#1e293b]">{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-glass-border lg:border-l lg:pl-10">
              <div className="flex flex-col items-end">
                <span className="text-[0.6rem] font-bold tracking-[0.2em] text-[#4ade80] uppercase leading-none mb-2 opacity-50">Incremento Mensal Previsto</span>
                <div className="flex items-center gap-3 text-[#4ade80]">
                  <TrendingUp className="w-5 h-5 hidden sm:block opacity-40" />
                  <span className="text-xl lg:text-2xl font-black tracking-tighter leading-none text-white drop-shadow-lg">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setIsChartsOpen(!isChartsOpen)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                    isChartsOpen 
                      ? 'bg-accent/20 border-accent/50 text-white shadow-lg shadow-accent/20' 
                      : 'bg-white/5 border-glass-border text-text-secondary hover:text-white'
                  }`}
                  title="Ver Gráficos"
                 >
                   <BarChart3 className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Analytics</span>
                 </button>

                 <div className="w-px h-8 bg-glass-border mx-2 hidden sm:block opacity-30" />

                 {user ? (
                   <button onClick={() => signOut(auth)} className="text-[0.65rem] font-black uppercase tracking-widest bg-red-500/10 text-red-400 px-6 py-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-all shadow-lg shadow-red-500/5">Sair</button>
                 ) : (
                   <button onClick={login} className="text-[0.65rem] font-black uppercase tracking-widest bg-accent/10 text-accent px-6 py-2.5 rounded-xl border border-accent/20 hover:bg-accent/20 transition-all shadow-lg shadow-accent/5">Entrar</button>
                 )}
              </div>
            </div>
          </header>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {view === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 lg:p-10"
              >
                {/* Dashboard Sub Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <h2 className="text-lg font-black tracking-widest text-white uppercase">Visão Geral</h2>
                       {selectedClient !== 'all' && (
                         <div className="flex items-center gap-2">
                            <span className="text-text-secondary opacity-30 text-xl font-thin mx-2">/</span>
                            <motion.span 
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               className="text-xl font-black tracking-tight bg-white/5 px-4 py-1.5 rounded-xl border border-glass-border shadow-lg"
                               style={{ color: activeClientColor || 'white', borderColor: activeClientColor || 'rgba(255,255,255,0.1)' }}
                            >
                               {selectedClient}
                            </motion.span>
                         </div>
                       )}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="status-dot"></div>
                        <p className="text-[0.7rem] text-text-secondary font-semibold tracking-widest uppercase">
                          {filteredNegotiations.length} {filteredNegotiations.length === 1 ? 'REGISTRO ATIVO' : 'REGISTROS ATIVOS'}
                        </p>
                      </div>
                      
                      {lastUpdated && (
                        <div className="flex items-center gap-2 border-l border-glass-border pl-4">
                          <p className="text-[0.6rem] text-text-secondary font-medium tracking-wider uppercase opacity-60">
                            Última atualização: <span className="text-white opacity-100">
                              {lastUpdated.toLocaleDateString('pt-BR')} {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 border border-glass-border p-2 rounded-xl">
                     <Filter className="w-4 h-4 text-accent ml-2" />
                     <p className="text-[0.7rem] font-bold tracking-widest text-text-secondary pr-4 uppercase">
                       {activeFilter === 'area-all' || activeFilter === 'product-all' ? 'VISÃO INTEGRAL' : activeFilter.split('-')[1]}
                     </p>
                  </div>
                </div>

                <AnimatePresence>
                  {isChartsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <DashboardCharts 
                        negotiations={filteredNegotiations} 
                        onClientClick={setSelectedClient}
                        onProductClick={(p) => setActiveFilter(`product-${p}`)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {filteredNegotiations.length === 0 ? (
                  <div className="text-center py-32 opacity-30 select-none">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm font-mono tracking-[0.3em] uppercase">Módulo Vazio</p>
                    <button 
                      onClick={() => setView('data-entry')}
                      className="mt-6 text-sm underline font-bold hover:text-blue-600 transition-colors"
                    >
                      Começar com primeira negociação
                    </button>
                  </div>
                ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
      {filteredNegotiations.map((neg) => (
        <NegotiationCard 
          key={neg.id || Math.random().toString()} 
          negotiation={neg} 
          isActiveClient={selectedClient !== 'all' && neg.client === selectedClient}
          onEdit={(n) => {
            setSelectedNegForEdit(n);
            setIsEditModalOpen(true);
          }}
        />
      ))}
    </div>
                )}
              </motion.div>
            ) : view === 'grouped-by-client' ? (
              <motion.div
                key="grouped"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 lg:p-10"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                  <div className="flex-1">
                    <h2 className="text-lg font-black tracking-widest text-white uppercase mb-2">Agrupamento por Cliente</h2>
                    <p className="text-[0.7rem] text-text-secondary font-semibold tracking-widest uppercase">
                      {groupedByClient.length} {groupedByClient.length === 1 ? 'GRUPO IDENTIFICADO' : 'GRUPOS IDENTIFICADOS'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
                  {groupedByClient.map((group, idx) => (
                    <GroupedClientCard 
                      key={idx}
                      client={group.client}
                      products={Array.from(group.products)}
                      totalValue={group.totalValue}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="data-entry"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DataEntry 
                  negotiations={negotiations} 
                  onBack={() => setView('dashboard')}
                  exposedEditRef={editRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <NegotiationFormModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedNegForEdit(null);
        }}
        negotiation={selectedNegForEdit}
      />
    </div>
  );
}
