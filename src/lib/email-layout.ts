import { storeConfig, fullAddress } from "@/lib/store-config";

const ink = "#C5CEBC";
const wine = "#3F1521";
const wineSoft = "#6B3A45";
const wineBright = "#5C2432";
const line = "#8A6A72";

export function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function firstName(name?: string | null) {
  const trimmed = name?.trim();
  if (!trimmed) return "";
  return esc(trimmed.split(/\s+/)[0] ?? "");
}

export function orderCode(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function shortOrderId(id: string) {
  return esc(orderCode(id));
}

export function haloButton(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
    <tr>
      <td style="background:${wine};border-radius:999px;">
        <a href="${esc(href)}" style="display:inline-block;padding:14px 28px;color:${ink};text-decoration:none;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;letter-spacing:.16em;text-transform:uppercase;">${esc(label)}</a>
      </td>
    </tr>
  </table>`;
}

export function haloEmail({
  preheader,
  eyebrow = "Halo Store · Conversano",
  title,
  body,
  cta,
  extra,
  audience = "customer",
}: {
  preheader?: string;
  eyebrow?: string;
  title: string;
  body: string;
  cta?: { href: string; label: string };
  extra?: string;
  audience?: "customer" | "owner";
}) {
  const hidden = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${ink};">${esc(preheader)}</div>`
    : "";
  const badge =
    audience === "owner"
      ? `<p style="margin:0 0 18px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:${wineBright};">Avviso negozio</p>`
      : "";

  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${ink};color:${wine};">
  ${hidden}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ink};">
    <tr>
      <td style="padding:36px 16px 48px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
          <tr>
            <td style="padding:8px 8px 28px;">
              <p style="margin:0;font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:${wineBright};">${esc(eyebrow)}</p>
            </td>
          </tr>
          <tr>
              <td style="background:#B7C2B0;border:1px solid ${line};border-radius:28px;padding:36px 28px 32px;">
              ${badge}
              <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:34px;line-height:1.05;letter-spacing:-0.02em;color:${wine};">${esc(title)}</h1>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:${wine};">
                ${body}
              </div>
              ${cta ? haloButton(cta.href, cta.label) : ""}
              ${extra ?? ""}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 8px 0;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;line-height:1.7;color:${wineSoft};">
              <p style="margin:0 0 8px;">${esc(storeConfig.name)} · abbigliamento uomo</p>
              <p style="margin:0 0 8px;">${esc(fullAddress)}</p>
              <p style="margin:0;">
                <a href="${esc(storeConfig.support.emailHref)}" style="color:${wineBright};text-decoration:none;">${esc(storeConfig.support.email)}</a>
                ·
                <a href="${esc(storeConfig.phone.href)}" style="color:${wineBright};text-decoration:none;">${esc(storeConfig.phone.display)}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
