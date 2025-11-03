type Cell = { dow: number; hour: number; value: number }; // dow: 0-dom ... 6-sáb
const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Paleta quente (claro -> vermelho)
function scale(v: number, max: number) {
  const p = max ? v / max : 0;
  // 0 -> #fff7ed (laranja bem claro) ... 1 -> #b91c1c (vermelho intenso)
  const stops = [
    "#fff7ed", // muito baixo
    "#ffedd5",
    "#fed7aa",
    "#fdba74",
    "#fb923c",
    "#f97316",
    "#ef4444",
    "#dc2626",
    "#b91c1c"  // pico
  ];
  return stops[Math.min(stops.length - 1, Math.floor(p * (stops.length - 1)))];
}

export default function Heatmap({ cells }: { cells: Cell[] }) {
  const max = cells.reduce((m, c) => Math.max(m, c.value), 0);
  // matrix[dow][hour]
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  cells.forEach(c => (matrix[c.dow][c.hour] = c.value));

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[80px_repeat(24,_minmax(28px,1fr))] gap-1">
          <div />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="text-xs text-center text-muted">{h}h</div>
          ))}
          {matrix.map((row, dow) => (
            <>
              <div key={`lbl-${dow}`} className="text-sm font-medium py-1">{DOW[dow]}</div>
              {row.map((v, h) => (
                <div
                  key={`${dow}-${h}`}
                  title={`${DOW[dow]} ${h}h: ${v.toLocaleString("pt-BR")}`}
                  className="h-7 rounded"
                  style={{ background: scale(v, max) }}
                />
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
