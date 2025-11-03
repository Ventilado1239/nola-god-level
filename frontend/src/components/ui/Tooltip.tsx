// frontend/src/components/ui/Tooltip.tsx
// (ARQUIVO NOVO)

import React from "react";

/**
 * Componente de Tooltip simples que aparece no hover.
 * Envolve o elemento "children" e mostra o "text" acima dele.
 */
export default function Tooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    // 'relative' e 'group' são as chaves para o CSS do tooltip
    <div className="relative inline-flex group">
      {/* 1. O item que dispara o tooltip */}
      {children}
      
      {/* 2. O conteúdo do tooltip (invisível por padrão) */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3
        bg-gray-900 text-white text-xs rounded-lg shadow-lg 
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10
        pointer-events-none">
        
        {/* O texto da dica */}
        {text}
        
        {/* 3. Seta (opcional, mas dá um polimento) */}
        <div className="absolute top-full left-1/2 -translate-x-1/2
          w-0 h-0
          border-l-8 border-l-transparent
          border-r-8 border-r-transparent
          border-t-8 border-t-gray-900">
        </div>
      </div>
    </div>
  );
}