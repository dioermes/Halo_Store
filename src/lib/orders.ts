export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "preparing",
  "ready_for_pickup",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type Fulfillment = "pickup" | "shipping";

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending_payment: "In attesa di pagamento",
  paid: "Pagato",
  preparing: "In preparazione",
  ready_for_pickup: "Pronto al ritiro",
  shipped: "Spedito",
  completed: "Completato",
  cancelled: "Annullato",
  refunded: "Rimborsato",
};

export function nextStatuses(status: OrderStatus, fulfillment: Fulfillment): OrderStatus[] {
  switch (status) {
    case "paid":
      return ["preparing", "cancelled", "refunded"];
    case "preparing":
      return fulfillment === "pickup"
        ? ["ready_for_pickup", "cancelled"]
        : ["shipped", "cancelled"];
    case "ready_for_pickup":
      return ["completed"];
    case "shipped":
      return ["completed"];
    default:
      return [];
  }
}
