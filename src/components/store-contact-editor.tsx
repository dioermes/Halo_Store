import { saveStoreContactAction } from "@/app/admin/actions";
import { SLOTS_PER_DAY, type StoreContact } from "@/lib/store-contact";

const fieldClass =
  "mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory outline-none";
const timeClass =
  "w-full rounded-xl border border-ink-line bg-ink/60 px-3 py-2 text-sm text-ivory outline-none";

export function StoreContactEditor({ contact }: { contact: StoreContact }) {
  return (
    <form action={saveStoreContactAction} className="grid max-w-2xl gap-6">
      <div>
        <h2 className="font-display text-3xl">Telefono, WhatsApp e orari</h2>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
          Si aggiornano sul sito, nelle mail, e nella scelta dell&apos;orario di
          ritiro. Per ogni giorno puoi inserire fino a due fasce (mattina e pomeriggio).
        </p>
      </div>

      <label className="text-sm text-ivory-dim">
        Numero di telefono
        <input
          name="phone"
          type="tel"
          defaultValue={contact.phone.display}
          maxLength={30}
          required
          className={fieldClass}
        />
      </label>

      <label className="text-sm text-ivory-dim">
        Numero WhatsApp
        <input
          name="whatsapp"
          type="tel"
          defaultValue={contact.whatsapp.display}
          maxLength={30}
          required
          className={fieldClass}
        />
        <span className="mt-1 block text-xs">
          Usato dal pulsante WhatsApp del sito, dal contatto per i resi e dalle notifiche degli
          ordini. Può essere diverso dal telefono del negozio.
        </span>
      </label>

      <fieldset className="grid gap-3 rounded-2xl border border-ink-line bg-ink/40 p-5">
        <legend className="px-1 font-display text-2xl">Orari di apertura</legend>
        {contact.hours.map((day) => (
          <div key={day.day} className="grid gap-2 border-b border-ink-line/60 pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{day.label}</span>
              <label className="flex items-center gap-2 text-sm text-ivory-dim">
                <input type="checkbox" name={`closed_${day.day}`} defaultChecked={day.slots.length === 0} />
                Chiuso
              </label>
            </div>
            {Array.from({ length: SLOTS_PER_DAY }, (_, index) => (
              <div key={index} className="grid grid-cols-2 gap-3">
                <label className="text-xs text-ivory-dim">
                  {index === 0 ? "Apre" : "Riapre"}
                  <input
                    type="time"
                    name={`open_${day.day}_${index}`}
                    defaultValue={day.slots[index]?.open ?? ""}
                    className={timeClass}
                  />
                </label>
                <label className="text-xs text-ivory-dim">
                  Chiude
                  <input
                    type="time"
                    name={`close_${day.day}_${index}`}
                    defaultValue={day.slots[index]?.close ?? ""}
                    className={timeClass}
                  />
                </label>
              </div>
            ))}
          </div>
        ))}
        <p className="text-xs text-ivory-dim">
          Lascia vuota la seconda fascia se il negozio non fa orario spezzato. Con &ldquo;Chiuso&rdquo;
          selezionato gli orari del giorno vengono ignorati.
        </p>
      </fieldset>

      <button type="submit" className="rounded-full bg-ivory py-3 text-sm font-medium text-ink">
        Salva contatti e orari
      </button>
    </form>
  );
}
