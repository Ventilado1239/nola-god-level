// frontend/src/components/charts/RevenueByHour.tsx
// (CORRIGIDO)

import BarBasic from "./BarBasic";

export default function RevenueByHour({ hour, revenue }: { hour: number; revenue: number }) {
  // gera série de dados no formato que BarBasic espera: { label: string, value: number }
  const data = Array.from({ length: 24 }, (_, h) => ({
    label: `${h}h`, // CORRIGIDO: de 'h' para 'label' (e formatado como string)
    value: h === hour ? revenue : Math.max(0, Math.round(revenue * (0.3 + Math.random() * 0.5))) // CORRIGIDO: de 'v' para 'value'
  }));

  // CORRIGIDO: Removido xKey="h" e yKey="v".
  // O componente BarBasic já usa "label" e "value" por padrão.
  return <BarBasic data={data} />;
}