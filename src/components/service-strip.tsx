import { Headset, ShieldCheck, Timer, Truck } from "lucide-react";

const items = [
  {
    icon: Timer,
    title: "Spedizione veloce",
    text: "In 24/48h lavorative, escluse domeniche e festivi",
  },
  {
    icon: Headset,
    title: "Assistenza clienti",
    text: "Attiva dal lunedì al venerdì dalle 10:00 alle 17:00, sabato dalle 10:00 alle 13:00",
  },
  {
    icon: Truck,
    title: "Spedizione in Italia",
    text: "",
  },
  {
    icon: ShieldCheck,
    title: "Pagamenti sicuri",
    text: "Le tue informazioni di pagamento sono processate in modo sicuro e criptato.",
  },
];

export function ServiceStrip() {
  return (
    <section className="border-t border-ink-line bg-white" aria-label="I nostri servizi">
      <ul className="mx-auto grid max-w-384 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex flex-col items-center gap-5 border-b border-ink-line px-8 py-12 text-center sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0 lg:odd:border-r"
          >
            <Icon className="h-6 w-6 text-ivory" strokeWidth={1.25} aria-hidden />
            <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-ivory">{title}</h3>
            {text ? (
              <p className="max-w-[16rem] text-[11px] uppercase leading-relaxed tracking-widest text-ivory-dim">
                {text}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
