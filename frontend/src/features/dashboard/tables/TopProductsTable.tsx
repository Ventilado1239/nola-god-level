// frontend/src/features/dashboard/tables/TopProductsTable.tsx

export default function TopProductsTable({
  rows
}: {
  rows: { product: string; quantity: number; revenue: number; productLink?: React.ReactNode }[];
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        {/* --- ADICIONADO: classes dark: --- */}
        <tr className="text-left text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
          <th className="py-2">Produto</th>
          <th className="py-2 text-right">Qtd</th>
          <th className="py-2 text-right">Faturamento</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          // --- ADICIONADO: classes dark: ---
          <tr key={i} className="border-b dark:border-gray-700 last:border-0">
            <td className="py-2">{r.productLink ?? r.product}</td>
            <td className="py-2 text-right">{r.quantity.toLocaleString()}</td>
            <td className="py-2 text-right">
              R$ {r.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}