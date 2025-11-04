// frontend/src/features/explore/InsightPresets.tsx
// (CORRIGIDO: Usa o componente <Button> estilizado em vez de <button> puro)

import { useCallback } from "react";
import Button from "@/components/ui/Button"; // <-- 1. IMPORTE O COMPONENTE DE BOTÃO

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
      {/* --- 2. SUBSTITUA TODOS OS <button> POR <Button> --- */}
      <Button variant="outline" onClick={() => applyAndRun({ metric: "revenue", group: "product", limit: 10 })}>
        Top 10 por faturamento
      </Button>
      <Button variant="outline" onClick={() => applyAndRun({ metric: "orders", group: "channel" })}>
        Pedidos por canal
      </Button>
      <Button variant="outline" onClick={() => applyAndRun({ metric: "ticket", group: "store" })}>
        Ticket por loja
      </Button>
      <Button variant="outline" onClick={() => applyAndRun({ metric: "revenue", group: "hour" })}>
        Receita por hora
      </Button>
      <Button variant="outline" onClick={() => applyAndRun({ metric: "revenue", group: "weekday" })}>
        Receita por dia da semana
      </Button>
      <Button
        variant="outline"
        onClick={() => applyAndRun({
          metric: "revenue",
          group: "rfm_at_risk",
          limit: 10
        })}
      >
        Top 10 Clientes em Risco
      </Button>
    </div>
  );
}
