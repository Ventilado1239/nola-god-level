// frontend/src/lib/api.ts
export type KPI = { revenue: number; orders: number; avg_ticket: number };
export type OverviewResponse = { kpis: KPI };
export type HeatmapCell = { day_of_week: number; hour: number; value: number };
export type HeatmapResponse = { data: HeatmapCell[] };
export type Row = { label: string; value: number };
export type CustomResponse = { data: Row[] };

function resolveApiBase(): string {
  const env = (import.meta as any).env?.VITE_API_BASE;
  if (env) return env.endsWith("/") ? env.slice(0, -1) : env;
  try {
    const { origin } = window.location;
    if (origin.includes(":8080")) return origin.replace(":8080", ":8000");
    if (origin.endsWith(":80")) return origin.replace(":80", ":8000");
    const u = new URL(origin);
    return `${u.protocol}//${u.hostname}:8000`;
  } catch { return "http://localhost:8000"; }
}
export const API_BASE = resolveApiBase();

function cleanParams(p: Record<string, any>) {
  const out: Record<string,string> = {};
  for (const k in p) { const v = (p as any)[k];
    if (v !== null && v !== undefined && v !== "" && v !== "undefined") out[k] = String(v);
  } return out;
}
async function fetchApi<T>(path: string, params?: Record<string, any>): Promise<T> {
  const q = new URLSearchParams(params ? cleanParams(params) : {});
  const url = `${API_BASE}/api${path}${q.toString() ? `?${q}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText} on ${path}`);
  return res.json() as Promise<T>;
}

export async function getOverview(p:{start_date:string;end_date:string;store?:string;channel?:string;}):Promise<OverviewResponse>{
  return fetchApi("/overview", p);
}
export async function getHeatmap(p:{start_date:string;end_date:string;store?:string;channel?:string;}):Promise<HeatmapResponse>{
  return fetchApi("/heatmap", p);
}

/** >>> AQUI: se group_by === rfm_at_risk, envia para /insights/rfm-list e normaliza em {data:[{label,value}]} */
export async function getCustom(p:{
  metric:string; group_by:string; start_date:string; end_date:string; store?:string; channel?:string; product?:string; limit?:number;
}):Promise<CustomResponse>{
  const { group_by, ...rest } = p;
  if (group_by === "rfm_at_risk") {
    const r = await getRfmList({ start_date: rest.start_date, end_date: rest.end_date, store: rest.store, channel: rest.channel, limit: rest.limit ?? 10 });
    return { data: r.data };
  }
  return fetchApi("/custom", { group_by, ...rest });
}

export async function getCustomCompare(p:{
  metric:string; group_by:string; start_date:string; end_date:string; start_date_b?:string; end_date_b?:string; store?:string; channel?:string; product?:string;
}):Promise<CustomResponse>{
  if (p.group_by === "rfm_at_risk") return { data: [] }; // sem compare para RFM no original
  return fetchApi("/custom-compare", p);
}

export async function getAutoInsights(p:{start_date:string;end_date:string;store?:string;channel?:string;}):Promise<{insights:string[]}>{
  return fetchApi("/insights/auto", p);
}
export async function getTopItems(p:{metric:string;group_by:string;start_date:string;end_date:string;limit?:number;store?:string;channel?:string;}):Promise<CustomResponse>{
  return fetchApi("/insights/top-items", p);
}
export async function getDeliveryPerformance(p:{start_date:string;end_date:string;store?:string;channel?:string;}):Promise<CustomResponse>{
  return fetchApi("/insights/delivery-performance", p);
}
export async function getRfmAnalysis(p:{start_date:string;end_date:string;store?:string;channel?:string;}):Promise<{segments:Array<{segment:string;customers:number;revenue:number}>}>{
  return fetchApi("/insights/rfm-analysis", p);
}
export async function getRfmList(p:{start_date:string;end_date:string;segment?:string;limit?:number;store?:string;channel?:string;}):Promise<{data:Row[]}>{
  const raw = await fetchApi<{data:Array<{customer_id:string;name?:string;label?:string;value?:number;revenue?:number;orders?:number}>}>("/insights/rfm-list", p);
  const data: Row[] = (raw.data||[]).map(c => ({ label: String(c.label ?? c.name ?? (c.customer_id?`Cliente ${c.customer_id}`:"Cliente")), value: Number(c.value ?? c.revenue ?? c.orders ?? 0) }));
  return { data };
}
export async function getHealth():Promise<{status:"ok"}>{ return fetchApi("/healthz"); }
