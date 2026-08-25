import { storeConfig } from "@/lib/store-config";
import type { PacklinkOrderState } from "@/lib/packlink";

export function packlinkLabelHtml(input: {
  orderId: string;
  customerName: string;
  street: string;
  cityLine: string;
  phone?: string | null;
  state: PacklinkOrderState;
}) {
  const { state } = input;
  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>Etichetta ${state.reference}</title>
  <style>
    @page { size: 100mm 150mm; margin: 8mm; }
    body { font-family: "Segoe UI", Arial, sans-serif; color: #111; }
    .box { border: 2px solid #111; padding: 14px; }
    h1 { font-size: 18px; margin: 0 0 8px; letter-spacing: 0.08em; text-transform: uppercase; }
    .ref { font-size: 22px; font-weight: 700; letter-spacing: 0.12em; margin: 10px 0; }
    .muted { color: #444; font-size: 12px; }
    .row { display: flex; justify-content: space-between; gap: 16px; margin-top: 16px; }
    .col { flex: 1; }
    .barcode { font-family: "Courier New", monospace; font-size: 28px; letter-spacing: 0.18em; border-top: 8px solid #111; border-bottom: 8px solid #111; padding: 8px 0; margin-top: 18px; text-align: center; }
    @media print { button { display: none; } }
    button { margin-top: 16px; padding: 10px 16px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>${escapeHtml(storeConfig.name)}</h1>
    <p class="muted">Da: ${escapeHtml(state.live ? "Packlink PRO" : "Etichetta di prova")} · ${escapeHtml(state.carrierName)} · ${escapeHtml(state.serviceName)}</p>
    <div class="ref">${escapeHtml(state.reference)}</div>
    <div class="row">
      <div class="col">
        <p class="muted">Mittente</p>
        <p>${escapeHtml(storeConfig.legalName)}<br/>${escapeHtml(storeConfig.address.street)}<br/>${escapeHtml(storeConfig.address.postalCode)} ${escapeHtml(storeConfig.address.city)}</p>
      </div>
      <div class="col">
        <p class="muted">Destinatario</p>
        <p><strong>${escapeHtml(input.customerName)}</strong><br/>${escapeHtml(input.street)}<br/>${escapeHtml(input.cityLine)}${input.phone ? `<br/>${escapeHtml(input.phone)}` : ""}</p>
      </div>
    </div>
    <p class="muted" style="margin-top:14px">Pacco ${state.parcel.weightKg} kg · ${state.parcel.lengthCm}×${state.parcel.widthCm}×${state.parcel.heightCm} cm · ritiro ${escapeHtml(state.collectionDate)} ${escapeHtml(state.collectionTime)}</p>
    <div class="barcode">${escapeHtml(state.reference)}</div>
    ${state.live ? "" : `<p class="muted" style="margin-top:12px">Prova: con PACKLINK_API_KEY questa pagina diventa l’etichetta ufficiale del corriere.</p>`}
  </div>
  <button type="button" onclick="window.print()">Stampa</button>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
