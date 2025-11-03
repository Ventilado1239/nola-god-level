// frontend/src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Providers from "./app/providers"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { ThemeProvider } from "next-themes"; // <-- 1. IMPORTE AQUI

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* --- 2. ENVOLVA TUDO COM O THEMEPROVIDER --- */}
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Providers />
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);