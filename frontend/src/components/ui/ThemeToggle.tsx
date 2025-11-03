// frontend/src/components/ui/ThemeToggle.tsx
// (CORRIGIDO: Removida a propriedade 'size="icon"')

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Button from "./Button"; // (Presume que seu Button está em /ui/Button)

// Ícones SVG simples para Sol e Lua
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);


export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: '44px', height: '44px' }} />;
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      // size="icon" // <-- ERRO REMOVIDO DAQUI
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      // Adiciona padding para simular o 'size="icon"'
      className="p-2" 
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};