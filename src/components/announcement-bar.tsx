const messages = [
  "Spedizione gratuita sopra i 100€",
  "Assistenza su WhatsApp",
  "Spedizione veloce in 24/48h",
  "Reso entro 14g",
];

function Group({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {messages.map((message) => (
        <li key={message} className="flex items-center whitespace-nowrap">
          <span className="px-6 sm:px-10">{message}</span>
          <span aria-hidden className="text-[0.7rem]">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Informazioni sul negozio"
      className="relative z-[101] flex h-9 items-center overflow-hidden bg-black text-[0.7rem] font-medium uppercase tracking-[0.16em] text-white sm:text-xs"
    >
      <div className="animate-marquee flex w-max" style={{ animationDuration: "40s" }}>
        <div className="flex">
          <Group />
          <Group hidden />
        </div>
        <div className="flex" aria-hidden>
          <Group hidden />
          <Group hidden />
        </div>
      </div>
    </div>
  );
}
