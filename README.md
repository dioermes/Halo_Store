# Halo Store Conversano — sito vetrina

Sito vetrina per **Halo Store**, Via Castellana 18A, Conversano (BA).
Catalogo animato dei capi con prenotazione "tienimelo da parte": il cliente sceglie
i capi e le taglie, e il riepilogo parte come messaggio WhatsApp già compilato.

Nessun backend, nessun database, nessun pagamento online.

## Avvio

```bash
npm install
npm run dev
```

Il sito gira su http://localhost:3000.

Per la build di produzione:

```bash
npm run build
npm run start
```

## Deploy su Vercel

Il repo GitHub è già la root dell'app Next.js: **non** impostare Root Directory su
`Halo_Store`. Nel dashboard del progetto:

1. **Settings → General → Framework Preset** = Next.js (non Other)
2. **Root Directory** vuoto
3. **Output Directory** lasciato al default del preset (non `public`, non `out`)
4. **Settings → Deployment Protection** = off in Production, altrimenti i clienti
   del negozio vedono il login Vercel invece del catalogo
5. Redeploy (Deployments → ⋮ → Redeploy, senza build cache)

`vercel.json` nel repo forza già il framework Next.js. Dopo il push, un deploy
sano dura decine di secondi (install + `next build`), non un secondo.

## Configurazione

Copia `.env.example` in `.env.local` e inserisci il numero WhatsApp del negozio:

```
NEXT_PUBLIC_WHATSAPP_NUMBER=393401234567
```

Finché il numero manca, il pulsante apre comunque WhatsApp con il riepilogo già
scritto e lascia scegliere il destinatario. Con il numero configurato, il
messaggio va direttamente al negozio.

## Da confermare con il titolare

Questi dati sono ipotizzati o presi da Google Maps e vanno validati prima di
pubblicare. Stanno tutti in `src/lib/store-config.ts`:

- **Orari di apertura** — dedotti da Google Maps (9:30–13:00 / 17:00–20:30,
  lunedì solo pomeriggio, domenica chiuso). Sono anche mostrati in pagina come
  "orari indicativi".
- **Numero WhatsApp** — non è pubblico su Google Maps.
- **Profilo Instagram** — `@halostoreconversano`.
- **Ragione sociale** — "Halo Store di Buonsante Miriana".

## Catalogo

I 16 capi vivono in `src/lib/products.ts`: nome, sottotitolo, categoria, prezzo,
taglie, colori, tessuto, vestibilità, cura, descrizione, immagine e pezzi
disponibili. **Nomi e prezzi sono inventati** a scopo dimostrativo.

Le foto sono immagini stock scaricate in `public/catalogo/`. Per usare le foto
reali del negozio ci sono due strade:

1. Sostituire il file in `public/catalogo/` mantenendo lo stesso nome — non serve
   toccare il codice.
2. Cambiare il campo `image` del capo in `src/lib/products.ts`.

Il formato consigliato è verticale (3:4 o 4:5), lato lungo almeno 1400 px.

Per aggiungere un capo basta un nuovo oggetto nell'array `products`: filtri,
contatori e catalogo si aggiornano da soli.

## Logo

Il logo ufficiale è in `assets/logo-halo-originale.png` (marchio bordeaux su
fondo nero). Da lì `npm run logo` genera due file:

- `public/logo-halo.png` — stencil bianco con canale alpha, usato come
  `mask-image` dal componente `HaloLogo` in nav e footer. Il colore lo decide
  il CSS, quindi lo stesso file segue `currentColor` (avorio, oro al passaggio
  del mouse).
- `src/app/icon.png` — favicon del sito, marchio avorio su fondo scuro.

Lo script isola il marchio dal fondo usando il croma e non la luminosità, così
scarta l'ombra grigia del file originale e tiene le sfumature del bordeaux. Se
un domani arriva il logo vettoriale, basta sostituire i due file generati.

Nella hero il marchio non viene usato: a quella scala il PNG si sgrana, quindi
il titolo resta tipografico (Instrument Serif) con reveal lettera per lettera.

## Struttura

```
src/
  app/
    layout.tsx          font, metadata SEO, providers
    page.tsx            composizione delle sezioni
    globals.css         palette Halo, utility e animazioni
  components/
    halo-logo.tsx       marchio ufficiale come maschera colorabile
    hero.tsx            apertura con reveal tipografico e parallasse
    manifesto.tsx       racconto del negozio + marquee
    catalog.tsx         filtri e griglia
    product-card.tsx    card con tilt 3D e alone che segue il puntatore
    product-dialog.tsx  scheda capo, taglie, colori, prenotazione
    how-it-works.tsx    i tre passi della prenotazione
    reviews.tsx         valutazione 5,0 e recensione Google
    store-info.tsx      indirizzo, orari, mappa, indicazioni
    reservation-bag.tsx drawer prenotazioni + messaggio WhatsApp
    halo-cursor.tsx     alone di luce che segue il mouse
  lib/
    store-config.ts     unica fonte di verità sui dati del negozio
    products.ts         catalogo
    opening-hours.ts    "Aperto ora / Chiude alle 13:00"
    whatsapp.ts         composizione del messaggio
```

## Scelte tecniche

- **Next.js 16** (App Router) + TypeScript + **Tailwind CSS v4**
- **motion** per animazioni, scroll reveal e transizioni condivise
- Tutte le animazioni rispettano `prefers-reduced-motion`: tilt, parallasse,
  alone e marquee si disattivano, restano le dissolvenze
- Dialog e drawer con focus trap, chiusura con `Esc` e blocco dello scroll
- Dati strutturati JSON-LD `ClothingStore` con indirizzo, orari e valutazione,
  così il negozio è pronto per la ricerca locale
