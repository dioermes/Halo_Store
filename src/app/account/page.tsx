import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { ensureCustomer, isOwnerUser } from "@/lib/auth";
import { AccountSections } from "@/components/account-sections";

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
  let giftCards: Array<{
    id: string;
    code: string;
    initial_balance_cents: number;
    balance_cents: number;
  }> = [];

  try {
    customer = await ensureCustomer(user);
    const admin = createAdminClient();
    const { data, error: ordersError } = await admin
      .from("halo_orders")
      .select("id, status, fulfillment, total_cents, created_at, tracking_code")
      .eq("customer_id", customer.id)
      .neq("status", "pending_payment")
      .order("created_at", { ascending: false });
    if (ordersError) throw new Error(ordersError.message);
    orders = data ?? [];

    if (orders.length > 0) {
      const { data: redemptions, error: redemptionsError } = await admin
        .from("halo_gift_card_transactions")
        .select("gift_card_id")
        .in(
          "order_id",
          orders.map((order) => order.id),
        )
        .eq("transaction_type", "redeem");
      if (redemptionsError) throw new Error(redemptionsError.message);

      const redeemedCardIds = [
        ...new Set((redemptions ?? []).map((redemption) => redemption.gift_card_id)),
      ];
      if (redeemedCardIds.length > 0) {
        const { data: redeemedCards, error: cardsError } = await admin
          .from("halo_gift_cards")
          .select("id, code, initial_balance_cents, balance_cents")
          .in("id", redeemedCardIds)
          .order("created_at", { ascending: false });
        if (cardsError) throw new Error(cardsError.message);
        giftCards = redeemedCards ?? [];
      }
    }
  } catch {
    return (
      <section className="mx-auto max-w-xl px-5 py-28">
        <h1 className="font-display text-5xl">Account quasi pronto.</h1>
        <p className="mt-4 text-ivory-dim">
          In questo momento non riusciamo a mostrare ordini e preferenze. Il
          catalogo resta disponibile: riprova tra poco o scrivici.
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
      <p className="mt-4">
        <Link href="/account/preferenze" className="text-sm text-halo-bright underline underline-offset-4">
          Newsletter e preferenze
        </Link>
      </p>

      <AccountSections orders={orders} giftCards={giftCards} />
    </section>
  );
}
