// frontend/src/components/layout/FilterBar.tsx
// (CORRIGIDO: Com classes 'dark:' para o tema escuro)

import { useEffect, useMemo, useState } from "react";
import { useFilters } from "@/features/filters/FiltersContext";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select"; // Este componente também precisa de estilos dark:
import clsx from "clsx";

type Option = { value: string | number; label: string };

// mocks
const storeOptions: Option[] = [{ value: "all", label: "Todos" }, ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Loja ${i + 1}` }))];
const channelOptions: Option[] = [
  { value: "all", label: "Todos" },
  { value: 1, label: "Presencial" },
  { value: 2, label: "iFood" },
  { value: 3, label: "Rappi" },
  { value: 4, label: "Uber Eats" },
  { value: 5, label: "WhatsApp" },
  { value: 6, label: "App Próprio" }
];

export default function FilterBar() {
  const { filters, setFilters, resetFilters } = useFilters();

  const [localStart, setLocalStart] = useState(filters.startDate);
  const [localEnd, setLocalEnd] = useState(filters.endDate);
  const [localStore, setLocalStore] = useState<string | number>(filters.storeId ?? "all");
  const [localChannel, setLocalChannel] = useState<string | number>(filters.channelId ?? "all");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocalStart(filters.startDate);
    setLocalEnd(filters.endDate);
    setLocalStore(filters.storeId ?? "all");
    setLocalChannel(filters.channelId ?? "all");
  }, [filters]);

  const dirty = useMemo(() => {
    if (localStart !== filters.startDate) return true;
    if (localEnd !== filters.endDate) return true;
    if ((localStore === "all" ? null : Number(localStore)) !== filters.storeId) return true;
    if ((localChannel === "all" ? null : Number(localChannel)) !== filters.channelId) return true;
    return false;
  }, [localStart, localEnd, localStore, localChannel, filters]);

  function apply() {
    const next = {
      startDate: localStart,
      endDate: localEnd,
      storeId: localStore === "all" ? null : Number(localStore),
      channelId: localChannel === "all" ? null : Number(localChannel)
    };
    setFilters(next);
  }

  function clear() {
    resetFilters();
  }

  return (
    // --- ATUALIZADO AQUI ---
    <section className="bg-white border rounded-xl p-3 md:p-4 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
      <div className="flex md:hidden items-center justify-between">
        <div className="font-medium dark:text-white">Filtros</div>
        <button
          aria-label={open ? "Recolher filtros" : "Expandir filtros"}
          className="text-sm text-blue-600"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Fechar" : "Abrir"}
        </button>
      </div>

      <div
        className={clsx(
          "grid gap-3 mt-2",
          "md:grid md:grid-cols-[auto_auto_auto_1fr_auto_auto] md:items-end",
          open ? "grid-cols-2" : "hidden md:grid"
        )}
      >
        <div className="space-y-1">
           {/* --- ATUALIZADO AQUI --- */}
          <label htmlFor="startDate" className="text-xs text-gray-600 dark:text-gray-400">De</label>
          <input
            id="startDate"
            aria-label="Data inicial"
            type="date"
            // --- ATUALIZADO AQUI ---
            className="border rounded-lg px-3 py-2 text-sm w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          {/* --- ATUALIZADO AQUI --- */}
          <label htmlFor="endDate" className="text-xs text-gray-600 dark:text-gray-400">Até</label>
          <input
            id="endDate"
            aria-label="Data final"
            type="date"
            // --- ATUALIZADO AQUI ---
            className="border rounded-lg px-3 py-2 text-sm w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          {/* --- ATUALIZADO AQUI --- */}
          <div className="text-xs text-gray-600 dark:text-gray-400">Loja</div>
          <Select
            ariaLabel="Selecionar loja"
            options={storeOptions}
            value={localStore}
            onChange={(v: string) => setLocalStore(v)}
          />
        </div>

        <div className="space-y-1">
          {/* --- ATUALIZADO AQUI --- */}
          <div className="text-xs text-gray-600 dark:text-gray-400">Canal</div>
          <Select
            ariaLabel="Selecionar canal"
            options={channelOptions}
            value={localChannel}
            onChange={(v: string) => setLocalChannel(v)}
          />
        </div>

        <div className="flex gap-2 md:justify-end col-span-2 md:col-span-1">
          <Button aria-label="Aplicar filtros" onClick={apply} disabled={!dirty}>
            Aplicar
          </Button>
          <Button aria-label="Limpar filtros" variant="ghost" onClick={clear}>
            Limpar
          </Button>
        </div>
      </div>
    </section>
  );
}