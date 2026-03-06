import { useEffect, useState } from "react";

interface SeeneryLogoProps {
  variant?: "icon" | "sidebar" | "full";
  className?: string;
  animate?: boolean;
}

/**
 * Seenery logo: an open book with a thought bubble containing a tiny map,
 * connected by a curved arrow. Literary, minimal line art.
 * - icon: 32×32 mark only
 * - sidebar: mark + "Seenery" wordmark
 * - full: larger mark + wordmark + tagline stacked
 */
export function SeeneryLogo({ variant = "sidebar", className = "", animate = false }: SeeneryLogoProps) {
  const [phase, setPhase] = useState(animate ? 0 : 3);

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [animate]);

  const size = variant === "full" ? 64 : 32;

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Open book */}
      <g
        opacity={phase >= 1 ? 1 : 0}
        style={{ transition: "opacity 0.4s ease" }}
      >
        {/* Book spine */}
        <line x1="14" y1="26" x2="14" y2="36" stroke="currentColor" strokeWidth="1.8" />
        {/* Left page */}
        <path
          d="M14 26 Q8 27 5 29 L5 36 Q8 34 14 36"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Right page */}
        <path
          d="M14 26 Q20 27 23 29 L23 36 Q20 34 14 36"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Page lines left */}
        <line x1="7" y1="30.5" x2="12" y2="30" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
        <line x1="7.5" y1="32.5" x2="12" y2="32" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
        {/* Page lines right */}
        <line x1="16" y1="30" x2="21" y2="30.5" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
        <line x1="16" y1="32" x2="20.5" y2="32.5" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
      </g>

      {/* Curved arrow from book to thought bubble */}
      <path
        d="M17 26 Q22 20 26 16"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="2 2"
        opacity={phase >= 1 ? 0.5 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />
      {/* Arrow head */}
      <path
        d="M25 17.5 L26.5 15.5 L24 16"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={phase >= 1 ? 0.5 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Thought bubble - cloud shape */}
      <g
        opacity={phase >= 2 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      >
        <ellipse cx="30" cy="10" rx="9" ry="8" stroke="currentColor" strokeWidth="1.8" fill="none" />
        {/* Small bubble dots leading to arrow */}
        <circle cx="24" cy="16" r="1.2" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <circle cx="22" cy="19" r="0.7" stroke="currentColor" strokeWidth="0.6" fill="none" />
      </g>

      {/* Mini island map inside bubble */}
      <g
        opacity={phase >= 2 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      >
        {/* Tiny island */}
        <path
          d="M25 10 Q26 8 28 7.5 Q30 7 32 7.5 Q34 8.5 35 10 Q34 11 32 11.5 Q30 12 28 11.5 Q26 11 25 10 Z"
          stroke="currentColor"
          strokeWidth="0.9"
          fill="none"
        />
        {/* Pin dot on island */}
        <circle cx="30" cy="9.5" r="1" className="fill-primary" />
        {/* Water lines */}
        <line x1="24" y1="13" x2="36" y2="13" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
        <line x1="25" y1="14.5" x2="35" y2="14.5" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
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
      {mark}
      <span
        className="font-serif text-lg font-semibold tracking-tight text-foreground"
        style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.3s ease" }}
      >
        Seenery
      </span>
    </div>
  );
}
