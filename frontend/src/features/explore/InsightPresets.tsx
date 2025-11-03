// frontend/src/features/explore/InsightPresets.tsx
// (CORRIGIDO: Adiciona o preset de RFM)

import Button from "@/components/ui/Button";

export default function InsightPresets({
  run
}: {
  run: (payload: { metric: string; group: string; limit: number }) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => run({ metric: "revenue", group: "product", limit: 10 })}>
        Top 10 por faturamento
      </Button>
      <Button variant="outline" onClick={() => run({ metric: "orders", group: "channel", limit: 5 })}>
        Pedidos por canal
      </Button>
      <Button variant="outline" onClick={() => run({ metric: "ticket", group: "store", limit: 10 })}>
        Ticket por loja
      </Button>
      <Button variant="outline" onClick={() => run({ metric: "revenue", group: "hour", limit: 24 })}>
        Receita por hora
      </Button>
      <Button variant="outline" onClick={() => run({ metric: "revenue", group: "weekday", limit: 7 })}>
        Receita por dia da semana
      </Button>
      
      {/* --- ADICIONE ESTE BOTÃO --- */}
      <Button variant="outline" onClick={() => run({ metric: "revenue", group: "rfm_at_risk", limit: 10 })}>
        Top 10 Clientes em Risco
      </Button>
    </div>
  );
}