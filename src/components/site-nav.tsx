"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, Search, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import { Show, useClerk } from "@clerk/nextjs";
import { useReservation } from "@/components/reservation-provider";
import { HaloLogo, HaloLogoOriginal } from "@/components/halo-logo";
import { SiteSearch } from "@/components/site-search";
import { adminNav, isAdminNavActive } from "@/lib/admin-nav";
import { catalogPath } from "@/lib/categories";
import type { StoreCategory } from "@/lib/products";

export function SiteNav({
  categories = [],
  homeLinks,
}: {
  categories?: StoreCategory[];
  homeLinks?: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const inAdmin = pathname.startsWith("/admin");
  const storefrontLinks =
    homeLinks && homeLinks.length > 0
      ? homeLinks
      : [
          { href: "/#nuovi-arrivi", label: "Nuovi arrivi" },
          { href: "/#best-seller", label: "Best seller" },
          { href: "/#saldi", label: "Saldi" },
        ];
  const links = inAdmin ? adminNav : storefrontLinks;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { count, openBag, lastAdded } = useReservation();
  const { scrollY } = useScroll();

  useEffect(() => {
    if (pathname !== "/") return;
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 24);
  });

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
    setCatalogOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const iconBtn =
    "flex h-11 w-11 items-center justify-center rounded-full text-ivory transition-colors duration-500 hover:bg-ivory/10 hover:text-halo-bright";

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className={`pointer-events-auto fixed inset-x-0 top-0 z-[100] transition-colors duration-500 ${
          scrolled
            ? "border-b border-ink-line/80 bg-ink/85 backdrop-blur-xl"
            : "border-b border-ink-line bg-ink md:border-transparent md:bg-ink/40 md:backdrop-blur-md"
        }`}
      >
        <nav className="mx-auto grid h-16 max-w-[84rem] grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 sm:h-20 sm:px-10">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setAccountOpen(false);
                setMenuOpen(true);
              }}
              className={iconBtn}
              aria-label="Apri il menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            {!inAdmin ? (
              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  setSearchOpen(true);
                }}
                className={iconBtn}
                aria-label="Cerca nel catalogo"
              >
                <Search className="h-5 w-5" aria-hidden />
              </button>
            ) : null}
          </div>

          <Link
            href="/"
            className="flex h-12 items-center justify-center sm:h-16"
            aria-label="Halo Store, torna alla home"
          >
            {inAdmin ? (
              <HaloLogo className="h-9 text-ivory sm:h-11" />
            ) : (
              <HaloLogoOriginal className="h-12 sm:h-16" />
            )}
          </Link>

          <div className="flex items-center justify-end gap-1">
            <AccountMenu
              open={accountOpen}
              onOpenChange={(next) => {
                if (next) setSearchOpen(false);
                setAccountOpen(next);
              }}
              iconClass={iconBtn}
            />
            <button
              type="button"
              onClick={openBag}
              className={`relative ${iconBtn}`}
              aria-label={`Apri il carrello, ${count} capi`}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="count"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-halo px-1 text-[10px] font-medium text-ink"
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
                    animate={{ opacity: 0, scale: 1.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9 }}
                    className="pointer-events-none absolute inset-0 rounded-full border border-halo"
                  />
                )}
              </AnimatePresence>
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
            className="fixed inset-0 z-[110] bg-ink/95 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Menu di navigazione"
          >
            <div className="flex h-16 items-center justify-between px-5 sm:h-20 sm:px-10">
              <p className="text-xs uppercase tracking-[0.32em] text-ivory-dim">Menu</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-line"
                aria-label="Chiudi il menu"
                autoFocus
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <ul className="flex max-h-[calc(100dvh-5rem)] flex-col gap-2 overflow-y-auto px-6 pt-6 sm:px-10">
              {links.map((link, index) => {
                const active = inAdmin && isAdminNavActive(link.href, pathname);
                return (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * index, duration: 0.5 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block border-b border-ink-line py-5 font-display text-4xl ${
                        active ? "text-halo-bright" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                );
              })}
              {!inAdmin ? (
                <motion.li
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24, duration: 0.5 }}
                >
                  <button
                    type="button"
                    aria-expanded={catalogOpen}
                    onClick={() => setCatalogOpen((open) => !open)}
                    className="flex w-full items-center justify-between border-b border-ink-line py-5 text-left font-display text-4xl"
                  >
                    Catalogo
                    <ChevronDown
                      className={`h-8 w-8 transition-transform duration-300 ${catalogOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {catalogOpen ? (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <li>
                          <Link
                            href={catalogPath()}
                            onClick={() => setMenuOpen(false)}
                            className={`block border-b border-ink-line/60 py-4 pl-1 font-display text-2xl ${
                              pathname === "/catalogo" ? "text-halo-bright" : "text-ivory-dim"
                            }`}
                          >
                            Tutto il negozio
                          </Link>
                        </li>
                        {categories.map((category) => (
                          <li key={category.id}>
                            <Link
                              href={catalogPath(category.id)}
                              onClick={() => setMenuOpen(false)}
                              className={`block border-b border-ink-line/60 py-4 pl-1 font-display text-2xl ${
                                pathname === catalogPath(category.id)
                                  ? "text-halo-bright"
                                  : "text-ivory-dim"
                              }`}
                            >
                              {category.label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    ) : null}
                  </AnimatePresence>
                </motion.li>
              ) : null}
              {!inAdmin ? (
                <motion.li
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Link
                    href="/#dove-siamo"
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-ink-line py-5 font-display text-4xl"
                  >
                    Dove siamo
                  </Link>
                </motion.li>
              ) : null}
              <Show when="signed-out">
                <motion.li
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Link
                    href="/sign-in"
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-ink-line py-5 font-display text-4xl"
                  >
                    Accedi
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36, duration: 0.5 }}
                >
                  <Link
                    href="/sign-up"
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-ink-line py-5 font-display text-4xl"
                  >
                    Registrati
                  </Link>
                </motion.li>
              </Show>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function AccountMenu({
  open,
  onOpenChange,
  iconClass,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  iconClass: string;
}) {
  const { signOut } = useClerk();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  const itemClass = "block w-full px-4 py-2.5 text-left text-sm text-ivory hover:bg-ivory/10";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={iconClass}
        aria-label="Account"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
      >
        <User className="h-5 w-5" aria-hidden />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            role="menu"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[120] min-w-44 overflow-hidden rounded-2xl border border-ink-line bg-ink py-1 shadow-lg"
          >
            <Show when="signed-out">
              <Link href="/sign-in" role="menuitem" onClick={() => onOpenChange(false)} className={itemClass}>
                Accedi
              </Link>
              <Link href="/sign-up" role="menuitem" onClick={() => onOpenChange(false)} className={itemClass}>
                Registrati
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/account" role="menuitem" onClick={() => onOpenChange(false)} className={itemClass}>
                Account
              </Link>
              <button
                type="button"
                role="menuitem"
                className={itemClass}
                onClick={() => {
                  onOpenChange(false);
                  void signOut({ redirectUrl: "/" });
                }}
              >
                Esci
              </button>
            </Show>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
