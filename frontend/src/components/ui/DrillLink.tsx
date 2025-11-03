// frontend/src/components/ui/DrillLink.tsx
// (CORRIGIDO: para aceitar 'group_by' como um param e corrigir o NaN)

import { useFilters } from "@/features/filters/FiltersContext";
import { useNavigate } from "react-router-dom";
import type { Filters } from "@/lib/types";

// Define os parâmetros que o DrillLink pode filtrar
type DrillParam = "store" | "channel" | "product" | "group_by";

export default function DrillLink({
  label,
  param,
  value,
  className,
}: {
  label: string;
  param: DrillParam;
  value: string | number;
  className?: string;
}) {
  const { filters, setFilters } = useFilters(); 
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    
    const newFilters: Partial<Filters> = {
      ...filters, 
      
      storeId: null,
      channelId: null,
      store: null,
      channel: null,
      product: null,
      
      metric: "revenue",
    };
    
    if (param === "group_by") {
      newFilters.group_by = String(value);
    } else {
      // @ts-ignore
      newFilters[param] = String(value); // Filtra por 'store', 'channel' ou 'product'
      newFilters.group_by = param === "product" ? "hour" : "product";
    }

    setFilters(newFilters);
    navigate("/explore");
  };

  return (
    <a
      href="/explore"
      onClick={handleClick}
      className={className ?? "text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"}
      title={`Explorar ${label}`}
    >
      {label}
    </a>
  );
}