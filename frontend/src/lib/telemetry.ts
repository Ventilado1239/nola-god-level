type EventName =
  | "overview_load"
  | "heatmap_load"
  | "custom_query"
  | "export_csv"
  | "export_xlsx"
  | "apply_filters";

export function logEvent(name: EventName, props?: Record<string, any>) {
  // troque por envio a um endpoint se quiser
  // fetch("/telemetry", { method: "POST", body: JSON.stringify({ name, ts: Date.now(), ...props }) })
  // Por enquanto, só console:
  // eslint-disable-next-line no-console
  console.log("[telemetry]", name, { ts: new Date().toISOString(), ...(props || {}) });
}

export async function withTiming<T>(name: EventName, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const res = await fn();
    const ms = Math.round(performance.now() - start);
    logEvent(name, { ms, status: "ok" });
    return res;
  } catch (e: any) {
    const ms = Math.round(performance.now() - start);
    logEvent(name, { ms, status: "error", error: String(e?.message || e) });
    throw e;
  }
}
