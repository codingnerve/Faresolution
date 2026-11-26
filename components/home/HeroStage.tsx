"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, type ReactNode } from "react";

const SPRING = { stiffness: 90, damping: 20, mass: 0.8 };
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * 3D stage for the hero compare panel. The panel rises into place, then the
 * whole stack follows the pointer across the hero: the panel tilts a little
 * and the two depth sheets behind it drift further, so the layers separate.
 * Reduced motion and touch screens get the flat, static stack.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  // Pointer position relative to the viewport centre, -1..1.
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const sx = useSpring(nx, SPRING);
  const sy = useSpring(ny, SPRING);

  const rotateY = useTransform(sx, [-1, 1], [-7, 7]);
  const rotateX = useTransform(sy, [-1, 1], [6, -6]);
  const backX = useTransform(sx, [-1, 1], [-14, 14]);
  const backY = useTransform(sy, [-1, 1], [-10, 10]);
  const midX = useTransform(sx, [-1, 1], [-7, 7]);
  const midY = useTransform(sy, [-1, 1], [-5, 5]);

  useEffect(() => {
    if (reduceMotion) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    let frame = 0;
    const onMove = (event: globalThis.PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        nx.set((event.clientX / window.innerWidth) * 2 - 1);
        ny.set((event.clientY / window.innerHeight) * 2 - 1);
      });
    };
    const reset = () => {
      nx.set(0);
      ny.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", reset);
    };
  }, [reduceMotion, nx, ny]);

  return (
    <div className="relative [perspective:1400px]">
      {/* Depth sheets: brand-tinted cards stacked behind the panel. */}
      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.25, ease: EASE_OUT }}
        style={{ x: backX, translateY: backY }}
        className="absolute inset-0 hidden sm:block"
      >
        <div className="h-full w-full translate-x-7 -translate-y-7 rounded-lg border border-violet/25 bg-linear-to-br from-violet-tint via-coral-tint to-amber-tint" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: EASE_OUT }}
        style={{ x: midX, translateY: midY }}
        className="absolute inset-0 hidden sm:block"
      >
        <div className="h-full w-full translate-x-3.5 -translate-y-3.5 rounded-lg border border-blue/25 bg-linear-to-br from-blue-tint to-teal-tint" />
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 48, rotateX: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE_OUT }}
        className="relative [transform-style:preserve-3d]"
      >
        <motion.div style={{ rotateX, rotateY }} className="relative [transform-style:preserve-3d]">
          {children}
          {/* Floating fact chip, lifted off the panel in Z. */}
          <div
            aria-hidden="true"
            className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-[0.75rem] font-medium text-navy shadow-overlay [transform:translateZ(60px)] sm:flex"
          >
            <span className="flex gap-0.5">
              <span className="h-3 w-1 rounded-xs bg-blue" />
              <span className="h-3 w-1 rounded-xs bg-violet" />
              <span className="h-3 w-1 rounded-xs bg-coral" />
              <span className="h-3 w-1 rounded-xs bg-teal" />
            </span>
            Compare up to 4 products
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
