import { MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { InstagramGlyph } from "@/components/icons";
import { HaloLogoOriginal } from "@/components/halo-logo";
import { fiscalLine, fullAddress, storeConfig } from "@/lib/store-config";

export function SiteFooter() {
  const fiscal = fiscalLine();
  return (
    <footer className="relative overflow-hidden border-t border-ink-line">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[min(900px,90vw)] -translate-x-1/2 rounded-full bg-halo/10 blur-3xl"
      />
      <div className="halo-shell relative pt-20 pb-32 md:pb-20">
        <div className="flex flex-col gap-16 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <HaloLogoOriginal className="h-20 w-auto sm:h-24" />
            <p className="mt-6 text-sm leading-relaxed text-ivory-dim">
              {storeConfig.claim}. {storeConfig.tagline} a Conversano, scelto capo per capo.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ivory-dim">
                Il negozio
              </p>
              <a
                href={storeConfig.maps.place}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-start gap-2 text-sm text-ivory transition-colors hover:text-halo-bright"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{fullAddress}</span>
              </a>
              <a
                href={storeConfig.phone.href}
                className="mt-3 flex items-center gap-2 text-sm text-ivory transition-colors hover:text-halo-bright"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                <span>{storeConfig.phone.display}</span>
              </a>
              <a
                href={storeConfig.support.emailHref}
                className="mt-3 block text-sm text-ivory transition-colors hover:text-halo-bright"
              >
                {storeConfig.support.email}
              </a>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ivory-dim">Seguici</p>
              <a
                href={storeConfig.instagram.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center gap-2 text-sm text-ivory transition-colors hover:text-halo-bright"
              >
                <InstagramGlyph className="h-4 w-4" />
                <span>@{storeConfig.instagram.handle}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-ink-line/45 pt-8 text-xs text-ivory-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            {storeConfig.legalName}
            {fiscal ? ` · ${fiscal}` : ""} · {storeConfig.address.city} (
            {storeConfig.address.province})
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-ivory">
              Privacy
            </Link>
            <Link href="/cookie" className="hover:text-ivory">
              Cookie
            </Link>
            <Link href="/termini" className="hover:text-ivory">
              Vendite e recesso
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
