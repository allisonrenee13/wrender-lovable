import { useEffect, useState } from "react";

interface SeeneryLogoProps {
  variant?: "icon" | "sidebar" | "full";
  className?: string;
  animate?: boolean;
}

/**
 * Monocle logo: circular lens with island inside + optional wordmark.
 * - icon: 32×32 monocle only
 * - sidebar: monocle + "Seenery" wordmark
 * - full: larger monocle + wordmark + tagline stacked
 */
export function SeeneryLogo({ variant = "sidebar", className = "", animate = false }: SeeneryLogoProps) {
  const [phase, setPhase] = useState(animate ? 0 : 3);

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setPhase(1), 600); // circle done
    const t2 = setTimeout(() => setPhase(2), 900); // island visible
    const t3 = setTimeout(() => setPhase(3), 1200); // wordmark visible
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [animate]);

  const size = variant === "full" ? 64 : 32;

  const monocle = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Monocle frame circle */}
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray={animate ? "81.68" : "none"}
        strokeDashoffset={animate && phase < 1 ? "81.68" : "0"}
        style={animate ? { transition: "stroke-dashoffset 0.6s ease" } : undefined}
      />

      {/* Handle/chain from bottom-right */}
      <path
        d="M26.5 26.5 Q30 30 32 33"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity={phase >= 1 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Water lines inside lens */}
      <g
        opacity={phase >= 2 ? 0.15 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      >
        <line x1="7" y1="20" x2="25" y2="20" stroke="currentColor" strokeWidth="0.6" />
        <line x1="8" y1="22.5" x2="24" y2="22.5" stroke="currentColor" strokeWidth="0.6" />
        <line x1="9.5" y1="25" x2="22.5" y2="25" stroke="currentColor" strokeWidth="0.6" />
      </g>

      {/* Island outline */}
      <path
        d="M9 16.5 Q10 14 12 13.5 Q14 12.5 16 13 Q18 12.5 20 13.5 Q22 14.5 23 16 Q22.5 17 21 17.5 Q19 18.5 16.5 18 Q14 18.5 12 17.5 Q10 17 9 16.5 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity={phase >= 2 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Location pin dot */}
      <circle
        cx="16"
        cy="15"
        r="1.3"
        className="fill-primary"
        opacity={phase >= 2 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />
    </svg>
  );

  if (variant === "icon") {
    return <span className={className}>{monocle}</span>;
  }

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {monocle}
        <span
          className="font-serif text-2xl font-semibold tracking-tight text-foreground"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          Seenery
        </span>
        <span
          className="text-xs text-muted-foreground"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          See your story's world.
        </span>
      </div>
    );
  }

  // sidebar variant
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {monocle}
      <span
        className="font-serif text-lg font-semibold tracking-tight text-foreground"
        style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.3s ease" }}
      >
        Seenery
      </span>
    </div>
  );
}
