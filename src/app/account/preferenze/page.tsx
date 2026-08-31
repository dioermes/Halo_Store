import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase";
import { ensureCustomer } from "@/lib/auth";
import { MarketingOptIn } from "@/components/marketing-opt-in";

export default async function PreferencesPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const customer = await ensureCustomer(user);
  const admin = createAdminClient();
  const { data: consent } = await admin
    .from("halo_consents")
    .select("email_marketing")
    .eq("customer_id", customer.id)
    .maybeSingle();

  return (
    <section className="mx-auto max-w-2xl px-5 py-24">
      <p className="text-xs uppercase tracking-[0.34em] text-halo">Preferenze</p>
      <h1 className="mt-4 font-display text-5xl">Cosa vuoi sentire da noi.</h1>
      <p className="mt-4 text-ivory-dim">
        Le conferme d&apos;ordine arrivano sempre: sono parte del contratto. La
        newsletter si chiede al primo ingresso in vetrina. Da qui puoi solo
        disiscriverti o iscriverti di nuovo.
      </p>
      <div className="mt-10 rounded-3xl border border-ink-line p-6">
        <MarketingOptIn initial={Boolean(consent?.email_marketing)} />
      </div>
      <p className="mt-8 text-sm text-ivory-dim">
        Usiamo cookie tecnici sempre; la mappa Google solo se la accetti.{" "}
        <Link href="/cookie" className="text-halo-bright underline underline-offset-4">
          Informativa cookie
        </Link>
        .
      </p>
    </section>
  );
}
