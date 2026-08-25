import { storeConfig } from "@/lib/store-config";

const PACKLINK_BASE = "https://api.packlink.com/v1/";

export type PacklinkParcel = {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export type PacklinkQuote = {
  id: string;
  name: string;
  carrierName: string;
  priceEuro: number;
  currency: string;
  transit: string;
  dropoff: boolean;
  availableDates: Array<{ date: string; window: string }>;
};

export type PacklinkShipment = {
  reference: string;
  trackingCodes: string[];
  labels: string[];
  status: string;
  carrier: string;
  service: string;
};

export type PacklinkOrderState = {
  parcel: PacklinkParcel;
  serviceId: string;
  serviceName: string;
  carrierName: string;
  priceEuro: number;
  currency: string;
  dropoff: boolean;
  collectionDate: string;
  collectionTime: string;
  reference: string;
  trackingCodes: string[];
  labels: string[];
  pickupRequestedAt: string | null;
  live: boolean;
};

export const defaultParcel: PacklinkParcel = {
  weightKg: 0.8,
  lengthCm: 30,
  widthCm: 20,
  heightCm: 10,
};

export function isPacklinkLive() {
  return Boolean(getPacklinkApiKey());
}

export function getPacklinkApiKey() {
  return (process.env.PACKLINK_API_KEY ?? "").trim();
}

export function warehouseFrom() {
  const phone = storeConfig.phone.display.replace(/\D/g, "");
  return {
    name: "Miriana",
    surname: "Buonsante",
    company: storeConfig.name,
    street1: storeConfig.address.street.replace(",", ""),
    zip_code: storeConfig.address.postalCode,
    city: storeConfig.address.city,
    country: "IT",
    phone: phone.startsWith("39") ? phone : `39${phone}`,
    email: storeConfig.support.email,
  };
}

export function nextCollectionDates(count = 6) {
  const out: Array<{ date: string; window: string }> = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  while (out.length < count) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day === 0) continue;
    out.push({
      date: cursor.toISOString().slice(0, 10),
      window: "09:00-18:00",
    });
  }
  return out;
}

