// frontend/src/app/providers.tsx
// (CORRIGIDO para sua estrutura de arquivos)

import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router"; // Presume que seu router.tsx exporta 'router'
import { FiltersProvider } from "@/features/filters/FiltersContext";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

// Cria o client (o "cérebro" do cache)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de cache
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Este componente unifica todos os Providers da aplicação.
 */
export default function Providers() {
  return (
    // 1. Tema (Mais externo)
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* 2. Airbag (Pega erros) */}
      <ErrorBoundary>
        {/* 3. Cache de Dados */}
        <QueryClientProvider client={queryClient}>
          {/* 4. Filtros Globais */}
          <FiltersProvider>
            {/* 5. Rotas */}
            <RouterProvider router={router} />
          </FiltersProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}