"use client";

import { motion, useReducedMotion } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Distanza di partenza in pixel lungo l'asse verticale */
  offset?: number;
  as?: "div" | "section" | "li" | "p" | "span";
};

export function Reveal({
  children,
  className,
  delay = 0,
  offset = 28,
  as = "div",
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}

/**
 * Titolo che entra parola per parola.
 * Il trigger sta sul contenitore e non sulle parole: queste partono fuori dalla
 * maschera, quindi risultano completamente clippate e un observer messo su di
 * loro non le vedrebbe mai entrare in viewport.
 */
export function RevealWords({
  text,
  className,
  wordClassName,
  delay = 0,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="mask-reveal inline-block">
          <motion.span
            className={`inline-block ${wordClassName ?? ""}`}
            variants={{
              hidden: reduceMotion
                ? { y: 0, opacity: 0 }
                : { y: "110%", opacity: 1 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
