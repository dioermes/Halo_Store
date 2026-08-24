export function SoldOutLabel({ className = "" }: { className?: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] shadow-[0_8px_20px_-10px_rgba(220,38,38,0.9)] ${className}`}
      style={{
        backgroundColor: "var(--sold-out-bg, #dc2626)",
        color: "var(--sold-out-fg, #ffffff)",
      }}
    >
      Esaurito
    </span>
  );
}
