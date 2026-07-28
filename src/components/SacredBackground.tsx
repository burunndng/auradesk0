import { memo, useRef } from "react";
import { Scarab } from "@/components/Scarab";
import { gsap, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap";

const SacredBackground = memo(function SacredBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const scarabRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.to(ring1Ref.current, {
        rotation: 360,
        duration: 120,
        repeat: -1,
        ease: "none",
      });

      gsap.to(ring2Ref.current, {
        rotation: -360,
        duration: 90,
        repeat: -1,
        ease: "none",
      });

      gsap.to(glowRef.current, {
        opacity: 0.6,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: EASE.gentle,
      });

      gsap.to(scarabRef.current, {
        scale: 1.02,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: EASE.gentle,
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="absolute inset-0" style={{ zIndex: 0, overflow: "hidden" }}>
      {/* Deep ambient glow */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(80vw, 700px)",
          height: "min(80vw, 700px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Rotating ring — sacred geometry orbit */}
      <div
        ref={ring1Ref}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(70vw, 620px)",
          height: "min(70vw, 620px)",
          borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.06)",
          pointerEvents: "none",
        }}
      />

      {/* Second ring — counter-rotation */}
      <div
        ref={ring2Ref}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(55vw, 490px)",
          height: "min(55vw, 490px)",
          borderRadius: "50%",
          border: "1px solid rgba(201,168,76,0.04)",
          pointerEvents: "none",
        }}
      />

      {/* Central scarab — the hero */}
      <div
        ref={scarabRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -54%)",
          width: "min(42vw, 380px)",
          pointerEvents: "none",
          filter: "drop-shadow(0 0 60px rgba(201,168,76,0.35)) drop-shadow(0 0 120px rgba(201,168,76,0.15))",
        }}
      >
        <Scarab size={380} style={{ width: "100%", height: "auto" }} />
      </div>

      {/* Brand text below scarab */}
      <div
        style={{
          position: "absolute",
          top: "calc(50% + 220px)",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          pointerEvents: "none",
          width: "100%",
        }}
      >
        <h1
          className="font-display"
          style={{
            fontSize: "1.4rem",
            letterSpacing: "0.55em",
            color: "var(--gilt-bright)",
            textIndent: "0.55em",
            textShadow: "0 0 24px rgba(201,168,76,0.5), 0 0 60px rgba(201,168,76,0.2)",
            margin: 0,
          }}
        >
          AURADESK
        </h1>
        <p
          className="font-serif"
          style={{
            letterSpacing: "0.35em",
            color: "var(--gilt-dim)",
            fontSize: "0.78rem",
            marginTop: 8,
            textIndent: "0.35em",
          }}
        >
          THE SACRED WORKSPACE
        </p>
      </div>

      {/* Subtle scanlines + vignette */}
      <div className="absolute inset-0 overlay-scanlines pointer-events-none" style={{ opacity: 0.08 }} />
      <div className="absolute inset-0 overlay-vignette pointer-events-none" style={{ opacity: 0.4 }} />
    </div>
  );
});

export default SacredBackground;
