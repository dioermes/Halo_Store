"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * L'alone che da il nome al negozio: una luce salvia che segue il puntatore.
 * Disattivato su dispositivi touch e quando l'utente chiede meno animazioni.
 */
export function HaloCursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glowX = useSpring(x, { stiffness: 120, damping: 22, mass: 0.6 });
  const glowY = useSpring(y, { stiffness: 120, damping: 22, mass: 0.6 });
  const ringX = useSpring(x, { stiffness: 420, damping: 32, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: 420, damping: 32, mass: 0.4 });

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || reduceMotion) return;

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, reduceMotion, x, y]);

  if (!enabled || reduceMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
      <motion.div
        className="absolute h-[720px] w-[720px] rounded-full mix-blend-multiply"
        style={{
          x: glowX,
          y: glowY,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(63,21,33,0.16) 0%, rgba(63,21,33,0.05) 36%, transparent 70%)",
        }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.55 }}
      />
      <motion.div
        className="absolute h-6 w-6 rounded-full border border-halo/70"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{ opacity: visible ? 0.8 : 0 }}
        transition={{ duration: 0.25 }}
      />
    </div>
  );
}
