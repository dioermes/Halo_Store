export const adminNav = [
  { href: "/admin", label: "Panoramica" },
  { href: "/admin/catalogo", label: "Catalogo" },
  { href: "/admin/ordini", label: "Ordini" },
  { href: "/admin/impostazioni", label: "Impostazioni" },
] as const;

export function isAdminNavActive(href: string, pathname: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
