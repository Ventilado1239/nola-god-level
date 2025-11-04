// frontend/src/features/explore/ExplorePage.tsx
// (CORRIGIDO)

import { useState, useEffect, useMemo } from "react";
import { useFilters } from "@/features/filters/FiltersContext";
import FilterBar from "@/components/layout/FilterBar";
import {
  getCustom,
  getCustomCompare,
  getTopItems,
  getDeliveryPerformance,
  getRfmList 
} from "@/lib/api";
import type { CustomResponse, Filters, TopItem } from "@/lib/types";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import BarBasic from "@/components/charts/BarBasic";
import { exportToCSV, exportToXLSX } from "@/lib/export";
import InsightPresets from "./InsightPresets";
import VirtualTable from "@/components/ui/VirtualTable";
import Skeleton from "@/components/ui/Skeleton";
import SavedViews from "./SavedViews";
import { useQuery } from "@tanstack/react-query"; 

const metricOpts = [
  { value: "revenue", label: "Faturamento" },
  { value: "orders", label: "Pedidos" },
  { value: "ticket", label: "Ticket médio" },
];

const groupOpts = [
  { value: "channel", label: "Canal" },
  { value: "store", label: "Loja" },
  { value: "product", label: "Produto" },
  { value: "weekday", label: "Dia da semana" },
  { value: "hour", label: "Hora do dia" },
  { value: "top_items", label: "Insight: Top Itens Adicionais" },
  { value: "delivery_perf", label: "Insight: Performance Entrega" },
  { value: "rfm_at_risk", label: "Insight: Clientes em Risco" },
];

const INSIGHT_ENDPOINTS = {
  top_items: getTopItems,
  delivery_perf: getDeliveryPerformance,
  rfm_at_risk: getRfmList,
};


export default function ExplorePage() {
  const { filters, setFilters } = useFilters();
  
  const [metric, setMetric] = useState(filters.metric ?? "revenue");
  const [group, setGroup] = useState(filters.group_by ?? "channel");
  const [limit, setLimit] = useState(filters.limit ?? 10);
  const [compare, setCompare] = useState(false);

  useEffect(() => {
    setMetric(filters.metric ?? "revenue");
    setGroup(filters.group_by ?? "channel");
    setLimit(filters.limit ?? 10);
  }, [filters]);

  const groupBy = filters.group_by ?? "channel";
  const isInsightQuery = groupBy in INSIGHT_ENDPOINTS;
  
  const queryParams = {
    metric: filters.metric ?? "revenue",
    group_by: groupBy,
    start_date: filters.startDate,
    end_date: filters.endDate,
    store_id: filters.storeId ?? undefined,
    channel_id: filters.channelId ?? undefined,
    store: filters.store ?? undefined,
    channel: filters.channel ?? undefined,
    product: filters.product ?? undefined,
    limit: filters.limit ?? 10,
  };
  
  // @ts-ignore
  const apiFunction = isInsightQuery ? INSIGHT_ENDPOINTS[groupBy] : getCustom;
  
  const { data, isLoading: isLoadingData } = useQuery({
    queryKey: ["explore", queryParams], 
    queryFn: () => apiFunction(queryParams as any),
  });

  const { data: compareData, isLoading: isLoadingCompare } = useQuery({
    queryKey: ["exploreCompare", queryParams],
    queryFn: () => getCustomCompare(queryParams as any),
    enabled: compare && !isInsightQuery,
  });

  const isLoading = isLoadingData || isLoadingCompare;

  const updateGlobalFilters = () => {
    setFilters({ metric, group_by: group, limit });
  };
  
  const handleLoadView = (payload: Filters) => {
    setFilters(payload);
  };

  const currentExploreFilters: Filters = useMemo(
    () => ({
      ...filters,
      metric: metric,
      group_by: group,
      limit: limit,
    }),
    [filters, metric, group, limit]
  );
  
  const mergedForChart = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, { label: string; value: number; prev?: number }>();
    data.data.forEach((d: TopItem) =>
      map.set(String(d.label), { label: String(d.label), value: d.value })
    );
    if (compare && compareData) {
      compareData.data.forEach((r: TopItem) => {
        const key = String(r.label);
        const ex = map.get(key);
        if (ex) ex.prev = r.value;
        else map.set(key, { label: key, value: 0, prev: r.value });
      });
    }
    return Array.from(map.values());
  }, [data, compare, compareData]);

  
  // --- AQUI ESTÁ A CORREÇÃO ---
  // 1. Define o tipo que o InsightPresets envia
  type PresetPatch = Partial<{
    metric: string;
    group: string;
    start: string;
    end: string;
    store?: string;
    channel?: string;
    limit?: number;
  }>;

  // 2. Atualiza a função para aceitar o tipo 'PresetPatch'
  const runPreset = (p: PresetPatch) => {
    setCompare(false);
    
    // 3. Usa os valores do patch ou mantém os valores de estado atuais como padrão
    const newMetric = p.metric ?? metric;
    const newGroup = p.group ?? group;
    const newLimit = p.limit ?? limit;

    setMetric(newMetric as any);
    setGroup(newGroup as any);
    setLimit(newLimit);
    
    // 4. Aplica os filtros globais
    setFilters({
      metric: newMetric,
      group_by: newGroup,
      limit: newLimit,
    });
  };
  // --- FIM DA CORREÇÃO ---


  const rows = useMemo(() => data?.data ?? [], [data]);

  return (
    <div className="space-y-6">
      <FilterBar />

      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <div className="text-xs text-muted dark:text-gray-400">Quero ver</div>
              <Select
                options={metricOpts}
                value={metric}
                onChange={(v: string) => setMetric(v as any)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted dark:text-gray-400">Agrupado por</div>
              <Select
                options={groupOpts}
                value={group}
                onChange={(v: string) => setGroup(v as any)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted dark:text-gray-400">Top N</div>
              <input
                className="border rounded-lg px-3 py-2 text-sm w-24 bg-white
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number" min={1} max={100}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm ml-auto">
              <input
                type="checkbox"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
              />
              Comparar com período anterior
            </label>
            <Button onClick={updateGlobalFilters}>
              Gerar visão
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportToCSV(
                  `explore_${metric}_${group}.csv`,
                  rows.map((r: TopItem) => ({ dimension: r.label, value: r.value }))
                )
              }
            >
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                exportToXLSX(
                  `explore_${metric}_${group}.xlsx`,
                  rows.map((r: TopItem) => ({ dimension: r.label, value: r.value }))
                )
              }
            >
              XLSX
            </Button>
          </div>
        </CardContent>
      </Card>

      <SavedViews
        currentFilters={currentExploreFilters}
        onLoadView={handleLoadView}
      />
      
      <Card>
        <CardHeader
          title="Presets de insight"
          subtitle="Um clique para perguntas comuns"
        />
        <CardContent>
          <InsightPresets onApply={runPreset} onRun={() => {}} />
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-80" />
      ) : (
        data && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader title="Gráfico" />
              <CardContent>
                <BarBasic
                  data={mergedForChart}
                  xKey="label"
                  yKey="value"
                  compare={compare}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Tabela (virtualizada)" />
              <CardContent>
                <VirtualTable rows={rows.map((r: TopItem) => ({
                    label: String(r.label),
                    value: r.value,
                  }))}
                />
              </CardContent>
            </Card>
          </section>
        )
      )}
    </div>
  );
}
