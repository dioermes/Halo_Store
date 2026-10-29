"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { SoldOutLabel } from "@/components/sold-out-label";
import { FavoriteButton } from "@/components/favorite-button";
import { formatPrice, getColorLook, isProductSoldOut, type Product } from "@/lib/products";
import { productPath } from "@/lib/product-path";

export function ProductCard({
  product,
}: {
  product: Product;
  index?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const didSwipe = useRef(false);
  const reduceMotion = useReducedMotion();
  const [imageIndex, setImageIndex] = useState(0);
  const images = [
    ...new Set(
      [
        product.image,
        ...(product.secondaryImage ? [product.secondaryImage] : []),
        ...(product.gallery ?? []),
        ...Object.values(product.colorImages ?? {}),
      ].filter(Boolean),
    ),
  ];
  const availableColors = [
    ...new Set(
      product.colors.filter(
        (color) =>
          !product.variants?.length ||
          product.variants.some((variant) => variant.color === color && variant.stock > 0),
      ),
    ),
  ];
  const activeImageIndex = Math.min(imageIndex, images.length - 1);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const glowX = useTransform(pointerX, (value) => `${value * 100}%`);
  const glowY = useTransform(pointerY, (value) => `${value * 100}%`);
  const glow = useMotionTemplate`radial-gradient(340px circle at ${glowX} ${glowY}, rgba(63,21,33,0.18), transparent 70%)`;

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const handleEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && images.length > 1) setImageIndex(1);
  };

  const handleLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    pointerX.set(0.5);
    pointerY.set(0.5);
    setImageIndex(0);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLAnchorElement>) => {
    const touch = event.touches[0];
    if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLAnchorElement>) => {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY) || images.length < 2) {
      return;
    }

    didSwipe.current = true;
    setImageIndex((current) =>
      (current + (deltaX < 0 ? 1 : -1) + images.length) % images.length,
    );
    window.setTimeout(() => {
      didSwipe.current = false;
    }, 800);
  };

  const handleTouchCancel = () => {
    touchStart.current = null;
  };

  const soldOut = isProductSoldOut(product);
  const previousImage = () =>
    setImageIndex((current) => (current - 1 + images.length) % images.length);
  const nextImage = () => setImageIndex((current) => (current + 1) % images.length);

  return (
    <div
      ref={cardRef}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="group relative h-full w-full"
    >
      <div className="flex h-full w-full flex-col">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Link
            href={productPath(product.id)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            onClick={(event) => {
              if (!didSwipe.current) return;
              event.preventDefault();
              event.stopPropagation();
              didSwipe.current = false;
            }}
            className="absolute inset-0 block cursor-pointer touch-pan-y"
            aria-label={`${product.name}, ${formatPrice(product.price)}`}
          >
            <Image
              src={images[activeImageIndex] ?? product.image}
              alt={`${product.name}, ${product.subtitle}`}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
              className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />
            {!reduceMotion && (
              <motion.div
                aria-hidden
                style={{ background: glow }}
                className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
            {images.length > 1 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden"
              >
                {images.map((image, index) => (
                  <span
                    key={image}
                    className={`h-1 rounded-full transition-all ${
                      index === activeImageIndex ? "w-5 bg-white" : "w-1 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            ) : null}
            {availableColors.length ? (
              <div
                role="img"
                aria-label={`Colori disponibili: ${availableColors.join(", ")}`}
                className="pointer-events-none absolute bottom-2 right-2 z-10 flex flex-wrap justify-end gap-1.5"
              >
                {availableColors.map((color) => (
                  <span
                    key={color}
                    title={color}
                    className="h-3 w-3 border border-white/80 shadow-[0_1px_4px_rgba(0,0,0,0.65)]"
                    style={{ backgroundColor: getColorLook(color).hex }}
                  />
                ))}
              </div>
            ) : null}
            {soldOut ? (
              <SoldOutLabel className="absolute left-4 top-4 sm:left-5 sm:top-5" />
            ) : null}
          </Link>
          {product.uuid ? (
            <FavoriteButton
              productId={product.uuid}
              productName={product.name}
              className="absolute right-3 top-3 z-20"
            />
          ) : null}
          {images.length > 1 ? (
            <div className="absolute inset-x-2 top-1/2 z-20 hidden -translate-y-1/2 justify-between md:flex">
              <button
                type="button"
                onClick={previousImage}
                aria-label={`Foto precedente di ${product.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/65 text-white opacity-0 backdrop-blur transition-opacity hover:bg-ink/85 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label={`Foto successiva di ${product.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/65 text-white opacity-0 backdrop-blur transition-opacity hover:bg-ink/85 group-hover:opacity-100 focus-visible:opacity-100"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>

        <Link
          href={productPath(product.id)}
          className="flex min-h-[4.75rem] flex-col items-center px-2 pt-2 text-center sm:min-h-[5.25rem] sm:pt-2.5"
          aria-label={`${product.name}, ${formatPrice(product.price)}`}
        >
          <p className="font-display halo-product-name text-[1.35rem] leading-[1.05] tracking-[-0.02em] sm:text-[1.7rem]">
            {product.name}
          </p>
          <div className="mt-1">
            {product.compareAt ? (
              <p className="text-xs text-ivory-dim line-through">{formatPrice(product.compareAt)}</p>
            ) : null}
            <p className="font-display text-lg text-halo-bright sm:text-xl">{formatPrice(product.price)}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
