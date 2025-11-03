// frontend/src/features/explore/SavedViews.tsx
// (CORRIGIDO: Com classes 'dark:' para o input e a lista)

import { listViews, removeView, saveView } from "@/lib/storage";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import type { SavedView, Filters } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Toast from "@/components/ui/Toast";

export default function SavedViews({
  currentFilters,
  onLoadView,
}: {
  currentFilters: Filters;
  onLoadView: (payload: Filters) => void;
}) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    refresh();
  }, []);
  
  const refresh = () => setViews(listViews());
  
  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    saveView(name, currentFilters);
    setName("");
    showToast("Visão salva!");
    refresh();
  };

  const handleLoad = (v: SavedView) => {
    onLoadView(v.payload);
    showToast(`Carregado: ${v.name}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que quer remover esta visão?")) {
      removeView(id);
      showToast("Visão removida.");
      refresh();
    }
  };

  return (
    <Card>
      <CardHeader title="Visões Salvas" subtitle="Salve e carregue suas análises" />
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* --- ATUALIZADO AQUI --- */}
          <input
            className="border rounded-lg px-3 py-2 text-sm bg-white w-full
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome da visão (ex: Faturamento por Produto - 7d)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={handleSave} className="whitespace-nowrap">
            Salvar Visão Atual
          </Button>
        </div>

        {views.length === 0 ? (
          <p className="text-sm text-center py-4 text-gray-500 dark:text-gray-400">
            Nenhuma visão salva ainda.
          </p>
        ) : (
          // --- ATUALIZADO AQUI ---
          <ul className="divide-y border rounded-xl bg-white
                         dark:bg-gray-700/50 dark:border-gray-700 dark:divide-gray-700">
            {views.map((v) => (
              <li
                key={v.id}
                className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div>
                  {/* --- ATUALIZADO AQUI --- */}
                  <div className="text-sm font-medium dark:text-white">{v.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Salvo em: {new Date(v.createdAt).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" onClick={() => handleLoad(v)}>
                    Carregar
                  </Button>
                  <Button variant="ghost" onClick={() => handleDelete(v.id)}>
                    Remover
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {toast && <Toast text={toast} />}
    </Card>
  );
}