// frontend/src/lib/api.ts
import type { OverviewResponse, CustomResponse, HeatmapResponse } from "./types";

const USE_MOCK = false;

function cleanParams(params: Record<string, any>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k in params) {
    const v = params[k];
    if (v !== null && v !== undefined && v !== "undefined") out[k] = String(v);
  }
  return out;
}

async function fetchApi<T>(url: string, params: Record<string, any>): Promise<T> {
  const q = new URLSearchParams(cleanParams(params));
  const res = await fetch(`http://localhost:8000/api${url}?${q}`);
  if (!res.ok) {
    console.error(`API Error on ${url}:`, res.status, res.statusText);
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

// ----- Endpoints -----

export async function getOverview(params: {
  start_date: string;
  end_date: string;
  store_id?: number;
  channel_id?: number;
  store?: string;
  channel?: string;
  product?: string;
}): Promise<OverviewResponse> {
  return fetchApi<OverviewResponse>("/overview", params);
}

export async function getHeatmap(params: {
  start_date: string;
  end_date: string;
  store_id?: number;
  channel_id?: number;
  store?: string;
  channel?: string;
}): Promise<HeatmapResponse> {
  return fetchApi<HeatmapResponse>("/heatmap", params);
}

export async function getCustom(params: {
  metric: string;
  group_by: string;
  start_date: string;
  end_date: string;
  store_id?: number;
  channel_id?: number;
  store?: string;
  channel?: string;
  product?: string;
  limit?: number;
}): Promise<CustomResponse> {
  return fetchApi<CustomResponse>("/custom", params);
}

export async function getCustomCompare(params: {
  metric: string;
  group_by: string;
  start_date: string;
  end_date: string;
  store_id?: number;
  channel_id?: number;
  store?: string;
  channel?: string;
  product?: string;
  limit?: number;
}): Promise<CustomResponse> {
  return fetchApi<CustomResponse>("/custom-compare", params);
}

async function fetchInsights<T>(
  url: string,
  params: {
    start_date: string;
    end_date: string;
    store_id?: number;
    channel_id?: number;
    limit?: number;
  }
): Promise<T> {
  return fetchApi<T>(url, params);
}

export async function getTopItems(params: {
  start_date: string;
  end_date: string;
  store_id?: number;
  channel_id?: number;
  limit?: number;
}): Promise<CustomResponse> {
  return fetchInsights<CustomResponse>("/insights/top-items", params);
}

export async function getDeliveryPerformance(params: {
  start_date: string;
  end_date: string;
  store_id?: number;
  channel_id?: number;
  limit?: number;
}): Promise<CustomResponse> {
  return fetchInsights<CustomResponse>("/insights/delivery-performance", params);
}

export async function getAutoInsights(params: {
  start_date: string;
  end_date: string;
  store_id?: number;
  channel_id?: number;
  store?: string;
  channel?: string;
  product?: string;
}): Promise<{ insights: string[] }> {
  return fetchApi<{ insights: string[] }>("/insights/auto", params);
}

// --- PONTO 16: RFM (Clientes) ---
export async function getRfmAnalysis(params: {
  start_date: string;
  end_date: string;
  store_id?: number;
  channel_id?: number;
  store?: string;
  channel?: string;
  product?: string;
}): Promise<{ at_risk_count: number }> {
  return fetchApi<{ at_risk_count: number }>("/insights/rfm-analysis", params);
}

// --- PONTO 17: LISTA DE CLIENTES RFM (ACIONÁVEL) ---
export async function getRfmList(params: {
  metric: string; 
  group_by: string;
  start_date: string;
  end_date: string;
  store_id?: number;
  channel_id?: number;
  store?: string;
  channel?: string;
  product?: string;
  limit?: number;
}): Promise<CustomResponse> {
  return fetchApi<CustomResponse>("/insights/rfm-list", params);
}