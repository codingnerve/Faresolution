"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useState, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

/** True when a fine pointer can hover (not touch) and motion is allowed. */
function useCanTilt() {
  const reduceMotion = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return finePointer && !reduceMotion;
}

type TiltProps = {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees at the card edge. */
  max?: number;
  /** Lift towards the viewer while hovered, in px. */
  lift?: number;
  /** Show the soft light reflection that follows the pointer. */
  glare?: boolean;
};

/**
 * Pointer-driven 3D tilt for a card. The card rotates towards the pointer on
 * springs and lifts slightly; children keep their own layout. Touch devices
 * and reduced-motion users get the static card.
 */
export function Tilt({ children, className, max = 6, lift = 6, glare = true }: TiltProps) {
  const enabled = useCanTilt();
  // Pointer position within the card, 0..1 on each axis (0.5 = centre).
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);

  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING);
  const z = useSpring(useTransform(hover, [0, 1], [0, lift]), SPRING);
  const glareOpacity = useSpring(hover, SPRING);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, rgb(255 255 255 / 0.55), transparent 55%)`;

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  }

  function onLeave() {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  }

  if (!enabled) return <div className={cn("h-full", className)}>{children}</div>;

  return (
    <div className={cn("h-full [perspective:1100px]", className)}>
      <motion.div
        onPointerEnter={() => hover.set(1)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, z, transformStyle: "preserve-3d" }}
        className="relative h-full rounded-lg"
      >
        {children}
        {glare && (
          <motion.span
            aria-hidden="true"
            style={{ opacity: glareOpacity, backgroundImage: glareBg }}
            className="pointer-events-none absolute inset-0 rounded-lg mix-blend-soft-light"
          />
        )}
      </motion.div>
    </div>
  );
}
