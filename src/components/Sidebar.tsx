import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, TableProperties, Briefcase, Package, ChevronRight, Menu, X, Plus, ChevronDown, User } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  selectedClient: string;
  setSelectedClient: (client: string) => void;
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  selectedRevenueType: string;
  setSelectedRevenueType: (type: string) => void;
  setSelectedMonth: (month: string) => void;
  areas: string[];
  products: string[];
  clientsList: string[];
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({ 
  view, setView, activeFilter, setActiveFilter, 
  selectedClient, setSelectedClient, 
  selectedTeam, setSelectedTeam,
  selectedRevenueType, setSelectedRevenueType,
  setSelectedMonth,
  areas, products, clientsList, isMobileOpen, setIsMobileOpen 
}: SidebarProps) {
  const [isAreasOpen, setIsAreasOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isTeamsOpen, setIsTeamsOpen] = useState(false);
  const [isRevenueTypeOpen, setIsRevenueTypeOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'data-entry', label: 'Gestão de Dados', icon: TableProperties },
  ];

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setSelectedMonth('all');
    if (view !== 'dashboard') setView('dashboard');
    setIsMobileOpen(false);
  };

  const handleClientClick = (client: string) => {
    setSelectedClient(client);
    setSelectedMonth('all');
    if (view !== 'dashboard') setView('dashboard');
    setIsMobileOpen(false);
  };

  const handleTeamClick = (team: string) => {
    setSelectedTeam(team);
    setSelectedMonth('all');
    if (view !== 'dashboard') setView('dashboard');
    setIsMobileOpen(false);
  };
  
  const handleRevenueTypeClick = (type: string) => {
    setSelectedRevenueType(type);
    setSelectedMonth('all');
    if (view !== 'dashboard') setView('dashboard');
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a0f1d] backdrop-blur-[12px] border-r border-glass-border text-white select-none">
      <div className="p-8 pb-4">
        <button 
          onClick={() => {
            setView('dashboard');
            setSelectedClient('all');
            setActiveFilter('area-all');
            setSelectedMonth('all');
            setIsMobileOpen(false);
          }}
          className="text-left group transition-all"
        >
          <h1 className="text-xl font-black tracking-tighter text-accent leading-tight uppercase group-hover:text-white transition-colors">
            Dashboard Grandes Contas<br/>
            <span className="text-yellow-400 text-[10px] tracking-widest font-black uppercase">Negociações em andamento</span>
          </h1>
        </button>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-accent font-bold opacity-50">Filtro por Time</p>
            <div className="h-px bg-glass-border flex-1 ml-4 opacity-20"></div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {
                handleTeamClick('all');
                setIsTeamsOpen(!isTeamsOpen);
              }}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                selectedTeam === 'all' 
                  ? 'bg-blue-600/20 text-white border-blue-500/50 shadow-lg' 
                  : 'hover:bg-white/5 text-text-secondary border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${selectedTeam === 'all' ? 'bg-accent animate-pulse' : 'bg-white/20'}`} />
                Exibir Todos os Times
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isTeamsOpen ? 'rotate-180' : ''} ${selectedTeam === 'all' ? 'text-accent' : 'opacity-20'}`} />
            </button>
            <AnimatePresence>
              {isTeamsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 gap-1 mt-1 overflow-hidden"
                >
                  {['Vendas', 'Novos Negócios'].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTeamClick(t)}
                      className={`w-full text-left px-9 py-2.5 rounded-xl text-[11px] font-medium transition-all group relative ${
                        selectedTeam === t 
                          ? 'bg-accent/10 text-accent font-bold' 
                          : 'hover:bg-white/5 text-text-secondary hover:text-white'
                      }`}
                    >
                      {selectedTeam === t && (
                        <motion.div layoutId="team-active" className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                      <span className="transition-transform group-hover:translate-x-1 inline-block">
                        {t}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-accent font-bold opacity-50">Visão Financeira</p>
            <div className="h-px bg-glass-border flex-1 ml-4 opacity-20"></div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {
                handleRevenueTypeClick('all');
                setIsRevenueTypeOpen(!isRevenueTypeOpen);
              }}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                selectedRevenueType === 'all' 
                  ? 'bg-emerald-600/20 text-white border-emerald-500/50 shadow-lg' 
                  : 'hover:bg-white/5 text-text-secondary border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${selectedRevenueType === 'all' ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                Todas as Visões
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isRevenueTypeOpen ? 'rotate-180' : ''} ${selectedRevenueType === 'all' ? 'text-emerald-400' : 'opacity-20'}`} />
            </button>
            <AnimatePresence>
              {isRevenueTypeOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 gap-1 mt-1 overflow-hidden"
                >
                  {['Recorrente/MRR', 'Setup/Único'].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRevenueTypeClick(r)}
                      className={`w-full text-left px-9 py-2.5 rounded-xl text-[11px] font-medium transition-all group relative ${
                        selectedRevenueType === r 
                          ? 'bg-emerald-500/10 text-emerald-400 font-bold' 
                          : 'hover:bg-white/5 text-text-secondary hover:text-white'
                      }`}
                    >
                      {selectedRevenueType === r && (
                        <motion.div layoutId="revenue-active" className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                      <span className="transition-transform group-hover:translate-x-1 inline-block">
                        {r}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-accent font-bold opacity-50">Filtro por Clientes</p>
            <div className="h-px bg-glass-border flex-1 ml-4 opacity-20"></div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {
                handleClientClick('all');
                setIsClientsOpen(!isClientsOpen);
              }}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                selectedClient === 'all' 
                  ? 'bg-white/10 text-white border-white/20' 
                  : 'hover:bg-white/5 text-text-secondary border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className={`w-3.5 h-3.5 ${selectedClient === 'all' ? 'text-accent' : 'opacity-40'}`} />
                Exibir Todos Clientes
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isClientsOpen ? 'rotate-180' : ''} ${selectedClient === 'all' ? 'text-accent' : 'opacity-20'}`} />
            </button>
            <AnimatePresence>
              {isClientsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 gap-1 mt-1 overflow-hidden"
                >
                  {clientsList.map((client) => (
                    <button
                      key={client}
                      onClick={() => handleClientClick(client)}
                      className={`w-full text-left px-9 py-2.5 rounded-xl text-[11px] font-medium transition-all group relative ${
                        selectedClient === client 
                          ? 'bg-accent/10 text-accent font-bold' 
                          : 'hover:bg-white/5 text-text-secondary hover:text-white'
                      }`}
                    >
                      {selectedClient === client && (
                        <motion.div layoutId="client-active" className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                      <span className="transition-transform group-hover:translate-x-1 inline-block">
                        {client}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-6 mb-10">
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-accent font-bold mb-4 opacity-50">Navegação Principal</p>
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setView(item.id as ViewType); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm font-semibold border ${
                  view === item.id 
                    ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                    : 'bg-transparent border-transparent text-text-secondary hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-4 h-4 ${view === item.id ? 'text-accent' : ''}`} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-accent font-bold opacity-50">Filtro por Áreas</p>
            <div className="h-px bg-glass-border flex-1 ml-4 opacity-20"></div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {
                handleFilterClick('area-all');
                setIsAreasOpen(!isAreasOpen);
              }}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                activeFilter === 'area-all' 
                  ? 'bg-white/10 text-white border-white/20' 
                  : 'hover:bg-white/5 text-text-secondary border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className={`w-3.5 h-3.5 ${activeFilter === 'area-all' ? 'text-accent' : 'opacity-40'}`} />
                Exibir Tudo
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAreasOpen ? 'rotate-180' : ''} ${activeFilter === 'area-all' ? 'text-accent' : 'opacity-20'}`} />
            </button>
            <AnimatePresence>
              {isAreasOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 gap-1 mt-1 overflow-hidden"
                >
                  {areas.map((area) => (
                    <button
                      key={area}
                      onClick={() => handleFilterClick(`area-${area}`)}
                      className={`w-full text-left px-9 py-2.5 rounded-xl text-[11px] font-medium transition-all group relative ${
                        activeFilter === `area-${area}` 
                          ? 'bg-accent/10 text-accent font-bold' 
                          : 'hover:bg-white/5 text-text-secondary hover:text-white'
                      }`}
                    >
                      {activeFilter === `area-${area}` && (
                        <motion.div layoutId="area-active" className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                      <span className="transition-transform group-hover:translate-x-1 inline-block">
                        {area}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-accent font-bold opacity-50">Filtro por Produtos</p>
            <div className="h-px bg-glass-border flex-1 ml-4 opacity-20"></div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {
                handleFilterClick('product-all');
                setIsProductsOpen(!isProductsOpen);
              }}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                activeFilter === 'product-all' 
                  ? 'bg-white/10 text-white border-white/20' 
                  : 'hover:bg-white/5 text-text-secondary border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className={`w-3.5 h-3.5 ${activeFilter === 'product-all' ? 'text-accent' : 'opacity-40'}`} />
                Exibir Tudo
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isProductsOpen ? 'rotate-180' : ''} ${activeFilter === 'product-all' ? 'text-accent' : 'opacity-20'}`} />
            </button>
            <AnimatePresence>
              {isProductsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 gap-1 mt-1 overflow-hidden"
                >
                  {products.map((product) => (
                    <button
                      key={product}
                      onClick={() => handleFilterClick(`product-${product}`)}
                      className={`w-full text-left px-9 py-2.5 rounded-xl text-[11px] font-medium transition-all group relative ${
                        activeFilter === `product-${product}` 
                          ? 'bg-green-500/10 text-green-400 font-bold' 
                          : 'hover:bg-white/5 text-text-secondary hover:text-white'
                      }`}
                    >
                      {activeFilter === `product-${product}` && (
                        <motion.div layoutId="product-active" className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-400" />
                      )}
                      <span className="transition-transform group-hover:translate-x-1 inline-block">
                        {product}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-accent font-bold opacity-50">Agrupamento</p>
            <div className="h-px bg-glass-border flex-1 ml-4 opacity-20"></div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => {
                setView('grouped-by-client');
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-xs font-bold border ${
                view === 'grouped-by-client' 
                  ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                  : 'hover:bg-white/5 text-text-secondary border-transparent'
              }`}
            >
              <User className={`w-3.5 h-3.5 ${view === 'grouped-by-client' ? 'text-accent' : 'opacity-40'}`} />
              Filtro por Cliente
            </button>
          </div>
        </div>
      </nav>

      <div className="p-6 mt-auto">
        <button 
          onClick={() => { setView('data-entry'); setIsMobileOpen(false); }}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-accent to-blue-600 rounded-xl text-xs text-white font-bold hover:brightness-110 transition-all shadow-lg shadow-accent/20 uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed top-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <motion.aside 
        initial={{ x: '-100%' }}
        animate={{ x: isMobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 w-72 h-screen z-50 lg:hidden"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
