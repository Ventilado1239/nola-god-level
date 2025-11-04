// frontend/src/features/dashboard/kpis/KpiCard.tsx
// (CORRIGIDO: Adiciona prop 'ctaLink' para o "Ver Lista")

import clsx from "clsx";
import Tooltip from "@/components/ui/Tooltip"; 

const kpiDefinitions: Record<string, string> = {
  "Faturamento": "Soma de 'total_revenue' (receita líquida) de todas as vendas no período selecionado, vindo da Materialized View 'mv_kpis_daily'.",
  "Pedidos": "Contagem total de 'total_orders' no período selecionado, vindo da Materialized View 'mv_kpis_daily'.",
  "Ticket médio": "Calculado como (Faturamento Total / Pedidos Totais) para o período selecionado.",
  "Canal Top": "O 'channel_name' com a maior contagem de pedidos no período. O dado vem da 'mv_kpis_daily'. Clique para explorar este canal.",
  // --- ADICIONE A DEFINIÇÃO PARA O NOVO KPI ---
  "Clientes em Risco": "Contagem de clientes que fizeram 2 ou mais pedidos, mas não compram há mais de 30 dias. Calculado via RFM na 'mv_kpis_daily'."
};

export default function KpiCard({
  title,
  value,
  variation,
  prevValue,
  ctaLink, // <-- 1. ADICIONA A NOVA PROP
}: {
  title: string;
  value: React.ReactNode;
  variation: number | null;
  prevValue?: number | null;
  ctaLink?: React.ReactNode; // <-- 1. ADICIONA A NOVA PROP
}) {
  const current = (typeof value === "number" || typeof value === "string")
    ? Number(String(value).replace(/[^\d,-]/g, "").replace(",", "."))
    : 0; 
  
  let absDelta: number | null = null;

  if (typeof prevValue === "number") {
    absDelta = current - prevValue;
  } else if (typeof variation === "number" && !Number.isNaN(current) && variation !== 0) {
    const prev = current / (1 + variation / 100);
    absDelta = current - prev;
  }
  
  const formattedDelta =
    absDelta === null
      ? null
      : absDelta >= 1000 || absDelta <= -1000
      ? `R$ ${absDelta.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : `R$ ${absDelta.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const up = typeof variation === "number" ? variation >= 0 : null;
  
  const variationTooltip = `Comparado com o período anterior. 
    ${formattedDelta ? `Mudança absoluta: ${formattedDelta}.` : ''} 
    Mudança percentual: ${variation?.toFixed(1)}%.`;

  return (
    <div className="border rounded-xl bg-white p-4 dark:bg-gray-800 dark:border-gray-700 shadow-sm flex flex-col"> {/* <-- Adicionado flex flex-col */}
      
      <Tooltip text={kpiDefinitions[title] ?? title}>
        <div className="text-sm text-gray-600 dark:text-gray-400 cursor-help border-b border-dashed border-gray-300 border-opacity-0 hover:border-opacity-100 transition-all w-fit">
          {title}
        </div>
      </Tooltip>
      
      <div className="text-2xl font-semibold mt-1 dark:text-white">{value}</div>
      
      {variation !== null && (
        <Tooltip text={variationTooltip}>
          <div
            className={clsx(
              "mt-1 inline-flex items-center gap-2 text-sm px-2 py-1 rounded cursor-help",
              up ? "text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-900/50" 
                 : "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/50"
            )}
            aria-live="polite"
          >
            <span>{up ? "▲" : "▼"}</span>
            <span>
              {absDelta && (Math.abs(absDelta) > 1 || Math.abs(absDelta) < -1) ? `${formattedDelta} • ` : null}
              {Math.abs(variation).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
            </span>
          </div>
        </Tooltip>
      )}

      {/* --- 2. RENDERIZA O LINK AQUI --- */}
      {ctaLink && (
        <div className="mt-auto pt-2"> {/* <-- mt-auto empurra para baixo */}
          {ctaLink}
        </div>
      )}
    </div>
  );
}
