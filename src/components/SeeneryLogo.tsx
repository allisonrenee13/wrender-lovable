import { useEffect, useRef, useState } from "react";

interface WrenderLogoProps {
  variant?: "icon" | "sidebar" | "full";
  className?: string;
  animate?: boolean;
}

/**
 * Wrender logo: Open book with a map on the right page.
 * Built from scratch as clean SVG paths.
 */
export function SeeneryLogo({ variant = "sidebar", className = "", animate = false }: WrenderLogoProps) {
  const [phase, setPhase] = useState(animate ? 0 : 5);

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setPhase(1), 50);    // book draws
    const t2 = setTimeout(() => setPhase(2), 550);   // ruled lines fade
    const t3 = setTimeout(() => setPhase(3), 750);   // island traces
    const t4 = setTimeout(() => setPhase(4), 1150);  // navy dot
    const t5 = setTimeout(() => setPhase(5), 1300);  // wordmark
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [animate]);

  const bookRef = useRef<SVGPathElement>(null);
  const islandRef = useRef<SVGPathElement>(null);

  // Trigger stroke-dashoffset animation
  useEffect(() => {
    if (phase >= 1 && bookRef.current) {
      const len = bookRef.current.getTotalLength?.() || 120;
      bookRef.current.style.strokeDasharray = `${len}`;
      bookRef.current.style.strokeDashoffset = `${len}`;
      requestAnimationFrame(() => {
        if (bookRef.current) {
          bookRef.current.style.transition = "stroke-dashoffset 0.5s ease-in-out";
          bookRef.current.style.strokeDashoffset = "0";
        }
      });
    }
  }, [phase]);

  useEffect(() => {
    if (phase >= 3 && islandRef.current) {
      const len = islandRef.current.getTotalLength?.() || 60;
      islandRef.current.style.strokeDasharray = `${len}`;
      islandRef.current.style.strokeDashoffset = `${len}`;
      requestAnimationFrame(() => {
        if (islandRef.current) {
          islandRef.current.style.transition = "stroke-dashoffset 0.4s ease-in-out";
          islandRef.current.style.strokeDashoffset = "0";
        }
      });
    }
  }, [phase]);

  const size = variant === "full" ? 48 : variant === "sidebar" ? 28 : 32;

  const mark = (
    <img
      src="/wrender-logo-icon.png"
      alt="Wrender logo"
      width={size}
      height={size}
      className="flex-shrink-0"
      style={{ display: "block" }}
    />
  );

  if (variant === "icon") {
    return <span className={className}>{mark}</span>;
  }

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {mark}
        <span
          className="font-sans text-xl font-medium tracking-tight lowercase"
          style={{
            color: "#1a1a1a",
            opacity: animate ? (phase >= 5 ? 1 : 0) : 1,
            transition: animate ? "opacity 0.3s ease" : undefined,
          }}
        >
          wrender
        </span>
        <span
          className="font-sans text-[11px]"
          style={{
            color: "rgba(26,26,26,0.5)",
            opacity: animate ? (phase >= 5 ? 1 : 0) : 1,
            transition: animate ? "opacity 0.3s ease" : undefined,
          }}
        >
          Render your world. Write your story.
        </span>
      </div>
    );
  }

  // sidebar variant — mark + wordmark horizontal
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {mark}
      <span
        className="font-sans text-lg font-medium tracking-tight lowercase"
        style={{
          color: "#1a1a1a",
          opacity: animate ? (phase >= 5 ? 1 : 0) : 1,
          transition: animate ? "opacity 0.3s ease" : undefined,
        }}
      >
        wrender
      </span>
    </div>
  );
}
