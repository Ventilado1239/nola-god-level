import { useCallback } from "react";

type PresetsProps = {
  onApply: (patch: Partial<{
    metric: string;
    group: string;
    start: string;
    end: string;
    store?: string;
    channel?: string;
    limit?: number;
  }>) => void;
  onRun: () => void;
};

export default function InsightPresets({ onApply, onRun }: PresetsProps) {
  const applyAndRun = useCallback((patch: Partial<{
    metric: string; group: string; start: string; end: string; store?: string; channel?: string; limit?: number;
  }>) => {
    onApply(patch);
    // pequeno timeout para o state “assentar” antes do fetch
    setTimeout(onRun, 0);
  }, [onApply, onRun]);

  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn" onClick={() => applyAndRun({ metric: "revenue", group: "product", limit: 10 })}>
        Top 10 por faturamento
      </button>
      <button className="btn" onClick={() => applyAndRun({ metric: "orders", group: "channel" })}>
        Pedidos por canal
      </button>
      <button className="btn" onClick={() => applyAndRun({ metric: "ticket", group: "store" })}>
        Ticket por loja
      </button>
      <button className="btn" onClick={() => applyAndRun({ metric: "revenue", group: "hour" })}>
        Receita por hora
      </button>
      <button className="btn" onClick={() => applyAndRun({ metric: "revenue", group: "weekday" })}>
        Receita por dia da semana
      </button>
      {/* >>> ESTE AQUI <<< */}
      <button
        className="btn"
        onClick={() => applyAndRun({
          // métrica é irrelevante p/ RFM; deixo "revenue" só para manter UI consistente
          metric: "revenue",
          group: "rfm_at_risk",
          limit: 10
        })}
      >
        Top 10 Clientes em Risco
      </button>
    </div>
  );
}
