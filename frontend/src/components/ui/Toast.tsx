import { useEffect, useState } from "react";

export default function Toast({ text }: { text: string }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 2200);
    return () => clearTimeout(t);
  }, []);
  if (!open) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 text-white px-4 py-2 shadow-lg">
      {text}
    </div>
  );
}
