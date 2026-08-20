/**
 * Unica fonte di verità per i dati del negozio.
 * I valori marcati DA CONFERMARE vanno validati con il titolare prima di pubblicare.
 */

export type DaySchedule = {
  /** 0 = domenica, 1 = lunedi, ... 6 = sabato */
  day: number;
  label: string;
  /** Fasce orarie in formato "HH:MM". Array vuoto = giorno di chiusura. */
  slots: Array<{ open: string; close: string }>;
};

const MORNING = { open: "09:30", close: "13:00" };
const AFTERNOON = { open: "17:00", close: "20:30" };

/** DA CONFERMARE: orari dedotti da Google Maps ("Chiude alle 13, riapre alle 17"). */
export const openingHours: DaySchedule[] = [
  { day: 1, label: "Lunedì", slots: [AFTERNOON] },
  { day: 2, label: "Martedì", slots: [MORNING, AFTERNOON] },
  { day: 3, label: "Mercoledì", slots: [MORNING, AFTERNOON] },
  { day: 4, label: "Giovedì", slots: [MORNING, AFTERNOON] },
  { day: 5, label: "Venerdì", slots: [MORNING, AFTERNOON] },
  { day: 6, label: "Sabato", slots: [MORNING, AFTERNOON] },
  { day: 0, label: "Domenica", slots: [] },
];

/**
 * Numero WhatsApp in formato internazionale senza "+" né spazi (es. 393401234567).
 * Non è pubblico su Google Maps: va impostato in .env.local come NEXT_PUBLIC_WHATSAPP_NUMBER.
 */
const rawWhatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(
  /[^0-9]/g,
  "",
);

export const storeConfig = {
  name: "Halo Store",
  legalName: "Halo Store di Buonsante Miriana",
  tagline: "Abbigliamento uomo e donna",
  claim: "Capi che non trovi ovunque",
  address: {
    street: "Via Castellana, 18A",
    postalCode: "70014",
    city: "Conversano",
    province: "BA",
    region: "Puglia",
    country: "IT",
  },
  phone: {
    display: "+39 331 987 5979",
    href: "tel:+393319875979",
  },
  coordinates: {
    lat: 40.9654381,
    lng: 17.1159334,
  },
  whatsapp: {
    number: rawWhatsapp,
    isConfigured: rawWhatsapp.length >= 11,
  },
  /** DA CONFERMARE con il titolare */
  instagram: {
    handle: "halostoreconversano",
    url: "https://www.instagram.com/halostoreconversano/",
  },
  maps: {
    /**
     * CID della scheda Google ufficiale "Halo Store" (Via Castellana 18A).
     * I link a testo libero possono cadere su un indirizzo generico: questi no.
     */
    cid: "16351928461352445376",
    embed:
      "https://www.google.com/maps?cid=16351928461352445376&hl=it&z=17&output=embed",
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=40.9654381,17.1159334&travelmode=driving",
    place: "https://maps.google.com/?cid=16351928461352445376",
  },
  rating: {
    value: 5,
    count: 1,
  },
  siteUrl: "https://halostore-conversano.it",
} as const;

export const fullAddress = `${storeConfig.address.street}, ${storeConfig.address.postalCode} ${storeConfig.address.city} ${storeConfig.address.province}`;
