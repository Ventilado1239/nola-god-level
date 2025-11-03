// frontend/src/components/ui/VirtualTable.tsx
// (CORRIGIDO: Com classes 'dark:' para o tema escuro)

import { TopItem } from "@/lib/types"; // (Presumindo que o tipo 'TopItem' está aqui)

// Props mudadas de 'rows' para 'data' para bater com o BarBasic
export default function VirtualTable({
  rows
}: {
  rows: { label: string; value: number }[];
}) {
  return (
    <div className="h-72 overflow-y-auto">
      <table className="w-full text-sm">
        <thead>
          {/* --- ATUALIZADO AQUI --- */}
          <tr className="text-left text-gray-600 dark:text-gray-400 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
            <th className="py-2">Dimensão</th>
            <th className="py-2 text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            // --- ATUALIZADO AQUI ---
            <tr key={i} className="border-b dark:border-gray-700 last:border-0">
              <td className="py-2">{r.label}</td>
              <td className="py-2 text-right">
                {r.value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}