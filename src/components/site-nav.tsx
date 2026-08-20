"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useReservation } from "@/components/reservation-provider";
import { OpenBadge } from "@/components/open-badge";
import { HaloLogo } from "@/components/halo-logo";

const links = [
  { href: "#catalogo", label: "Catalogo" },
  { href: "#manifesto", label: "Il negozio" },
  { href: "#recensioni", label: "Recensioni" },
  { href: "#dove-siamo", label: "Dove siamo" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openBag, lastAdded } = useReservation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 24);
  });

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled
            ? "border-b border-ink-line/80 bg-ink/80 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:h-20 sm:px-8">
          <a
            href="#top"
            className="group relative flex items-center"
            aria-label="Halo Store, torna in cima"
          >
            <span
              aria-hidden
              className="absolute -inset-x-4 -inset-y-2 rounded-full bg-halo/0 blur-lg transition-colors duration-500 group-hover:bg-halo/15"
            />
            <HaloLogo className="relative h-8 text-ivory transition-colors duration-500 group-hover:text-halo-bright sm:h-9" />
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-sm text-ivory-dim transition-colors hover:text-ivory"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-halo transition-all duration-400 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <OpenBadge compact />
            </div>

            <button
              type="button"
              onClick={openBag}
              className="relative flex items-center gap-2 rounded-full border border-ink-line bg-ink-soft/70 px-4 py-2 text-sm text-ivory transition-colors hover:border-halo/60 hover:text-halo-bright"
              aria-label={`Apri le prenotazioni, ${count} capi selezionati`}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Prenotazioni</span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="count"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex h-5 min-w-5 items-center justify-center rounded-full bg-halo px-1 text-xs font-medium text-ink"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {lastAdded && (
                  <motion.span
                    key="pulse"
                    initial={{ opacity: 0.7, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9 }}
                    className="pointer-events-none absolute inset-0 rounded-full border border-halo"
                  />
                )}
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-line text-ivory md:hidden"
              aria-label="Apri il menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/95 backdrop-blur-xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu di navigazione"
          >
            <div className="flex h-16 items-center justify-end px-5">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-line"
                aria-label="Chiudi il menu"
                autoFocus
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ul className="flex flex-col gap-2 px-6 pt-8">
              {links.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * index, duration: 0.5 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-ink-line py-5 font-display text-4xl"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="px-6 pt-10">
              <OpenBadge />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
