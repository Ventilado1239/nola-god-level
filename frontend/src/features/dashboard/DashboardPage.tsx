// frontend/src/features/dashboard/DashboardPage.tsx
// (CORRIGIDO: Removido o DrillLink do Card "Clientes em Risco")

import { useFilters } from "@/features/filters/FiltersContext";
import FilterBar from "@/components/layout/FilterBar";
import KpiCard from "./kpis/KpiCard";
import RevenueByHour from "@/components/charts/RevenueByHour";
import TopProductsTable from "./tables/TopProductsTable";
import { getOverview, getHeatmap, getAutoInsights, getRfmAnalysis } from "@/lib/api";
import type { OverviewResponse, HeatmapCell, TopProduct } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { exportToCSV, exportToXLSX } from "@/lib/export";
import Heatmap from "@/components/charts/Heatmap";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import DrillLink from "@/components/ui/DrillLink";
import { useQuery } from "@tanstack/react-query";

// ... (função renderInsight permanece a mesma) ...
function renderInsight(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
    .replace(/📈/g, '<span class="mr-2">📈</span>')
    .replace(/📉/g, '<span class="mr-2">📉</span>')
    .replace(/🎉/g, '<span class="mr-2">🎉</span>')
    .replace(/⚠️/g, '<span class="mr-2">⚠️</span>');
}

export default function DashboardPage() {
  const { filters } = useFilters();
  
  const queryParams = {
    start_date: filters.startDate,
    end_date: filters.endDate,
    store_id: filters.storeId ?? undefined,
    channel_id: filters.channelId ?? undefined,
    store: filters.store ?? undefined,
    channel: filters.channel ?? undefined,
    product: filters.product ?? undefined,
  };

  const { data: overviewData, isLoading: isLoadingOverview } = useQuery({
    queryKey: ["overview", queryParams],
    queryFn: () => getOverview(queryParams),
  });

  const { data: heatmapData, isLoading: isLoadingHeatmap } = useQuery({
    queryKey: ["heatmap", queryParams],
    queryFn: () => getHeatmap(queryParams),
  });

  const { data: insightsData, isLoading: isLoadingInsights } = useQuery({
    queryKey: ["autoInsights", queryParams],
    queryFn: () => getAutoInsights(queryParams),
  });

  const { data: rfmData, isLoading: isLoadingRfm } = useQuery({
    queryKey: ["rfmAnalysis", queryParams],
    queryFn: () => getRfmAnalysis(queryParams),
  });

  const isLoading = isLoadingOverview || isLoadingHeatmap || isLoadingInsights || isLoadingRfm;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <FilterBar />
        {/* Adiciona um 5º Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-40" />
        <Skeleton className="h-80" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!overviewData || !heatmapData) {
    return (
      <div className="space-y-4">
        <FilterBar />
        <EmptyState subtitle="Ajuste os filtros ou tente novamente." />
      </div>
    );
  }
  
  const data = overviewData;
  const cells = heatmapData.cells;
  const insights = insightsData?.insights ?? [];
  const atRiskCount = rfmData?.at_risk_count ?? 0;

  return (
    <div className="space-y-6">
      <FilterBar />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Faturamento"
          value={`R$ ${data.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          variation={data.revenue_change_pct}
        />
        <KpiCard title="Pedidos" value={`${data.orders.toLocaleString("pt-BR")}`} variation={data.orders_change_pct} />
        <KpiCard title="Ticket médio"
          value={`R$ ${data.ticket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          variation={data.ticket_change_pct}
        />
        <KpiCard title="Canal Top"
          value={data.top_channel ? <DrillLink label={data.top_channel.label} param="channel" value={data.top_channel.label} /> : "—"}
          variation={null}
        />
        
        {/* --- CORREÇÃO AQUI: De volta a ser um número, não um link --- */}
        <KpiCard 
          title="Clientes em Risco"
          value={atRiskCount.toLocaleString("pt-BR")}
          variation={null} 
        />
      </section>

      {insights.length > 0 && (
        <Card>
          <CardHeader title="Insights Automáticos" />
          <CardContent>
            <ul className="list-disc ml-5 space-y-2">
              {insights.map((text, i) => (
                <li 
                  key={i} 
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: renderInsight(text) }} 
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Receita por hora (pico)"
            subtitle={data.peak_hour ? `Hora de pico: ${data.peak_hour.hour}h` : undefined}
          />
          <CardContent>
            {data.peak_hour ? (
              <RevenueByHour hour={data.peak_hour.hour} revenue={data.peak_hour.revenue} />
            ) : (
              <EmptyState subtitle="Sem dados para o período." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Top produtos por faturamento" subtitle="Clique para explorar" />
          <CardContent className="space-y-3">
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  exportToCSV("top_produtos.csv", data.top_products.map((p) => ({
                    produto: p.product, quantidade: p.quantity, faturamento: p.revenue
                  })))
                }
              >
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  exportToXLSX("top_produtos.xlsx", data.top_products.map((p) => ({
                    produto: p.product, quantidade: p.quantity, faturamento: p.revenue
                  })))
                }
              >
                XLSX
              </Button>
            </div>
            <TopProductsTable
              rows={data.top_products.map((r: TopProduct) => ({
                ...r,
                productLink: <DrillLink label={r.product} param="product" value={r.product} />
              }))}
            />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader title="Heatmap: Receita por Dia × Hora" subtitle="Identifique horários/días críticos" />
        <CardContent>
          {cells?.length ? <Heatmap cells={cells} /> : <EmptyState subtitle="Sem dados para o período." />}
        </CardContent>
      </Card>
      
    </div>
  );
}