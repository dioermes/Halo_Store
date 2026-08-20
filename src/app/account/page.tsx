import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { ensureCustomer, isOwnerUser } from "@/lib/auth";
import { formatPrice } from "@/lib/products";
import { orderStatusLabel, type OrderStatus } from "@/lib/orders";
import { MarketingOptIn } from "@/components/marketing-opt-in";

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  let customer: Awaited<ReturnType<typeof ensureCustomer>>;
  let orders: Array<{
    id: string;
    status: string;
    fulfillment: string;
    total_cents: number;
    created_at: string;
    tracking_code: string | null;
  }> = [];
  let emailMarketing = false;

  try {
    customer = await ensureCustomer(user);
    const admin = createAdminClient();
    const { data } = await admin
      .from("halo_orders")
      .select("id, status, fulfillment, total_cents, created_at, tracking_code")
      .eq("customer_id", customer.id)
      .neq("status", "pending_payment")
      .order("created_at", { ascending: false });
    orders = data ?? [];
    const { data: consent } = await admin
      .from("halo_consents")
      .select("email_marketing")
      .eq("customer_id", customer.id)
      .maybeSingle();
    emailMarketing = Boolean(consent?.email_marketing);
  } catch {
    return (
      <section className="mx-auto max-w-xl px-5 py-28">
        <h1 className="font-display text-5xl">Account quasi pronto.</h1>
        <p className="mt-4 text-ivory-dim">
          Manca SUPABASE_SERVICE_ROLE_KEY in ambiente. Il catalogo è già pubblico;
          ordini e preferenze si sbloccano con quella chiave.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-24">
      <p className="text-xs uppercase tracking-[0.34em] text-halo">Account</p>
      <h1 className="mt-4 font-display text-5xl">Ciao{customer.full_name ? `, ${customer.full_name}` : ""}.</h1>
      <p className="mt-3 text-ivory-dim">{customer.email}</p>
      {isOwnerUser(user) && (
        <Link href="/admin" className="mt-4 inline-block text-sm text-halo-bright underline underline-offset-4">
          Apri il pannello titolare
        </Link>
      )}

      <div className="mt-12 rounded-3xl border border-ink-line p-6">
        <h2 className="font-display text-3xl">Email</h2>
        <MarketingOptIn initial={emailMarketing} />
      </div>

      <h2 className="mt-16 font-display text-4xl">Ordini</h2>
      <ul className="mt-6 space-y-4">
        {(orders ?? []).length === 0 && (
          <li className="text-ivory-dim">Nessun ordine ancora. Il catalogo è a un tocco di distanza.</li>
        )}
        {(orders ?? []).map((order) => (
          <li key={order.id} className="rounded-2xl border border-ink-line p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-display text-2xl">#{order.id.slice(0, 8)}</p>
              <p className="text-sm text-halo-bright">
                {orderStatusLabel[order.status as OrderStatus]}
              </p>
            </div>
            <p className="mt-2 text-sm text-ivory-dim">
              {order.fulfillment === "pickup" ? "Ritiro in negozio" : "Spedizione"} ·{" "}
              {order.fulfillment === "pickup" && order.status !== "completed" && order.status !== "cancelled"
                ? `Da pagare in negozio ${formatPrice(order.total_cents / 100)}`
                : formatPrice(order.total_cents / 100)}
              {order.tracking_code ? ` · tracking ${order.tracking_code}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
