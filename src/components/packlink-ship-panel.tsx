"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  customerTrackingCodes,
  defaultParcel,
  formatEuro,
  type PacklinkOrderState,
  type PacklinkQuote,
} from "@/lib/packlink";

type Props = {
  orderId: string;
  toZip: string;
  toCity: string;
  configured: boolean;
  initial: PacklinkOrderState | null;
};

export function PacklinkShipPanel({ orderId, toZip, toCity, configured, initial }: Props) {
  const router = useRouter();
  const [weightKg, setWeightKg] = useState(String(initial?.parcel.weightKg ?? defaultParcel.weightKg));
  const [lengthCm, setLengthCm] = useState(String(initial?.parcel.lengthCm ?? defaultParcel.lengthCm));
  const [widthCm, setWidthCm] = useState(String(initial?.parcel.widthCm ?? defaultParcel.widthCm));
  const [heightCm, setHeightCm] = useState(String(initial?.parcel.heightCm ?? defaultParcel.heightCm));
  const [quotes, setQuotes] = useState<PacklinkQuote[]>([]);
  const [liveQuotes, setLiveQuotes] = useState(configured);
  const [serviceId, setServiceId] = useState(initial?.serviceId ?? "");
  const [collectionDate, setCollectionDate] = useState(initial?.collectionDate ?? "");
  const [busy, setBusy] = useState<"quotes" | "ship" | "track" | null>(null);
  const [error, setError] = useState("");
  const [state, setState] = useState(initial);
  const [events, setEvents] = useState<string[]>([]);

  const selected = useMemo(
    () => quotes.find((quote) => quote.id === serviceId) ?? null,
    [quotes, serviceId],
  );

  async function loadQuotes() {
    setBusy("quotes");
    setError("");
    try {
      const res = await fetch("/api/admin/packlink/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          weightKg: Number(weightKg),
          lengthCm: Number(lengthCm),
          widthCm: Number(widthCm),
          heightCm: Number(heightCm),
        }),
      });
      const data = (await res.json()) as { error?: string; quotes?: PacklinkQuote[]; live?: boolean };
      if (!res.ok) throw new Error(data.error || "Preventivi non disponibili.");
      setQuotes(data.quotes ?? []);
      setLiveQuotes(Boolean(data.live));
      const first = data.quotes?.[0];
      if (first) {
        setServiceId(first.id);
        setCollectionDate(first.availableDates[0]?.date ?? "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preventivi non disponibili.");
    } finally {
      setBusy(null);
    }
  }

  async function createShipment() {
    setBusy("ship");
    setError("");
    try {
      const res = await fetch("/api/admin/packlink/ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          serviceId,
          collectionDate,
          collectionTime: selected?.availableDates.find((row) => row.date === collectionDate)?.window,
          weightKg: Number(weightKg),
          lengthCm: Number(lengthCm),
          widthCm: Number(widthCm),
          heightCm: Number(heightCm),
        }),
      });
      const data = (await res.json()) as { error?: string; state?: PacklinkOrderState };
      if (!res.ok) throw new Error(data.error || "Spedizione non creata.");
      setState(data.state ?? null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Spedizione non creata.");
    } finally {
      setBusy(null);
    }
  }

  async function refreshTracking() {
    setBusy("track");
    setError("");
    try {
      const res = await fetch(`/api/admin/packlink/track?orderId=${orderId}`);
      const data = (await res.json()) as {
        error?: string;
        state?: PacklinkOrderState;
        events?: unknown[];
      };
      if (!res.ok) throw new Error(data.error || "Tracking non disponibile.");
      if (data.state) setState(data.state);
      setEvents(
        (data.events ?? [])
          .map((event) => {
            if (typeof event === "string") return event;
            if (event && typeof event === "object") {
              const rec = event as Record<string, unknown>;
              return String(rec.description ?? rec.status ?? rec.message ?? "");
            }
            return "";
          })
          .filter(Boolean),
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tracking non disponibile.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-12 rounded-3xl border border-ink-line bg-ink/40 p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-halo">Packlink PRO</p>
      <h3 className="mt-2 font-display text-3xl">Spedisci questo ordine</h3>
      <p className="mt-2 text-sm text-ivory-dim">
        Il cliente ha già pagato il forfait Halo. Qui scegli il corriere, stampi l’etichetta e
        poi, insieme agli altri pacchi, richiedi il ritiro da{" "}
        <a href="/admin/spedizioni" className="text-halo-bright underline-offset-4 hover:underline">
          Spedizioni
        </a>
        . Destinazione: {toZip} {toCity}.
      </p>
      <p className="mt-2 text-xs text-ivory-dim">
        {configured
          ? "Chiave API presente: i prezzi e le etichette arrivano da Packlink."
          : "Modalità prova: prezzi e etichette sono realistici ma finti. Incolla PACKLINK_API_KEY in .env.local (e su Vercel) e riavvia."}
      </p>

      {state?.reference ? (
        <div className="mt-6 grid gap-3 text-sm">
          <p>
            <span className="text-ivory-dim">Riferimento Packlink</span>
            <br />
            <span className="font-display text-2xl text-halo-bright">{state.reference}</span>
          </p>
          <p className="text-ivory-dim">
            {state.carrierName} · {state.serviceName} · costo tuo {formatEuro(state.priceEuro)}
            {state.dropoff ? " · da portare al punto" : " · ritiro in negozio"}
            <br />
            Data ritiro {state.collectionDate} {state.collectionTime}
          </p>
          {customerTrackingCodes(state.trackingCodes, state.reference).length ? (
            <p>Tracking cliente: {customerTrackingCodes(state.trackingCodes, state.reference).join(", ")}</p>
          ) : (
            <p className="text-ivory-dim">
              Il codice sull’etichetta è il riferimento Packlink, non il tracking da mandare al
              cliente. Quello di solito arriva dopo che il corriere scansiona il pacco.
            </p>
          )}
          {state.pickupRequestedAt ? (
            <p className="text-halo-bright">Ritiro corriere già richiesto.</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={`/api/admin/packlink/label?orderId=${orderId}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-ivory px-4 py-2 text-sm font-medium text-ink"
            >
              Apri etichetta
            </a>
            <button
              type="button"
              onClick={() => void refreshTracking()}
              disabled={busy !== null}
              className="rounded-full border border-ink-line px-4 py-2 text-sm"
            >
              {busy === "track" ? "Controllo…" : "Aggiorna tracking"}
            </button>
          </div>
          {events.length ? (
            <ul className="mt-2 list-disc pl-5 text-ivory-dim">
              {events.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="text-xs text-ivory-dim">
              Peso kg
              <input
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink-line bg-ink/60 px-3 py-2 text-sm text-ivory"
              />
            </label>
            <label className="text-xs text-ivory-dim">
              Lunghezza cm
              <input
                value={lengthCm}
                onChange={(e) => setLengthCm(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink-line bg-ink/60 px-3 py-2 text-sm text-ivory"
              />
            </label>
            <label className="text-xs text-ivory-dim">
              Larghezza cm
              <input
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink-line bg-ink/60 px-3 py-2 text-sm text-ivory"
              />
            </label>
            <label className="text-xs text-ivory-dim">
              Altezza cm
              <input
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink-line bg-ink/60 px-3 py-2 text-sm text-ivory"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => void loadQuotes()}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-full bg-ivory py-3 text-sm font-medium text-ink disabled:opacity-70"
          >
            {busy === "quotes" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Vedi corrieri e prezzi
          </button>
          {quotes.length ? (
            <fieldset className="grid gap-2">
              <legend className="text-sm text-ivory-dim">
                {liveQuotes ? "Prezzi Packlink" : "Prezzi di prova"}
              </legend>
              {quotes.map((quote) => (
                <label
                  key={quote.id}
                  className={`flex cursor-pointer items-start justify-between gap-3 rounded-2xl border px-4 py-3 ${
                    serviceId === quote.id ? "border-halo bg-halo/10" : "border-ink-line"
                  }`}
                >
                  <span>
                    <input
                      type="radio"
                      name="packlink-service"
                      className="mr-2"
                      checked={serviceId === quote.id}
                      onChange={() => {
                        setServiceId(quote.id);
                        setCollectionDate(quote.availableDates[0]?.date ?? "");
                      }}
                    />
                    <span className="font-medium text-ivory">{quote.carrierName}</span>
                    <span className="text-ivory-dim"> · {quote.name}</span>
                    <br />
                    <span className="text-xs text-ivory-dim">
                      {quote.dropoff ? "Porta al punto" : "Ritiro in negozio"}
                      {quote.transit ? ` · ${quote.transit}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-halo-bright">{formatEuro(quote.priceEuro)}</span>
                </label>
              ))}
              {selected?.availableDates.length ? (
                <label className="text-sm text-ivory-dim">
                  Data ritiro
                  <select
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory"
                  >
                    {selected.availableDates.map((row) => (
                      <option key={row.date} value={row.date}>
                        {row.date} · {row.window}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button
                type="button"
                onClick={() => void createShipment()}
                disabled={busy !== null || !serviceId}
                className="flex items-center justify-center gap-2 rounded-full border border-halo py-3 text-sm text-halo-bright disabled:opacity-70"
              >
                {busy === "ship" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Crea spedizione e etichetta
              </button>
            </fieldset>
          ) : null}
        </div>
      )}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
    </section>
  );
}
