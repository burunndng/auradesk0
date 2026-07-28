import { memo, useRef } from "react";
import { Scarab } from "@/components/Scarab";
import { gsap, useGSAP, EASE, DUR, prefersReducedMotion } from "@/lib/gsap";

const BootSequence = memo(function BootSequence({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scarabWrapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const barWrapRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        onComplete();
        return;
      }

      const tl = gsap.timeline({ onComplete });

      tl.set(
        [scarabWrapRef.current, titleRef.current, subtitleRef.current, barWrapRef.current],
        { autoAlpha: 0 }
      );

      tl.fromTo(
        glowRef.current,
        { scale: 0.6, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: DUR.reveal, ease: EASE.decelerate },
        0
      );

      tl.fromTo(
        scarabWrapRef.current,
        { scale: 0.8, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: DUR.reveal,
          ease: EASE.spring,
        },
        0.1
      );

      tl.fromTo(
        titleRef.current,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: DUR.normal, ease: EASE.decelerate },
        0.5
      );

      tl.fromTo(
        subtitleRef.current,
        { y: 16, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: DUR.normal, ease: EASE.decelerate },
        0.75
      );

      tl.fromTo(
        barWrapRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: DUR.fast, ease: EASE.decelerate },
        1.0
      );

      tl.fromTo(
        barFillRef.current,
        { xPercent: -100 },
        { xPercent: 100, duration: 1.6, ease: "power1.inOut" },
        1.0
      );

      tl.to(
        [scarabWrapRef.current, titleRef.current, subtitleRef.current, barWrapRef.current],
        {
          autoAlpha: 0,
          scale: 1.02,
          duration: DUR.slow,
          ease: EASE.decelerate,
          stagger: 0.05,
        },
        2.8
      );

      tl.to(
        glowRef.current,
        { autoAlpha: 0, duration: DUR.slow, ease: EASE.decelerate },
        2.9
      );
    },
    { scope: rootRef, dependencies: [onComplete] }
  );

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        gap: 34,
        background:
          "radial-gradient(ellipse at center, #0d0a06 0%, #020101 80%)",
      }}
    >
      {/* Ambient glow */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Scarab emblem */}
      <div ref={scarabWrapRef}>
        <Scarab size={180} />
      </div>

      {/* Brand title */}
      <div
        ref={titleRef}
        className="font-display"
        style={{
          fontSize: "2.2rem",
          letterSpacing: "0.5em",
          color: "var(--gilt-bright)",
          textIndent: "0.5em",
          textShadow: "0 0 24px rgba(201,168,76,0.5)",
        }}
      >
        AURA<span style={{ color: "var(--gilt)" }}>DESK</span>
      </div>

      {/* Subtitle */}
      <div
        ref={subtitleRef}
        className="font-serif"
        style={{
          fontSize: "0.95rem",
          letterSpacing: "0.4em",
          color: "var(--gilt-dim)",
          textIndent: "0.4em",
        }}
      >
        THE SACRED WORKSPACE AWAKENS
      </div>

      {/* Loading bar */}
      <div
        ref={barWrapRef}
        style={{
          width: 220,
          height: 2,
          background: "rgba(201,168,76,0.12)",
          position: "relative",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <div
          ref={barFillRef}
          style={{
            position: "absolute",
            top: 0,
            height: "100%",
            width: "40%",
            background:
              "linear-gradient(90deg, transparent, var(--gilt-bright), transparent)",
          }}
        />
      </div>
    </div>
  );
});

export default BootSequence;
