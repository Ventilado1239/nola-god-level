// frontend/src/lib/mock.ts
// (CORRIGIDO para passar no build)

import type { OverviewResponse, HeatmapResponse, CustomResponse, TopItem, PeakHour, TopProduct } from "./types";

// Tipos corretos para satisfazer o build
const mockPeak: PeakHour = {
  hour: 18,
  total_sales: 120,
  revenue: 3500.50
};

const mockTopProduct: TopProduct = {
  product: "Produto Mock",
  quantity: 50,
  revenue: 500
};

const mockTopItem: TopItem = {
  label: "Canal Mock",
  value: 100
};

export const MOCK_OVERVIEW: OverviewResponse = {
  revenue: 120500.75,
  revenue_change_pct: 15.2,
  orders: 890,
  orders_change_pct: -2.1,
  ticket: 135.39,
  ticket_change_pct: 17.5,
  
  top_channel: mockTopItem,
  top_channels: [mockTopItem],
  top_stores: [{ label: "Loja Mock", value: 300 }],
  top_products: [mockTopProduct],

  conversions_by_day: [
    { date: "2025-10-20", total_events: 50 },
    { date: "2025-10-21", total_events: 55 }
  ],
  peak_hour: mockPeak,
  insights: [
    "O faturamento aumentou 15.2% em comparação com o período anterior.",
    "O canal 'Canal Mock' foi o de melhor performance."
  ]
};

export const MOCK_HEATMAP: HeatmapResponse = {
  cells: [
    { dow: 1, hour: 10, value: 10 },
    { dow: 2, hour: 11, value: 20 },
    { dow: 3, hour: 12, value: 30 }
  ]
};

export const MOCK_CUSTOM: CustomResponse = {
  data: [
    { label: "Item A", value: 1000 },
    { label: "Item B", value: 800 },
    { label: "Item C", value: 500 }
  ],
  metric: "revenue",
  group_by: "product"
};

export const MOCK_CUSTOM_COMPARE: CustomResponse = {
  data: [
    { label: "Item A", value: 900 },
    { label: "Item B", value: 850 },
    { label: "Item C", value: 400 }
  ]
};