// frontend/src/components/ui/Select.tsx

type Opt = {
  value: string | number;
  label: string;
};

export default function Select({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Opt[];
  value?: string | number | null;
  onChange: (v: string) => void;
  ariaLabel?: string;
}) {
  return (
    <select
      aria-label={ariaLabel ?? "Selecionar opção"}
      // --- ATUALIZADO AQUI ---
      className="border rounded-lg px-3 py-2 text-sm w-full bg-white
                 dark:bg-gray-700 dark:border-gray-600 dark:text-white 
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}