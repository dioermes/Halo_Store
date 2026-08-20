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
  index,
  onOpen,
}: {
  product: Product;
  index: number;
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
  const glow = useMotionTemplate`radial-gradient(340px circle at ${glowX} ${glowY}, rgba(162,178,159,0.22), transparent 70%)`;

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

  const tall = index % 3 === 0;
  const lastOne = product.stock <= 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={index % 3 === 1 ? "lg:mt-16" : undefined}
      style={{ perspective: 1200 }}
    >
      <motion.button
        ref={cardRef}
        type="button"
        onClick={() => onOpen(product)}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group block w-full cursor-pointer text-left"
        aria-label={`Apri la scheda di ${product.name}, ${product.subtitle}, ${formatPrice(product.price)}`}
      >
        <div
          className={`relative w-full overflow-hidden rounded-2xl border border-ink-line bg-ink-soft ${
            tall ? "aspect-[3/4]" : "aspect-[4/5]"
          }`}
        >
          <div className="absolute inset-0">
            <Image
              src={product.image}
              alt={`${product.name}, ${product.subtitle}`}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

          {!reduceMotion && (
            <motion.div
              aria-hidden
              style={{ background: glow }}
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full border border-halo/40 bg-ink/70 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-halo-bright backdrop-blur">
              {product.badge}
            </span>
          )}

          {lastOne && (
            <span className="absolute right-4 top-4 rounded-full bg-ivory px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-ink">
              Ultimo pezzo
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
            <div>
              <p className="font-display text-3xl leading-none">{product.name}</p>
              <p className="mt-2 text-sm text-ivory-dim">{product.subtitle}</p>
            </div>
            <div className="text-right">
              {product.compareAt && (
                <p className="text-xs text-ivory-dim line-through">
                  {formatPrice(product.compareAt)}
                </p>
              )}
              <p className="font-display text-2xl text-halo-bright">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          {/* Su touch l'hover resta appiccicato dopo il tap: la CTA vive solo dove esiste un puntatore */}
          <div className="pointer-events-none absolute inset-x-5 bottom-5 translate-y-6 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:hidden">
            <span className="flex items-center justify-center rounded-full bg-ivory/95 py-3 text-sm font-medium text-ink backdrop-blur">
              Guarda e acquista
            </span>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
