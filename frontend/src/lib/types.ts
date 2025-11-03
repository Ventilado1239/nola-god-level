// frontend/src/lib/types.ts

// --- Tipos Básicos ---
export type TopItem = {
  label: string;
  value: number;
};
export type TopProduct = {
  product: string;
  quantity: number;
  revenue: number;
};
export type PeakHour = {
  hour: number;
  total_sales: number;
  revenue: number; 
};
export type DailyTotal = {
  date: string;
  total_events: number;
};

// --- Respostas de API ---
export type OverviewResponse = {
  revenue: number;
  revenue_change_pct: number;
  orders: number;
  orders_change_pct: number;
  ticket: number;
  ticket_change_pct: number;
  top_channel: TopItem | null;
  top_channels: TopItem[];
  top_stores: TopItem[];
  top_products: TopProduct[];
  conversions_by_day: DailyTotal[];
  peak_hour: PeakHour | null; 
  insights: string[];
};
export type HeatmapCell = { dow: number; hour: number; value: number };
export type HeatmapResponse = { cells: HeatmapCell[] };
export type CustomItem = TopItem;
export type CustomResponse = {
  data: CustomItem[];
  metric?: string;
  group_by?: string;
};

// --- Tipos de Estado Interno (React) ---
export type Filters = {
  startDate: string;
  endDate: string;
  // IDs (usados pelo FilterBar)
  storeId: number | null;
  channelId: number | null;
  
  // Nomes (usados pelo DrillDown)
  store: string | null;
  channel: string | null;
  product: string | null;
  
  // Filtros do Explorar
  metric?: string;
  group_by?: string;
  limit?: number;
};

export type SavedView = {
  id: string;
  name: string;
  payload: Filters;   
  createdAt: number;
};