import { getStoreSettings } from "@/lib/settings";
import { saveSettingsAction, sendNewsletterAction } from "@/app/admin/actions";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="grid max-w-2xl gap-16">
      <form action={saveSettingsAction} className="grid gap-4">
        <h2 className="font-display text-3xl">Spedizione e magazzino</h2>
        <label className="text-sm text-ivory-dim">
          Spedizione Italia (€)
          <input
            name="shipping"
            type="number"
            step="0.01"
            defaultValue={(settings.shippingItalyCents / 100).toFixed(2)}
            className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory"
          />
        </label>
        <label className="text-sm text-ivory-dim">
          Soglia scorte basse (pezzi per taglia e colore)
          <input
            name="lowStockAt"
            type="number"
            defaultValue={settings.lowStockAt}
            className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory"
          />
        </label>
        <label className="text-sm text-ivory-dim">
          Minuti di prenotazione scorte
          <input
            name="holdMinutes"
            type="number"
            defaultValue={settings.holdMinutes}
            className="mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory"
          />
        </label>
        <button type="submit" className="rounded-full bg-ivory py-3 text-sm font-medium text-ink">
          Salva impostazioni
        </button>
      </form>

      <form action={sendNewsletterAction} className="grid gap-4">
        <h2 className="font-display text-3xl">Newsletter</h2>
        <p className="text-sm text-ivory-dim">
          Parte solo a chi ha spuntato l&apos;opt-in esplicito. Chi non l&apos;ha fatto non viene
          toccato.
        </p>
        <input name="subject" placeholder="Oggetto" className="rounded-xl border border-ink-line bg-ink/60 px-4 py-3" />
        <textarea name="body" rows={6} placeholder="Testo" className="rounded-xl border border-ink-line bg-ink/60 px-4 py-3" />
        <button type="submit" className="rounded-full border border-ink-line py-3 text-sm">
          Invia a chi ha detto sì
        </button>
      </form>
    </div>
  );
}
