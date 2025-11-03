// frontend/src/components/charts/BarBasic.tsx
// (CORRIGIDO: Com classes 'dark:' para o tema escuro)

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

type Series = { label: string; value: number; prev?: number };
export default function BarBasic({
  data,
  xKey = "label",
  yKey = "value",
  compare = false
}: {
  data: Series[];
  xKey?: "label";
  yKey?: "value";
  compare?: boolean;
}) {
  const hasPrev = compare && data.some(d => typeof d.prev === "number");
  
  // Cor do texto dos eixos (cinza claro no modo escuro, cinza escuro no claro)
  const textColor = "hsl(215 20% 65%)"; // text-muted-foreground

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          {/* Linhas do grid mais escuras */}
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 18%)" /> 
          
          {/* Texto dos eixos com a cor correta */}
          <XAxis dataKey={xKey} tick={{ fill: textColor, fontSize: 12 }} stroke={textColor} />
          <YAxis tick={{ fill: textColor, fontSize: 12 }} stroke={textColor} />
          
          {/* Tooltip com fundo escuro */}
          <Tooltip 
            formatter={(v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} // bg-slate-900 border-slate-700
            labelStyle={{ color: "#f1f5f9" }} // text-slate-100
          />
          
          {hasPrev && <Legend wrapperStyle={{ color: textColor }} />}
          {hasPrev && <Bar dataKey="prev" name="Período anterior" fill="#475569" />}
          <Bar dataKey={yKey} name="Período atual" fill="#60a5fa" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}