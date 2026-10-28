"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/products";

type RedemptionResult = {
  code: string;
  amountCents: number;
  balanceCents: number;
};

export function AdminGiftCardRedemption() {
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RedemptionResult | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setResult(null);

    const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, "");
    const normalizedAmount = amount.trim().replace(",", ".");
    const parsedAmount = Number(normalizedAmount);
    if (!normalizedCode || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Inserisci il codice e un importo maggiore di zero.");
      return;
    }

    if (
      !window.confirm(
        `Confermi l'addebito di ${formatPrice(parsedAmount)} alla gift card ${normalizedCode}?`,
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/admin/gift-card/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalizedCode, amount: normalizedAmount }),
      });
      const payload = (await response.json()) as
        | RedemptionResult
        | { error?: string };
      if (!response.ok) {
        setError("error" in payload && payload.error ? payload.error : "Addebito non riuscito.");
        return;
      }
      if (!("amountCents" in payload) || !("balanceCents" in payload)) {
        setError("Risposta non valida: controlla il saldo prima di procedere.");
        return;
      }
      setResult(payload);
      setAmount("");
    } catch (caught) {
      console.error("[admin gift card redemption]", caught);
      setError("Errore di connessione. Verifica il saldo e riprova.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-3xl">Riscatta codici</h2>
      <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
        Inserisci il codice della gift card e l’importo utilizzato in negozio. Il saldo
        viene aggiornato subito; l’addebito non è annullabile da questa schermata.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-5">
        <label className="text-sm text-ivory-dim">
          Codice gift card
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="HALO-XXXX-XXXX-XXXX-XXXX-XXXX"
            className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 uppercase text-ivory outline-none focus:border-halo/60"
            required
          />
        </label>

        <label className="text-sm text-ivory-dim">
          Importo da addebitare (€)
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            max="100000"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
            className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory outline-none focus:border-halo/60"
            required
          />
        </label>

        {error ? (
          <p role="alert" className="rounded-xl border border-red-400/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {result ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-4 text-sm"
          >
            <p className="font-medium text-emerald-200">
              Addebito di {formatPrice(result.amountCents / 100)} completato.
            </p>
            <p className="mt-1 text-ivory-dim">
              Saldo residuo della carta:{" "}
              <span className="text-ivory">{formatPrice(result.balanceCents / 100)}</span>
            </p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-ivory px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-halo-bright disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Aggiornamento saldo…" : "Addebita gift card"}
        </button>
      </form>
    </div>
  );
}
