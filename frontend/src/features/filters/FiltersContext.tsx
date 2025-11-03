// frontend/src/features/filters/FiltersContext.tsx

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { Filters } from "@/lib/types";
import { addDays, format } from "date-fns";

type Ctx = {
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  resetFilters: () => void;
};

const FiltersCtx = createContext<Ctx | null>(null);

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const last7 = format(addDays(new Date(), -7), "yyyy-MM-dd");

  const defaultFilters: Filters = {
    startDate: last7,
    endDate: today,
    storeId: null,
    channelId: null,
    product: null, 
    store: null,
    channel: null,
  };

  const [filters, setFiltersState] = useState<Filters>(defaultFilters);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFiltersState((prev) => ({
      ...prev,
      startDate: params.get("start") ?? prev.startDate,
      endDate: params.get("end") ?? prev.endDate,
      storeId: params.has("storeId") ? Number(params.get("storeId")) : prev.storeId,
      channelId: params.has("channelId") ? Number(params.get("channelId")) : prev.channelId,
      product: params.get("product") ?? prev.product,
      store: params.get("store") ?? prev.store,
      channel: params.get("channel") ?? prev.channel,
    }));
  }, []);

  const setFilters = (p: Partial<Filters>) => {
    setFiltersState((prev) => {
      const next = { ...prev, ...p };
      const qs = new URLSearchParams();
      
      qs.set("start", next.startDate);
      qs.set("end", next.endDate);
      
      // Limpa os filtros conflitantes (ID vs Nome)
      // Se um filtro de ID for aplicado (pelo FilterBar), limpa o filtro de nome
      if (p.storeId) next.store = null;
      if (p.channelId) next.channel = null;
      // Se um filtro de Nome for aplicado (pelo DrillLink), limpa o filtro de ID
      if (p.store) next.storeId = null;
      if (p.channel) next.channelId = null;

      // Seta os filtros na URL
      if (next.storeId) qs.set("storeId", String(next.storeId));
      if (next.channelId) qs.set("channelId", String(next.channelId));
      if (next.store) qs.set("store", next.store);
      if (next.channel) qs.set("channel", next.channel);
      if (next.product) qs.set("product", next.product);
      
      history.replaceState(null, "", `${window.location.pathname}?${qs.toString()}`);
      return next;
    });
  };

  const resetFilters = () => {
    setFiltersState(defaultFilters);
    history.replaceState(null, "", window.location.pathname);
  };

  const value = useMemo(() => ({ filters, setFilters, resetFilters }), [filters]);
  return <FiltersCtx.Provider value={value}>{children}</FiltersCtx.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersCtx);
  if (!ctx) throw new Error("useFilters must be used within FiltersProvider");
  return ctx;
}