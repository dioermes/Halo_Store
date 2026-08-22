"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { formatPrice, type Product } from "@/lib/products";

const spring = { stiffness: 220, damping: 26, mass: 0.5 };

export function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  index?: number;
  onOpen: (product: Product) => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(pointerY, [0, 1], [7, -7]), spring);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-7, 7]), spring);
  const glowX = useTransform(pointerX, (value) => `${value * 100}%`);
  const glowY = useTransform(pointerY, (value) => `${value * 100}%`);
  const glow = useMotionTemplate`radial-gradient(340px circle at ${glowX} ${glowY}, rgba(63,21,33,0.18), transparent 70%)`;

  const handleMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (reduceMotion) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const lastOne = product.stock <= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
      style={{ perspective: 1600 }}
    >
      <motion.button
        ref={cardRef}
        type="button"
        onClick={() => onOpen(product)}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group flex h-full w-full cursor-pointer flex-col text-left"
        aria-label={`Apri la scheda di ${product.name}, ${product.subtitle}, ${formatPrice(product.price)}`}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-ink-line/70 bg-ink-soft shadow-[0_24px_60px_-36px_rgba(63,21,33,0.45)]">
          <div className="absolute inset-0" style={{ transform: "translateZ(28px)" }}>
            <Image
              src={product.image}
              alt={`${product.name}, ${product.subtitle}`}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
              className="object-cover transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />

          {!reduceMotion && (
            <motion.div
              aria-hidden
              style={{ background: glow }}
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {product.badge && (
            <span className="absolute left-5 top-5 rounded-full border border-halo/40 bg-ink/80 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-halo backdrop-blur">
              {product.badge}
            </span>
          )}

          {lastOne && (
            <span className="absolute right-5 top-5 rounded-full bg-ivory px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-ink">
              Ultimo pezzo
            </span>
          )}

          <div className="pointer-events-none absolute inset-x-5 bottom-5 translate-y-3 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:hidden">
            <span className="flex min-h-11 items-center justify-center rounded-full bg-ivory/95 py-3 text-sm font-medium text-ink backdrop-blur">
              Guarda e acquista
            </span>
          </div>
        </div>

        <div className="mt-5 flex min-h-[4.75rem] items-start justify-between gap-3 sm:mt-6 sm:min-h-[5.25rem] sm:gap-4">
          <div className="min-w-0">
            <p className="font-display text-[1.35rem] leading-[1.05] tracking-[-0.02em] sm:text-[1.7rem]">{product.name}</p>
            <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ivory-dim">{product.subtitle}</p>
          </div>
          <div className="shrink-0 pt-0.5 text-right">
            {product.compareAt ? (
              <p className="text-xs text-ivory-dim line-through">{formatPrice(product.compareAt)}</p>
            ) : null}
            <p className="font-display text-lg text-halo-bright sm:text-xl">{formatPrice(product.price)}</p>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
