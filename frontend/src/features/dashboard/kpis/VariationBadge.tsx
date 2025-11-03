import Badge from "@/components/ui/Badge";

export default function VariationBadge({pct}:{pct: number | null}){
  if(pct === null) return <Badge tone="neutral">sem comparação</Badge>;
  const tone = pct >= 0 ? "positive" : "negative";
  const arrow = pct >= 0 ? "▲" : "▼";
  return <Badge tone={tone}>{arrow} {pct.toFixed(1)}%</Badge>;
}
