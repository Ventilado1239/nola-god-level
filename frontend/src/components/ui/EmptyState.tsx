export default function EmptyState({ title = "Sem dados", subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="border rounded-xl bg-white p-8 text-center">
      <div className="text-base font-medium">{title}</div>
      {subtitle && <div className="text-sm text-muted mt-1">{subtitle}</div>}
    </div>
  );
}
