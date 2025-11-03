// frontend/src/lib/storage.ts
// (NOVO / CORRIGIDO)

import type { Filters, SavedView } from "./types";

const STORAGE_KEY = "nola_saved_views";

// Helper para ler o array de views salvas
function getViews(): SavedView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const views = JSON.parse(raw) as SavedView[];
    // Garante que é um array
    return Array.isArray(views) ? views : [];
  } catch (e) {
    return [];
  }
}

// Helper para salvar o array de views
function setViews(views: SavedView[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
}

/**
 * Lista todas as views salvas, ordenadas pela mais recente.
 */
export function listViews(): SavedView[] {
  const views = getViews();
  return views.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Salva uma nova visão.
 * @param name O nome dado pelo usuário para a visão
 * @param payload O estado atual dos filtros (Filters)
 */
export function saveView(name: string, payload: Filters): void {
  const views = getViews();
  
  const newView: SavedView = {
    id: `view_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: name.trim() || `Visão de ${new Date().toLocaleDateString()}`,
    payload: payload,
    createdAt: Date.now(),
  };

  setViews([newView, ...views]);
}

/**
 * Remove uma visão pelo seu ID.
 * @param id O ID da visão a ser removida
 */
export function removeView(id: string): void {
  let views = getViews();
  views = views.filter((v) => v.id !== id);
  setViews(views);
}