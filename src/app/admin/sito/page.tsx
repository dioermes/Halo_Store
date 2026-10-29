import { SiteEditor } from "@/components/site-editor";
import { StoreContactEditor } from "@/components/store-contact-editor";
import { getCatalogMerch, getSiteAppearance, getStoreContact } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminSitePage({
  searchParams,
}: {
  searchParams: Promise<{ salvato?: string; contatti?: string }>;
}) {
  const query = await searchParams;
  const [appearance, merch, contact] = await Promise.all([
    getSiteAppearance(),
    getCatalogMerch(),
    getStoreContact(),
  ]);

  return (
    <div className="grid gap-6">
      {query.salvato === "1" ? (
        <p className="rounded-2xl border border-halo/40 bg-halo/10 px-4 py-3 text-sm">
          Sito salvato. Apri la home e fai un refresh se vedi ancora il media precedente.
        </p>
      ) : null}
      {query.contatti === "1" ? (
        <p className="rounded-2xl border border-halo/40 bg-halo/10 px-4 py-3 text-sm">
          Contatti e orari salvati.
        </p>
      ) : null}
      <SiteEditor appearance={appearance} tags={merch.tags} />
      <hr className="max-w-2xl border-ink-line" />
      <StoreContactEditor contact={contact} />
    </div>
  );
}
