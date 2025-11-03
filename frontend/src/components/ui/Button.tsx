// frontend/src/components/ui/Button.tsx
// (CORRIGIDO: String de classes unificada em uma linha)

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export default function Button({
  variant = "primary",
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        {
          // Estilo 'primary' (padrão)
          "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50":
            variant === "primary",
          // Estilo 'ghost' (Limpar)
          "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700":
            variant === "ghost",
          // --- CORREÇÃO AQUI: A string agora está em uma linha só ---
          "bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-600":
            variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}