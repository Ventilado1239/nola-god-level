// frontend/src/components/layout/AppShell.tsx
// (CORRIGIDO: Agora importa e renderiza o ThemeToggle)

import { Outlet, NavLink } from "react-router-dom";
// (Vou presumir que você tem um OnboardingTour, se não tiver, pode apagar essa linha)
import OnboardingTour from "@/components/ui/OnboardingTour"; 
import { ThemeToggle } from "@/components/ui/ThemeToggle"; // <-- 1. IMPORTE AQUI

export default function AppShell() {
  return (
    // --- 2. ADICIONE AS CLASSES DARK AQUI ---
    <div className="min-h-screen bg-gray-50 text-[#111827] dark:bg-gray-900 dark:text-gray-200">
      <header className="bg-white border-b sticky top-0 z-10 dark:bg-gray-950 dark:border-gray-800">
        <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
          <div className="font-semibold">Nola Analytics</div>
          <NavLink
            aria-label="Ir para Dashboard"
            to="/dashboard"
            // --- 3. ADICIONE AS CLASSES DARK AQUI ---
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            aria-label="Ir para Explorar"
            to="/explore"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
            }
          >
            Explorar
          </NavLink>

          {/* --- 4. ADICIONE O BOTÃO NO FINAL --- */}
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>

      {/* (Se você não tiver esse componente, pode apagar) */}
      <OnboardingTour />
    </div>
  );
}