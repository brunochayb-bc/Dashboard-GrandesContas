export interface Negotiation {
  id?: string;
  client: string;
  area: string;
  product: string;
  closeDate: string;
  value: number;
  observations: string;
  status: 'em andamento' | 'fechado';
  team: 'Vendas' | 'Novos Negócios';
  userId: string;
  createdAt: any;
}

export type ViewType = 'dashboard' | 'grouped-by-client' | 'data-entry';
export type FilterType = 'all' | 'area' | 'product' | 'grouped';
