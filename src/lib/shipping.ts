export const FREE_SHIPPING_THRESHOLD_CENTS = 10000;

// Spedizione gratuita quando il carrello supera la soglia (sconti esclusi).
export function shippingFor(subtotalCents: number, baseCents: number) {
  return subtotalCents > FREE_SHIPPING_THRESHOLD_CENTS ? 0 : baseCents;
}
