import { useEffect, useState } from "react";
import Button from "./Button";

const steps = [
  {
    title: "Filtre rápido",
    text: "Escolha o período, loja e canal. Clique em Aplicar.",
  },
  {
    title: "Compare períodos",
    text: "Na aba Explorar, ative 'Comparar' para ver duas séries lado a lado.",
  },
  {
    title: "Exporte e compartilhe",
    text: "Baixe CSV/XLSX para enviar ao time ou levar para a reunião.",
  }
];

export default function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("tour_seen_v1");
    if (!seen) setOpen(true);
  }, []);

  function next() {
    if (idx < steps.length - 1) setIdx((i) => i + 1);
    else {
      localStorage.setItem("tour_seen_v1", "1");
      setOpen(false);
    }
  }

  function skip() {
    localStorage.setItem("tour_seen_v1", "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tour de onboarding"
    >
      <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-lg">
        <div className="text-sm text-muted">Passo {idx + 1} de {steps.length}</div>
        <h3 className="text-lg font-semibold mt-1">{steps[idx].title}</h3>
        <p className="mt-2 text-sm">{steps[idx].text}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={skip} aria-label="Pular tour">Pular</Button>
          <Button onClick={next} aria-label="Próximo passo">{idx === steps.length - 1 ? "Concluir" : "Próximo"}</Button>
        </div>
      </div>
    </div>
  );
}
