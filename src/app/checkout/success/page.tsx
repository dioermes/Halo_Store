"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/reservation-provider";

function SuccessBody() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear } = useCart();
  const [status, setStatus] = useState<"wait" | "ok" | "fail">("wait");

  useEffect(() => {
    if (!sessionId) {
      setStatus("fail");
      return;
    }
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const response = await fetch(`/api/orders/session/${sessionId}`);
        const payload = (await response.json()) as { status?: string };
        if (cancelled) return;
        if (payload.status && payload.status !== "pending_payment") {
          setStatus("ok");
          clear();
          return;
        }
      } catch {
        // retry
      }
      if (attempts >= 15) {
        setStatus("fail");
        return;
      }
      window.setTimeout(poll, 2000);
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clear]);

  return (
    <section className="mx-auto max-w-xl px-5 py-28 text-center">
      {status === "wait" && (
        <>
          <p className="text-xs uppercase tracking-[0.34em] text-halo">Pagamento</p>
          <h1 className="mt-4 font-display text-5xl">Stiamo confermando l&apos;ordine.</h1>
          <p className="mt-4 text-ivory-dim">
            Aspettiamo la conferma da Stripe. Chiudere il browser non annulla il pagamento.
          </p>
        </>
      )}
      {status === "ok" && (
        <>
          <p className="text-xs uppercase tracking-[0.34em] text-halo">Grazie</p>
          <h1 className="mt-4 font-display text-5xl">È arrivato.</h1>
          <p className="mt-4 text-ivory-dim">Ti abbiamo mandato la conferma via email.</p>
          <Link
            href="/account"
            className="mt-8 inline-block rounded-full bg-ivory px-7 py-4 text-sm font-medium text-ink"
          >
            Vedi i tuoi ordini
          </Link>
        </>
      )}
      {status === "fail" && (
        <>
          <h1 className="font-display text-5xl">Non abbiamo ancora l&apos;ordine.</h1>
          <p className="mt-4 text-ivory-dim">
            Se hai pagato, controlla l&apos;account o la mail. Se il pagamento è scaduto,
            le scorte sono di nuovo libere.
          </p>
          <Link href="/account" className="mt-8 inline-block text-halo-bright underline underline-offset-4">
            Vai all&apos;account
          </Link>
        </>
      )}
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="px-5 py-28 text-center text-ivory-dim">Conferma in corso…</section>
      }
    >
      <SuccessBody />
    </Suspense>
  );
}
