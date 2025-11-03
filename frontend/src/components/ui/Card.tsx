// frontend/src/components/ui/Card.tsx
import clsx from "clsx";

/**
 * Cartão base
 */
export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    // --- ADICIONADO: dark:bg-gray-800 dark:border-gray-700 ---
    <div
      className={clsx(
        "border rounded-xl bg-white shadow-sm",
        "dark:bg-gray-800 dark:border-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Cabeçalho do cartão
 */
export function CardHeader({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    // --- ADICIONADO: dark:border-gray-700 e dark:text-white ---
    <div className="p-4 border-b dark:border-gray-700">
      <h3 className="font-semibold text-lg dark:text-white">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
    </div>
  );
}

/**
 * Conteúdo do cartão
 */
export function CardContent({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={clsx("p-4", className)}>{children}</div>;
}