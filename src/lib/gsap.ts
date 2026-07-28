import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

gsap.defaults({
  duration: 0.5,
  ease: "power3.out",
});

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const EASE = {
  spring: "back.out(1.4)",
  springStrong: "back.out(2)",
  decelerate: "power3.out",
  smooth: "power2.inOut",
  snap: "power4.out",
  gentle: "sine.inOut",
} as const;

export const DUR = {
  instant: 0.15,
  fast: 0.25,
  normal: 0.4,
  slow: 0.6,
  reveal: 0.8,
} as const;

export { gsap, useGSAP };
