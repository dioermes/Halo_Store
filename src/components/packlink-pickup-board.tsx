"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { formatEuro, pickupGroupKey, type PacklinkOrderState, type PacklinkQuote } from "@/lib/packlink";
import { defaultParcel } from "@/lib/packlink";

export type PickupRow = {
  id: string;
  email: string;
  name: string;
  city: string;
  status: string;
  state: PacklinkOrderState;
};

export function PacklinkPickupBoard({
  configured,
  rows,
}: {
  configured: boolean;
  rows: PickupRow[];
}) {
  const router = useRouter();
  const ready = rows.filter((row) => row.state.reference && !row.state.pickupRequestedAt && !row.state.dropoff);
  const dropoff = rows.filter((row) => row.state.reference && row.state.dropoff && !row.state.pickupRequestedAt);
  const done = rows.filter((row) => row.state.pickupRequestedAt);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, PickupRow[]>();
    for (const row of ready) {
      const key = pickupGroupKey(row.state);
      map.set(key, [...(map.get(key) ?? []), row]);
    }
    return [...map.entries()];
  }, [ready]);

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function requestPickup() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/packlink/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selected }),
      });
      const data = (await res.json()) as { error?: string; note?: string; count?: number; carrierName?: string };
      if (!res.ok) throw new Error(data.error || "Ritiro non richiesto.");
      setMessage(
        `Ritiro ${data.carrierName ?? ""} per ${data.count ?? selected.length} pacchi. ${data.note ?? ""}`.trim(),
      );
      setSelected([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ritiro non richiesto.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid max-w-3xl gap-10">
      <div>
        <h2 className="font-display text-3xl">Richiedi corriere</h2>
        <p className="mt-3 text-sm text-ivory-dim">
          Il corriere l’hai già scelto sull’ordine, quando hai creato l’etichetta. Qui non si
          sceglie di nuovo: spunti i pacchi già etichettati dello stesso corriere e chiedi un solo
          ritiro. GLS e BRT restano due passaggi. I servizi «porta al punto» non vanno in questa
          lista.
        </p>
        <p className="mt-2 text-xs text-ivory-dim">
          {configured
            ? "Packlink live attivo."
            : "Modalità prova: il ritiro viene solo segnato in Halo. Con la chiave API i pacchi saranno anche nel tuo Packlink PRO."}
        </p>
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm text-ivory-dim">
          Non ci sono pacchi pronti per il furgone. Apri un ordine con spedizione, crea l’etichetta,
          poi torna qui.
        </p>
      ) : (
        grouped.map(([key, group]) => (
          <section key={key}>
            <h3 className="font-display text-2xl">{group[0].state.carrierName}</h3>
            <ul className="mt-3 divide-y divide-ink-line border-y border-ink-line">
              {group.map((row) => (
                <li key={row.id} className="flex items-start gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={() => toggle(row.id)}
                    className="mt-2"
                  />
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/ordini/${row.id}`} className="font-display text-xl text-halo-bright">
                      #{row.id.slice(0, 8)} · {row.name || row.email}
                    </Link>
                    <p className="text-sm text-ivory-dim">
                      {row.city} · {row.state.serviceName} · {formatEuro(row.state.priceEuro)} ·{" "}
                      {row.state.reference}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <button
        type="button"
        disabled={busy || selected.length === 0}
        onClick={() => void requestPickup()}
        className="flex items-center justify-center gap-2 rounded-full bg-ivory py-3 text-sm font-medium text-ink disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Richiedi corriere per {selected.length || "…"} pacchi
      </button>
      {message ? <p className="text-sm text-halo-bright">{message}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {dropoff.length ? (
        <section>
          <h3 className="font-display text-2xl">Da portare al punto</h3>
          <ul className="mt-3 text-sm text-ivory-dim">
            {dropoff.map((row) => (
              <li key={row.id}>
                <Link href={`/admin/ordini/${row.id}`} className="text-halo-bright">
                  #{row.id.slice(0, 8)}
                </Link>{" "}
                · {row.state.carrierName} · stampa l’etichetta e consegna tu il pacco
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {done.length ? (
        <section>
          <h3 className="font-display text-2xl">Ritiro già chiesto</h3>
          <ul className="mt-3 text-sm text-ivory-dim">
            {done.map((row) => (
              <li key={row.id}>
                #{row.id.slice(0, 8)} · {row.state.carrierName} · {row.state.trackingCodes.filter((code) => !code.startsWith("DEMO-"))[0] || "tracking in arrivo"}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function PacklinkQuoteLab({ configured }: { configured: boolean }) {
  const [toZip, setToZip] = useState("20121");
  const [weightKg, setWeightKg] = useState(String(defaultParcel.weightKg));
  const [lengthCm, setLengthCm] = useState(String(defaultParcel.lengthCm));
  const [widthCm, setWidthCm] = useState(String(defaultParcel.widthCm));
  const [heightCm, setHeightCm] = useState(String(defaultParcel.heightCm));
  const [quotes, setQuotes] = useState<PacklinkQuote[]>([]);
  const [live, setLive] = useState(configured);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadQuotes() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/packlink/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toZip,
          toCountry: "IT",
          weightKg: Number(weightKg),
          lengthCm: Number(lengthCm),
          widthCm: Number(widthCm),
          heightCm: Number(heightCm),
        }),
      });
      const data = (await res.json()) as { error?: string; quotes?: PacklinkQuote[]; live?: boolean };
      if (!res.ok) throw new Error(data.error || "Preventivi non disponibili.");
      setQuotes(data.quotes ?? []);
      setLive(Boolean(data.live));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preventivi non disponibili.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="rounded-3xl border border-ink-line/70 bg-ink/20 p-5">
      <summary className="cursor-pointer font-display text-xl text-ivory-dim">
        Calcolatore opzionale (non è una spedizione)
      </summary>
      <p className="mt-3 text-sm text-ivory-dim">
        Serve solo a farsi un’idea dei prezzi verso un CAP, senza toccare gli ordini. Il corriere
        vero si sceglie una volta sola, sull’ordine, quando crei l’etichetta.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <label className="text-xs text-ivory-dim">
          CAP destinazione
          <input
            value={toZip}
            onChange={(e) => setToZip(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-line bg-ink/60 px-3 py-2 text-sm text-ivory"
          />
        </label>
        <label className="text-xs text-ivory-dim">
          Peso kg
          <input
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-line bg-ink/60 px-3 py-2 text-sm text-ivory"
          />
        </label>
        <label className="text-xs text-ivory-dim">
          L × l × h
          <span className="mt-1 flex gap-1">
            <input
              value={lengthCm}
              onChange={(e) => setLengthCm(e.target.value)}
              className="w-full rounded-xl border border-ink-line bg-ink/60 px-2 py-2 text-sm text-ivory"
            />
            <input
              value={widthCm}
              onChange={(e) => setWidthCm(e.target.value)}
              className="w-full rounded-xl border border-ink-line bg-ink/60 px-2 py-2 text-sm text-ivory"
            />
            <input
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full rounded-xl border border-ink-line bg-ink/60 px-2 py-2 text-sm text-ivory"
            />
          </span>
        </label>
      </div>
      <button
        type="button"
        onClick={() => void loadQuotes()}
        disabled={busy}
        className="mt-4 rounded-full bg-ivory px-5 py-2 text-sm font-medium text-ink disabled:opacity-70"
      >
        {busy ? "Calcolo…" : "Mostra corrieri"}
      </button>
      {quotes.length ? (
        <ul className="mt-4 divide-y divide-ink-line border-y border-ink-line text-sm">
          {quotes.map((quote) => (
            <li key={quote.id} className="flex justify-between gap-3 py-3">
              <span>
                {quote.carrierName} · {quote.name}
                <br />
                <span className="text-ivory-dim">
                  {quote.dropoff ? "Punto di consegna" : "Ritiro in negozio"}
                  {live ? "" : " · prova"}
                </span>
              </span>
              <span className="text-halo-bright">{formatEuro(quote.priceEuro)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </details>
  );
}