function demoQuotes(parcel: PacklinkParcel): PacklinkQuote[] {
  const dates = nextCollectionDates();
  const vol = parcel.lengthCm * parcel.widthCm * parcel.heightCm;
  const bump = Math.max(0, parcel.weightKg - 1) * 1.4 + Math.max(0, vol - 6000) / 8000;
  return [
    {
      id: "demo-brt",
      name: "BRT Express",
      carrierName: "BRT",
      priceEuro: round2(6.9 + bump),
      currency: "EUR",
      transit: "1-2 giorni lavorativi",
      dropoff: false,
      availableDates: dates,
    },
    {
      id: "demo-gls",
      name: "GLS Nazionale",
      carrierName: "GLS",
      priceEuro: round2(7.4 + bump * 1.05),
      currency: "EUR",
      transit: "2-3 giorni lavorativi",
      dropoff: false,
      availableDates: dates,
    },
    {
      id: "demo-poste",
      name: "Poste Delivery Business",
      carrierName: "Poste Italiane",
      priceEuro: round2(8.2 + bump * 0.9),
      currency: "EUR",
      transit: "2-4 giorni lavorativi",
      dropoff: true,
      availableDates: dates,
    },
    {
      id: "demo-dhl",
      name: "DHL Parcel Connect",
      carrierName: "DHL",
      priceEuro: round2(12.5 + bump * 1.2),
      currency: "EUR",
      transit: "1-2 giorni lavorativi",
      dropoff: false,
      availableDates: dates,
    },
  ];
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function packlinkHeaders(apiKey: string) {
  return {
    Authorization: apiKey,
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Ecommerce-Name": "Halo Store",
    "X-Module-Version": "1.0.0",
  };
}

async function packlinkFetch(path: string, init: RequestInit = {}) {
  const apiKey = getPacklinkApiKey();
  if (!apiKey) throw new Error("Manca PACKLINK_API_KEY");
  const res = await fetch(`${PACKLINK_BASE}${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      ...packlinkHeaders(apiKey),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = text;
    }
  }
  if (!res.ok) {
    throw new Error(packlinkErrorMessage(res.status, json, text));
  }
  return json;
}

function packlinkErrorMessage(status: number, json: unknown, text: string) {
  if (status === 401 || status === 403) {
    return "Chiave Packlink non accettata. Controlla PACKLINK_API_KEY in Impostazioni Packlink PRO.";
  }
  if (json && typeof json === "object") {
    const rec = json as Record<string, unknown>;
    const msg = rec.message ?? rec.error ?? rec.detail;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (Array.isArray(rec.messages) && rec.messages[0]) return String(rec.messages[0]);
  }
  if (typeof json === "string" && json.trim()) return json.slice(0, 280);
  return `Packlink ha risposto ${status}${text ? `: ${text.slice(0, 180)}` : ""}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function num(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function str(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseAvailableDates(raw: unknown): Array<{ date: string; window: string }> {
  const rec = asRecord(raw);
  if (!rec) return nextCollectionDates();
  const dates = Object.entries(rec)
    .map(([date, window]) => {
      const win = asRecord(window);
      const label =
        str(win?.value) ||
        (str(win?.from) && str(win?.till) ? `${str(win?.from)}-${str(win?.till)}` : str(window));
      return { date, window: label || "09:00-18:00" };
    })
    .filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  return dates.length ? dates : nextCollectionDates();
}

function parseQuote(raw: unknown): PacklinkQuote | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = rec.id ?? rec.service_id;
  if (id == null) return null;
  const price = asRecord(rec.price);
  const priceEuro = num(price?.total_price, num(rec.base_price, num(rec.price)));
  return {
    id: String(id),
    name: str(rec.name, str(rec.service_name, "Servizio")),
    carrierName: str(rec.carrier_name, str(rec.carrier, "Corriere")),
    priceEuro: round2(priceEuro),
    currency: str(price?.currency, str(rec.currency, "EUR")),
    transit: str(rec.transit_time, str(rec.first_estimated_delivery_date)),
    dropoff: Boolean(rec.dropoff || rec.delivery_to_parcelshop),
    availableDates: parseAvailableDates(rec.available_dates),
  };
}

export function parseParcel(input: Partial<PacklinkParcel> | null | undefined): PacklinkParcel {
  const weightKg = num(input?.weightKg, defaultParcel.weightKg);
  const lengthCm = Math.ceil(num(input?.lengthCm, defaultParcel.lengthCm));
  const widthCm = Math.ceil(num(input?.widthCm, defaultParcel.widthCm));
  const heightCm = Math.ceil(num(input?.heightCm, defaultParcel.heightCm));
  if (weightKg <= 0 || weightKg > 40) throw new Error("Il peso deve essere tra 0,1 e 40 kg.");
  if (lengthCm < 5 || widthCm < 5 || heightCm < 5) {
    throw new Error("Le misure del pacco devono essere almeno 5 cm per lato.");
  }
  if (lengthCm > 150 || widthCm > 150 || heightCm > 150) {
    throw new Error("Le misure del pacco superano i 150 cm.");
  }
  return { weightKg: round2(weightKg), lengthCm, widthCm, heightCm };
}

export async function getPacklinkQuotes(input: {
  toCountry: string;
  toZip: string;
  parcel: PacklinkParcel;
}): Promise<{ live: boolean; quotes: PacklinkQuote[] }> {
  const parcel = parseParcel(input.parcel);
  const toZip = input.toZip.replace(/\s/g, "");
  const toCountry = (input.toCountry || "IT").toUpperCase();
  if (!/^\d{5}$/.test(toZip) && toCountry === "IT") {
    throw new Error("CAP di destinazione non valido.");
  }
  const apiKey = getPacklinkApiKey();
  if (!apiKey) {
    return { live: false, quotes: demoQuotes(parcel) };
  }

  const params = new URLSearchParams();
  params.set("from[country]", "IT");
  params.set("from[zip]", storeConfig.address.postalCode);
  params.set("to[country]", toCountry);
  params.set("to[zip]", toZip);
  params.set("packages[0][width]", String(parcel.widthCm));
  params.set("packages[0][height]", String(parcel.heightCm));
  params.set("packages[0][length]", String(parcel.lengthCm));
  params.set("packages[0][weight]", String(parcel.weightKg));
  params.set("source", "pro");

  const json = await packlinkFetch(`services?${params.toString()}`);
  const list = Array.isArray(json) ? json : asRecord(json)?.services;
  const quotes = (Array.isArray(list) ? list : []).map(parseQuote).filter((q): q is PacklinkQuote => Boolean(q));
  if (!quotes.length) {
    throw new Error("Nessun corriere disponibile per questo CAP e queste misure.");
  }
  return { live: true, quotes };
}

function sanitizeContent(value: string) {
  return value
    .replace(/[;:%&/ºª€$@#()=?¿¡!\\'`´^*Êè]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { name: "Cliente", surname: "Halo" };
  if (parts.length === 1) return { name: parts[0], surname: "Cliente" };
  return { name: parts[0], surname: parts.slice(1).join(" ") };
}

function digitsPhone(raw: string | null | undefined, fallback: string) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length >= 8) return digits.startsWith("39") ? digits : `39${digits}`;
  return fallback;
}

export async function createPacklinkShipment(input: {
  quote: PacklinkQuote;
  parcel: PacklinkParcel;
  collectionDate: string;
  collectionTime: string;
  content: string;
  contentValueEuro: number;
  customReference: string;
  to: {
    name: string;
    phone?: string | null;
    email?: string | null;
    street1: string;
    street2?: string | null;
    zip: string;
    city: string;
    country?: string | null;
  };
}): Promise<{ live: boolean; shipment: PacklinkShipment }> {
  const parcel = parseParcel(input.parcel);
  const apiKey = getPacklinkApiKey();
  if (!apiKey) {
    const reference = `DEMO-${input.customReference.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
    return {
      live: false,
      shipment: {
        reference,
        trackingCodes: [],
        labels: [],
        status: "READY_TO_PURCHASE",
        carrier: input.quote.carrierName,
        service: input.quote.name,
      },
    };
  }

  const from = warehouseFrom();
  const names = splitName(input.to.name);
  const body = {
    platform: "PRO",
    platform_country: "IT",
    source: "pro",
    service: input.quote.name,
    carrier: input.quote.carrierName,
    service_id: /^\d+$/.test(input.quote.id) ? Number(input.quote.id) : input.quote.id,
    collection_date: input.collectionDate,
    collection_time: input.collectionTime,
    content: sanitizeContent(input.content || "Abbigliamento"),
    contentvalue: round2(Math.max(1, input.contentValueEuro)),
    contentValue_currency: "EUR",
    shipment_custom_reference: input.customReference.slice(0, 50),
    from,
    to: {
      name: names.name,
      surname: names.surname,
      street1: input.to.street1,
      street2: input.to.street2 ?? "",
      zip_code: input.to.zip.replace(/\s/g, ""),
      city: input.to.city,
      country: (input.to.country || "IT").toUpperCase(),
      phone: digitsPhone(input.to.phone, from.phone),
      email: input.to.email || storeConfig.support.email,
    },
    packages: [
      {
        width: parcel.widthCm,
        height: parcel.heightCm,
        length: parcel.lengthCm,
        weight: parcel.weightKg,
      },
    ],
  };

  const created = asRecord(await packlinkFetch("shipments", { method: "POST", body: JSON.stringify(body) }));
  const reference = str(created?.reference, str(created?.shipment_reference));
  if (!reference) throw new Error("Packlink non ha restituito il riferimento della spedizione.");
  const shipment = await getPacklinkShipment(reference);
  let labels: string[] = [];
  try {
    labels = await pollPacklinkLabels(reference);
  } catch {
    labels = [];
  }
  return {
    live: true,
    shipment: {
      ...shipment,
      labels: labels.length ? labels : shipment.labels,
    },
  };
}

export async function getPacklinkShipment(reference: string): Promise<PacklinkShipment> {
  if (reference.startsWith("DEMO-") || !getPacklinkApiKey()) {
    return {
      reference,
      trackingCodes: [],
      labels: [],
      status: "READY_TO_PURCHASE",
      carrier: "",
      service: "",
    };
  }
  const rec = asRecord(await packlinkFetch(`shipments/${encodeURIComponent(reference)}`));
  const tracking = rec?.tracking_codes;
  return {
    reference: str(rec?.reference, reference),
    trackingCodes: Array.isArray(tracking) ? tracking.map((code) => String(code)).filter(Boolean) : [],
    labels: [],
    status: str(rec?.status),
    carrier: str(rec?.carrier),
    service: str(rec?.service),
  };
}

export async function pollPacklinkLabels(reference: string, attempts = 8): Promise<string[]> {
  if (reference.startsWith("DEMO-") || !getPacklinkApiKey()) return [];
  for (let i = 0; i < attempts; i += 1) {
    const json = await packlinkFetch(`shipments/${encodeURIComponent(reference)}/labels`);
    const urls = Array.isArray(json)
      ? json.filter((item): item is string => typeof item === "string" && item.startsWith("http"))
      : [];
    if (urls.length) return urls;
    await new Promise((resolve) => setTimeout(resolve, 900));
  }
  return [];
}

export async function getPacklinkTracking(reference: string) {
  if (reference.startsWith("DEMO-") || !getPacklinkApiKey()) {
    return { events: [] as Array<{ timestamp?: string; description?: string }> };
  }
  const json = await packlinkFetch(`shipments/${encodeURIComponent(reference)}/track`);
  return { events: Array.isArray(json) ? json : asRecord(json)?.history ?? [] };
}

export function pickupGroupKey(state: Pick<PacklinkOrderState, "carrierName" | "dropoff">) {
  return `${state.dropoff ? "dropoff" : "collect"}:${state.carrierName.trim().toLowerCase()}`;
}

export function isCustomerTrackingCode(code: string, packlinkReference?: string) {
  const value = code.trim();
  if (!value) return false;
  if (value.startsWith("DEMO-")) return false;
  if (packlinkReference && value === packlinkReference) return false;
  return true;
}

export function customerTrackingCodes(codes: string[], packlinkReference?: string) {
  return codes.filter((code) => isCustomerTrackingCode(code, packlinkReference));
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
