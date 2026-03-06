import { useEffect, useState } from "react";

interface SeeneryLogoProps {
  variant?: "icon" | "sidebar" | "full";
  className?: string;
  animate?: boolean;
}

/**
 * Seenery "Mirror Map" logo mark:
 * A rectangular frame containing a dotted island above a horizon line
 * and a solid reflected island below — imagination made visible.
 */
export function SeeneryLogo({ variant = "sidebar", className = "", animate = false }: SeeneryLogoProps) {
  const [phase, setPhase] = useState(animate ? 0 : 5);

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setPhase(1), 100);   // frame
    const t2 = setTimeout(() => setPhase(2), 500);   // horizon
    const t3 = setTimeout(() => setPhase(3), 800);   // dotted island
    const t4 = setTimeout(() => setPhase(4), 1200);  // solid reflection
    const t5 = setTimeout(() => setPhase(5), 1500);  // wordmark
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [animate]);

  const size = variant === "full" ? 48 : 32;

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Outer frame — paper/card */}
      <rect
        x="2" y="2" width="28" height="28" rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeDasharray={phase >= 1 ? "0" : "120"}
        strokeDashoffset={phase >= 1 ? "0" : "120"}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
        opacity={phase >= 1 ? 1 : 0}
      />

      {/* Horizon line — centre */}
      <line
        x1="5" y1="16" x2="27" y2="16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray={phase >= 2 ? "0" : "22"}
        strokeDashoffset={phase >= 2 ? "0" : "22"}
        style={{ transition: "stroke-dashoffset 0.3s ease" }}
        opacity={phase >= 2 ? 1 : 0}
      />

      {/* Top half — dotted island (imagination) */}
      <g
        opacity={phase >= 3 ? 1 : 0}
        style={{ transition: "opacity 0.4s ease" }}
      >
        <path
          d="M10 12 Q11 9.5 13.5 9 Q16 8.5 18.5 9 Q21 9.5 22 12 Q20.5 13 18.5 13.5 Q16 14 13.5 13.5 Q11 13 10 12 Z"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 2"
          fill="none"
        />
        {/* Location dot */}
        <circle cx="16" cy="11" r="0.9" className="fill-primary" />
      </g>

      {/* Bottom half — solid reflection (made real) */}
      <g
        opacity={phase >= 4 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      >
        <path
          d="M10 20 Q11 22.5 13.5 23 Q16 23.5 18.5 23 Q21 22.5 22 20 Q20.5 19 18.5 18.5 Q16 18 13.5 18.5 Q11 19 10 20 Z"
          fill="currentColor"
          stroke="none"
        />
      </g>
    </svg>
  );

  if (variant === "icon") {
    return <span className={className}>{mark}</span>;
  }

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {mark}
        <span
          className="font-serif text-2xl font-semibold tracking-tight text-foreground"
          style={{ opacity: phase >= 5 ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          Seenery
        </span>
        <span
          className="text-xs text-muted-foreground"
          style={{ opacity: phase >= 5 ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          See your story's world.
        </span>
      </div>
    );
  }

  // sidebar variant
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {mark}
      <span
        className="font-serif text-lg font-semibold tracking-tight text-foreground"
        style={{ opacity: phase >= 5 ? 1 : 0, transition: "opacity 0.3s ease" }}
      >
        Seenery
      </span>
    </div>
  );
}
