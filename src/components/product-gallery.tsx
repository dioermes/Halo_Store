"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  getColorLook,
  getGallery,
  type Product,
} from "@/lib/products";

export function ProductGallery({
  product,
  color,
  onColorChange,
  onClose,
}: {
  product: Product;
  color: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
}) {
  const shots = getGallery(product);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const look = getColorLook(color);
  const filterOnMain = index === 0 ? look.filter : undefined;

  useEffect(() => {
    setIndex(0);
  }, [color, product.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) => (current + 1) % shots.length);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) => (current - 1 + shots.length) % shots.length);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose, shots.length]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchX.current == null) return;
    const delta = event.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(delta) < 48) return;
    setIndex((current) =>
      delta < 0
        ? (current + 1) % shots.length
        : (current - 1 + shots.length) % shots.length,
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="fixed inset-0 z-[90] flex flex-col bg-ink"
      role="dialog"
      aria-modal="true"
      aria-label={`Foto di ${product.name}`}
    >
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 sm:px-6">
        <div>
          <p className="font-display text-2xl leading-none">{product.name}</p>
          <p className="mt-1 text-xs text-ivory-dim">{color}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-line bg-ink-soft text-ivory transition-colors hover:border-halo/60 hover:text-halo-bright"
          aria-label="Chiudi le foto"
          autoFocus
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div
        className="relative min-h-0 flex-1"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${shots[index]}-${color}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={shots[index]}
              alt={`${product.name}, ${product.subtitle}, foto ${index + 1} di ${shots.length}`}
              fill
              sizes="100vw"
              className="object-contain"
              style={filterOnMain ? { filter: filterOnMain } : undefined}
              priority
            />
          </motion.div>
        </AnimatePresence>

        {shots.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setIndex((current) => (current - 1 + shots.length) % shots.length)
              }
              className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-line bg-ink/70 text-ivory backdrop-blur sm:flex"
              aria-label="Foto precedente"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setIndex((current) => (current + 1) % shots.length)}
              className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-line bg-ink/70 text-ivory backdrop-blur sm:flex"
              aria-label="Foto successiva"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}
      </div>

      <div className="space-y-5 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8">
        {shots.length > 1 && (
          <div className="flex items-center justify-center gap-2">
            {shots.map((src, shotIndex) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(shotIndex)}
                aria-label={`Vai alla foto ${shotIndex + 1}`}
                aria-current={shotIndex === index}
                className={`relative h-14 w-11 overflow-hidden rounded-lg border transition-colors ${
                  shotIndex === index
                    ? "border-halo"
                    : "border-ink-line opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                  style={
                    shotIndex === 0 && look.filter
                      ? { filter: look.filter }
                      : undefined
                  }
                />
              </button>
            ))}
          </div>
        )}

        {product.colors.length > 1 && (
          <div>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-ivory-dim">
              Colore
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              {product.colors.map((option) => {
                const swatch = getColorLook(option);
                const selected = option === color;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onColorChange(option)}
                    aria-pressed={selected}
                    className="group flex flex-col items-center gap-1.5"
                  >
                    <span
                      className={`block h-9 w-9 rounded-full border-2 transition-transform ${
                        selected
                          ? "scale-110 border-halo-bright"
                          : "border-ivory/25 group-hover:border-ivory/60"
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span
                      className={`text-[11px] ${
                        selected ? "text-halo-bright" : "text-ivory-dim"
                      }`}
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
