"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { orderStatusLabel, type OrderStatus } from "@/lib/orders";

export function OrderUpdatedNotice({
  status,
  mailed,
  mailFailed,
}: {
  status: OrderStatus;
  mailed: boolean;
  mailFailed: boolean;
}) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      router.replace(pathname, { scroll: false });
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [pathname, router]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex items-start gap-3 rounded-2xl border border-halo/40 bg-halo/10 px-4 py-4"
          role="status"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-halo text-ink">
            <Check className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-display text-2xl leading-none">Ordine aggiornato</p>
            <p className="mt-2 text-sm text-ivory-dim">
              Stato: {orderStatusLabel[status]}.
              {mailed
                ? " Abbiamo avvisato il cliente via email."
                : mailFailed
                  ? " Lo stato è salvato, ma la mail al cliente non è partita. Controlla l'invio email e riprova."
                  : ""}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function UpdateOrderButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-ivory py-3 text-sm font-medium text-ink transition-transform duration-300 enabled:hover:scale-[1.02] disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Sto salvando…
        </>
      ) : (
        "Aggiorna ordine"
      )}
    </button>
  );
}
