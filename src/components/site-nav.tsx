"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Menu, Search, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import { useClerk, useAuth } from "@clerk/nextjs";
import { useReservation } from "@/components/reservation-provider";
import { useFavorites } from "@/components/favorites-provider";
import { AnnouncementBar } from "@/components/announcement-bar";
import { HaloLogo, HaloLogoOriginal } from "@/components/halo-logo";
import { SiteSearch } from "@/components/site-search";
import { adminNav, isAdminNavActive } from "@/lib/admin-nav";
import { catalogPath } from "@/lib/categories";
import type { StoreCategory } from "@/lib/products";

type Rgb = { red: number; green: number; blue: number; alpha: number };

function parseCssColor(value: string): Rgb | null {
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.fillStyle = "#000";
  context.fillStyle = value;
  const normalized = context.fillStyle;
  if (normalized === "rgba(0, 0, 0, 0)") return null;
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = normalized;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  return { red, green, blue, alpha: alpha / 255 };
}

function luminance({ red, green, blue }: Rgb) {
  const linear = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function sampleMediaPixel(
  media: HTMLImageElement | HTMLVideoElement,
  x: number,
  y: number,
): Rgb | null {
  const rect = media.getBoundingClientRect();
  const sourceWidth = media instanceof HTMLImageElement ? media.naturalWidth : media.videoWidth;
  const sourceHeight = media instanceof HTMLImageElement ? media.naturalHeight : media.videoHeight;
  if (!sourceWidth || !sourceHeight || rect.width <= 0 || rect.height <= 0) return null;

  const scale = Math.max(rect.width / sourceWidth, rect.height / sourceHeight);
  const renderedWidth = sourceWidth * scale;
  const renderedHeight = sourceHeight * scale;
  const objectPosition = getComputedStyle(media).objectPosition.split(" ");
  const positionX = objectPosition[0] === "left" ? 0 : objectPosition[0] === "right" ? 1 : 0.5;
  const positionY = objectPosition[1] === "top" ? 0 : objectPosition[1] === "bottom" ? 1 : 0.5;
  const sourceX = (x - rect.left - (rect.width - renderedWidth) * positionX) / scale;
  const sourceY = (y - rect.top - (rect.height - renderedHeight) * positionY) / scale;
  if (sourceX < 0 || sourceY < 0 || sourceX >= sourceWidth || sourceY >= sourceHeight) return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  try {
    context.drawImage(media, sourceX, sourceY, 1, 1, 0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    return { red, green, blue, alpha: alpha / 255 };
  } catch {
    return null;
  }
}

/** Sotto questa luminanza il vinaccio perde contrasto e serve il salvia (punto di pari contrasto). */
const DARK_BACKGROUND_LUMINANCE = 0.18;

function areaLuminance(rect: DOMRect) {
  const values: number[] = [];
  for (const fx of [0.2, 0.5, 0.8]) {
    for (const fy of [0.3, 0.5, 0.7]) {
      values.push(luminance(backgroundAt(rect.left + rect.width * fx, rect.top + rect.height * fy)));
    }
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function backgroundAt(x: number, y: number): Rgb {
  const elements = document.elementsFromPoint(x, y);
  for (const element of elements) {
    if (element.closest("header, [data-announcement]")) continue;
    if (element instanceof HTMLImageElement || element instanceof HTMLVideoElement) {
      const pixel = sampleMediaPixel(element, x, y);
      if (pixel && pixel.alpha > 0) return pixel;
    }

    const color = parseCssColor(getComputedStyle(element).backgroundColor);
    if (color && color.alpha > 0) return color;
  }
  return { red: 255, green: 255, blue: 255, alpha: 1 };
}

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
          { href: "/#best-seller", label: "I piÃ¹ venduti" },
          { href: "/#saldi", label: "Saldi" },
        ];
  const links = inAdmin
    ? adminNav
    : [...storefrontLinks, { href: "/#gift-card", label: "Gift card" }];
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const sageLogoRef = useRef<HTMLImageElement>(null);
  const { count, openBag, lastAdded } = useReservation();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { count: favoritesCount } = useFavorites();

  useEffect(() => {
    if (pathname !== "/") return;
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && (event.target as Element).closest("[data-profile-menu]")) return;
      setProfileOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [profileOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMenuOpen(false);
      setSearchOpen(false);
      setCatalogOpen(false);
      setProfileOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let frame = 0;
    const sample = () => {
      const logo = logoRef.current;
      const buttons = [...nav.querySelectorAll<HTMLElement>("[data-nav-icon]")];
      const logoRect = logo?.getBoundingClientRect();
      const iconPixels = buttons
        .map((button) => {
          const rect = button.getBoundingClientRect();
          return backgroundAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
        })
        .filter((pixel) => pixel.alpha > 0);
      const iconLuminance =
        iconPixels.reduce((total, pixel) => total + luminance(pixel), 0) /
        Math.max(1, iconPixels.length);
      const iconsOnDark = iconLuminance < DARK_BACKGROUND_LUMINANCE;
      nav.style.setProperty("--nav-icon-color", iconsOnDark ? "#C5CEBC" : "#3F1521");
      for (const button of buttons) {
        button.style.color = "var(--nav-icon-color)";
      }

      const bar = document.querySelector<HTMLElement>("[data-announcement]");
      if (bar) {
        const rect = bar.getBoundingClientRect();
        const points = [0.1, 0.3, 0.5, 0.7, 0.9].map((ratio) =>
          luminance(backgroundAt(rect.left + rect.width * ratio, rect.top + rect.height / 2)),
        );
        const average = points.reduce((total, value) => total + value, 0) / points.length;
        bar.style.color = average < DARK_BACKGROUND_LUMINANCE ? "#C5CEBC" : "#3F1521";
      }

      if (logo && logoRect && logoRect.width > 0) {
        const logoOnDark = areaLuminance(logoRect) < DARK_BACKGROUND_LUMINANCE;
        logo.style.opacity = logoOnDark ? "0" : "1";
        if (sageLogoRef.current) sageLogoRef.current.style.opacity = logoOnDark ? "1" : "0";
      }
    };
    const scheduleSample = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(sample);
    };

    scheduleSample();
    window.addEventListener("scroll", scheduleSample, { passive: true });
    window.addEventListener("resize", scheduleSample);
    window.addEventListener("load", scheduleSample);
    const interval = window.setInterval(scheduleSample, 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener("scroll", scheduleSample);
      window.removeEventListener("resize", scheduleSample);
      window.removeEventListener("load", scheduleSample);
    };
  }, [pathname]);

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-[#3F1521] transition-colors duration-300 hover:opacity-70 sm:h-11 sm:w-11";

  return (
    <>
      {!inAdmin ? <AnnouncementBar overlay={pathname === "/"} /> : null}
      <header
        className={`halo-nav-in pointer-events-none absolute inset-x-0 z-[100] overflow-visible ${
          inAdmin ? "top-0" : "top-9"
        }`}
      >
        <nav
          ref={navRef}
          className="mx-auto flex max-w-[84rem] items-center justify-between px-4 pt-3 sm:px-8 sm:pt-4"
        >
          <Link
            href="/"
            className="pointer-events-auto relative z-10 shrink-0"
            aria-label="Halo Store, torna alla home"
          >
            {inAdmin ? (
              <HaloLogo className="h-12 text-ivory drop-shadow-sm sm:h-16" />
            ) : (
              <>
                <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
                  <filter id="halo-logo-sage" colorInterpolationFilters="sRGB">
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0.773  0 0 0 0 0.808  0 0 0 0 0.737  0 0 0 6 -1.2"
                    />
                  </filter>
                  <filter id="halo-logo-clean" colorInterpolationFilters="sRGB">
                    <feColorMatrix
                      type="matrix"
                      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 6 -1.2"
                    />
                  </filter>
                </svg>
                {pathname === "/" ? (
                  <span className="relative -ml-2 block aspect-[752/564] h-24 overflow-hidden sm:-ml-4 md:h-44">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={logoRef}
                      src="/logo-halo-originale.png"
                      alt="Halo Store"
                      style={{ filter: "url(#halo-logo-clean)" }}
                      className="absolute left-[-21.8%] top-[-46.8%] block h-auto w-[143.6%] max-w-none transition-opacity duration-500 ease-out"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={sageLogoRef}
                      src="/logo-halo-originale.png"
                      alt=""
                      aria-hidden
                      style={{ filter: "url(#halo-logo-sage)", opacity: 0 }}
                      className="absolute left-[-21.8%] top-[-46.8%] block h-auto w-[143.6%] max-w-none transition-opacity duration-500 ease-out"
                    />
                  </span>
                ) : (
                  <span className="relative block w-fit">
                    <HaloLogoOriginal
                      imageRef={logoRef}
                      style={{ filter: "url(#halo-logo-clean)" }}
                      className="h-[5.75rem] w-auto transition-opacity duration-500 ease-out sm:h-28 md:h-40"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={sageLogoRef}
                      src="/logo-halo-originale.png"
                      alt=""
                      aria-hidden
                      style={{ filter: "url(#halo-logo-sage)", opacity: 0 }}
                      className="absolute inset-0 block h-full w-full object-contain transition-opacity duration-500 ease-out"
                    />
                  </span>
                )}
              </>
            )}
          </Link>

          <div className="pointer-events-auto relative z-20 flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={iconBtn}
              data-nav-icon
              aria-label="Apri il menu"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            </button>
            {!inAdmin && !isSignedIn ? (
              <Link
                href="/sign-in?redirect_url=%2Faccount"
                className={iconBtn}
                data-nav-icon
                aria-label="Accedi"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              </Link>
            ) : null}
            {!inAdmin && isSignedIn ? (
              <div className="relative" data-profile-menu>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className={iconBtn}
                  data-nav-icon
                  aria-label="Il mio account"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                </button>
                {profileOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-md border border-ink-line bg-ink shadow-lg"
                  >
                    <Link
                      href="/account"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-3 text-sm text-ivory hover:bg-ink-line/40"
                    >
                      Profilo
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        void signOut({ redirectUrl: "/" });
                      }}
                      className="block w-full border-t border-ink-line px-4 py-3 text-left text-sm text-ivory hover:bg-ink-line/40"
                    >
                      Esci
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            {!inAdmin ? (
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(true);
                }}
                className={iconBtn}
                data-nav-icon
                aria-label="Cerca nel catalogo"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              </button>
            ) : null}
            <Link
              href={
                isSignedIn
                  ? "/account/preferiti"
                  : "/sign-in?redirect_url=%2Faccount%2Fpreferiti"
              }
              className={`relative ${iconBtn}`}
              data-nav-icon
              aria-label={`Preferiti${favoritesCount ? `, ${favoritesCount} capi` : ""}`}
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              <AnimatePresence>
                {favoritesCount > 0 ? (
                  <motion.span
                    key="favorites-count"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-halo px-1 text-[10px] font-medium text-ink"
                  >
                    {favoritesCount}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </Link>
            <button
              type="button"
              onClick={openBag}
              className={`relative ${iconBtn}`}
              data-nav-icon
              aria-label="Apri il carrello"
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
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
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-ivory/20 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Menu di navigazione"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="ml-auto h-full w-full max-w-xl overflow-y-auto bg-ink/95 backdrop-blur-xl"
              onClick={(event) => event.stopPropagation()}
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
              <ul className="flex flex-col gap-2 px-6 pt-6 sm:px-10">
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
              {!isSignedIn ? (
                <>
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
                </>
              ) : null}
              {isSignedIn ? (
                <>
                  <motion.li
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="block border-b border-ink-line py-5 font-display text-4xl"
                    >
                      Account
                    </Link>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.36, duration: 0.5 }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        void signOut({ redirectUrl: "/" });
                      }}
                      className="block w-full border-b border-ink-line py-5 text-left font-display text-4xl"
                    >
                      Esci
                    </button>
                  </motion.li>
                </>
              ) : null}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
