import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { isOwnerUser } from "@/lib/auth";
import { isAdminConfigured } from "@/lib/supabase";
import { AdminSectionNav } from "@/components/admin-section-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  if (!isOwnerUser(user)) {
    return (
      <section className="mx-auto max-w-xl px-5 py-28 text-center">
        <h1 className="font-display text-5xl">Questa zona è del titolare.</h1>
        <p className="mt-4 text-ivory-dim">
          Imposta publicMetadata.role = owner su Clerk oppure HALO_OWNER_CLERK_IDS
          nel file env.
        </p>
      </section>
    );
  }

  if (!isAdminConfigured()) {
    return (
      <section className="mx-auto max-w-xl px-5 py-28">
        <h1 className="font-display text-5xl">Manca la chiave di servizio.</h1>
        <p className="mt-4 text-ivory-dim">
          Aggiungi SUPABASE_SERVICE_ROLE_KEY in .env.local per scrivere catalogo e
          ordini. La vetrina pubblica già legge il database.
        </p>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-24">
      <p className="text-xs uppercase tracking-[0.34em] text-halo">Titolare</p>
      <h1 className="mt-3 font-display text-5xl">Halo, da dentro.</h1>
      <AdminSectionNav />
      <div className="mt-12">{children}</div>
    </div>
  );
}
