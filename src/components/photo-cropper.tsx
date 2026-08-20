"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

const EXPORT_W = 1600;
const EXPORT_H = 2000;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

function editorSrc(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return `/api/admin/photo?src=${encodeURIComponent(src)}`;
  }
  return src;
}

type CropperProps = {
  src: string;
  title?: string;
  onCancel: () => void;
  onApply: (file: File) => Promise<void> | void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function coverScale(frameW: number, frameH: number, imgW: number, imgH: number) {
  return Math.max(frameW / imgW, frameH / imgH);
}

function clampPan(
  panX: number,
  panY: number,
  zoom: number,
  frameW: number,
  frameH: number,
  imgW: number,
  imgH: number,
) {
  const scale = coverScale(frameW, frameH, imgW, imgH) * zoom;
  const maxX = Math.max(0, (imgW * scale - frameW) / 2);
  const maxY = Math.max(0, (imgH * scale - frameH) / 2);
  return {
    x: clamp(panX, -maxX, maxX),
    y: clamp(panY, -maxY, maxY),
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      image.crossOrigin = "anonymous";
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Impossibile leggere la foto"));
    image.src = src;
  });
}

export async function rasterizeCrop({
  src,
  panX,
  panY,
  zoom,
  frameW,
  frameH,
  imgW,
  imgH,
}: {
  src: string;
  panX: number;
  panY: number;
  zoom: number;
  frameW: number;
  frameH: number;
  imgW: number;
  imgH: number;
}) {
  const image = await loadImage(src);
  const scale = coverScale(frameW, frameH, imgW, imgH) * zoom;
  const left = (frameW - imgW * scale) / 2 + panX;
  const top = (frameH - imgH * scale) / 2 + panY;
  const sx = clamp(-left / scale, 0, Math.max(0, imgW - frameW / scale));
  const sy = clamp(-top / scale, 0, Math.max(0, imgH - frameH / scale));
  const sw = Math.min(imgW - sx, frameW / scale);
  const sh = Math.min(imgH - sy, frameH / scale);

  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_W;
  canvas.height = EXPORT_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponibile");
  ctx.fillStyle = "#4C1C28";
  ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, EXPORT_W, EXPORT_H);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Esportazione non riuscita"))),
      "image/jpeg",
      0.92,
    );
  });
  return new File([blob], "inquadratura.jpg", { type: "image/jpeg" });
}

export function PhotoCropper({ src, title = "Inquadra la foto", onCancel, onApply }: CropperProps) {
  const imageSrc = editorSrc(src);
  const frameRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [frame, setFrame] = useState({ w: 320, h: 400 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  useEffect(() => {
    let cancelled = false;
    loadImage(imageSrc)
      .then((image) => {
        if (!cancelled) setImgSize({ w: image.naturalWidth, h: image.naturalHeight });
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Foto non leggibile");
      });
    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  const applyZoom = useCallback(
    (nextZoom: number) => {
      const zoomed = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      setZoom(zoomed);
      setPan((current) =>
        clampPan(current.x, current.y, zoomed, frame.w, frame.h, imgSize.w, imgSize.h),
      );
    },
    [frame.h, frame.w, imgSize.h, imgSize.w],
  );

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width && rect.height) setFrame({ w: rect.width, h: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      applyZoom(zoom * (event.deltaY > 0 ? 0.94 : 1.06));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      node.removeEventListener("wheel", onWheel);
    };
  }, [applyZoom, imgSize.w, zoom]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) {
      dragging.current = true;
      last.current = { x: event.clientX, y: event.clientY };
    }
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        zoom,
      };
      dragging.current = false;
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current.distance > 0) {
        applyZoom(pinch.current.zoom * (distance / pinch.current.distance));
      }
      return;
    }

    if (!dragging.current) return;
    const dx = event.clientX - last.current.x;
    const dy = event.clientY - last.current.y;
    last.current = { x: event.clientX, y: event.clientY };
    setPan((current) =>
      clampPan(current.x + dx, current.y + dy, zoom, frame.w, frame.h, imgSize.w, imgSize.h),
    );
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) dragging.current = false;
  };

  const handleApply = async () => {
    if (!imgSize.w || busy) return;
    setBusy(true);
    setError("");
    try {
      const file = await rasterizeCrop({
        src: imageSrc,
        panX: pan.x,
        panY: pan.y,
        zoom,
        frameW: frame.w,
        frameH: frame.h,
        imgW: imgSize.w,
        imgH: imgSize.h,
      });
      await onApply(file);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ritaglio non riuscito");
      setBusy(false);
    }
  };

  const scale = imgSize.w ? coverScale(frame.w, frame.h, imgSize.w, imgSize.h) * zoom : 1;
  const drawW = imgSize.w * scale;
  const drawH = imgSize.h * scale;

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-ink"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquadra-titolo"
    >
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 sm:px-6">
        <div>
          <p id="inquadra-titolo" className="font-display text-2xl leading-none">
            {title}
          </p>
          <p className="mt-1 text-xs text-ivory-dim">
            Trascina per spostare, pinch o rotella per lo zoom.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-full border border-ink-line px-4 py-2 text-sm hover:border-halo/60 hover:text-halo-bright"
        >
          <X className="h-4 w-4" aria-hidden />
          Annulla
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-2">
        <div
          ref={frameRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative aspect-[4/5] h-[min(68dvh,32rem)] w-auto cursor-grab touch-none overflow-hidden rounded-2xl border border-ink-line bg-ink-soft active:cursor-grabbing"
        >
          {imgSize.w > 0 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt=""
              draggable={false}
              className="absolute max-w-none select-none"
              style={{
                width: drawW,
                height: drawH,
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px)`,
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-ivory/15" />
          <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-ink-line bg-ink/70 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-ivory-dim backdrop-blur">
            Card 4:5
          </p>
        </div>
      </div>

      <div className="space-y-4 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8">
        <label className="block text-sm text-ivory-dim">
          Zoom
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(event) => applyZoom(Number(event.target.value))}
            className="mt-2 w-full accent-halo"
          />
        </label>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-full border border-ink-line px-4 py-2 text-sm"
          >
            <X className="h-4 w-4" aria-hidden />
            Annulla
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={busy || !imgSize.w}
            className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2 text-sm font-medium text-ink disabled:opacity-40"
          >
            <Check className="h-4 w-4" aria-hidden />
            {busy ? "Attendi" : "Applica"}
          </button>
        </div>
      </div>
    </div>
  );
}
