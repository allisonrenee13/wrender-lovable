import { useEffect, useState } from "react";

interface SeeneryLogoProps {
  variant?: "icon" | "sidebar" | "full";
  className?: string;
  animate?: boolean;
}

/**
 * Seenery logo mark: An open book with a map sketch on the page.
 * The book is open, and on the right page you can see a tiny island line drawing.
 */
export function SeeneryLogo({ variant = "sidebar", className = "", animate = false }: SeeneryLogoProps) {
  const [phase, setPhase] = useState(animate ? 0 : 5);

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setPhase(1), 100);   // book spine
    const t2 = setTimeout(() => setPhase(2), 400);   // pages
    const t3 = setTimeout(() => setPhase(3), 700);   // map on page
    const t4 = setTimeout(() => setPhase(4), 1000);  // pin dot
    const t5 = setTimeout(() => setPhase(5), 1200);  // wordmark
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
      {/* Book spine — centre vertical */}
      <line
        x1="16" y1="6" x2="16" y2="26"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity={phase >= 1 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Left page */}
      <path
        d="M16 6 Q14 5 6 7 L6 25 Q14 23 16 24"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        opacity={phase >= 2 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Right page */}
      <path
        d="M16 6 Q18 5 26 7 L26 25 Q18 23 16 24"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        opacity={phase >= 2 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Map on right page — tiny island outline */}
      <g
        opacity={phase >= 3 ? 1 : 0}
        style={{ transition: "opacity 0.4s ease" }}
      >
        <path
          d="M18.5 13 Q19.5 11 21 10.8 Q22.5 10.5 23.5 11.5 Q24.2 12.5 24 13.5 Q23 14.5 21.5 14.8 Q19.5 15 18.5 13 Z"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Tiny water lines */}
        <line x1="18" y1="16" x2="25" y2="16" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
        <line x1="18.5" y1="17.5" x2="24.5" y2="17.5" stroke="currentColor" strokeWidth="0.4" opacity="0.1" />
      </g>

      {/* Location pin dot on the island */}
      <circle
        cx="21.5" cy="12.5" r="0.9"
        className="fill-primary"
        opacity={phase >= 4 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Left page — faint text lines */}
      <g
        opacity={phase >= 3 ? 0.2 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      >
        <line x1="8" y1="11" x2="14" y2="10" stroke="currentColor" strokeWidth="0.5" />
        <line x1="8" y1="13.5" x2="14" y2="12.5" stroke="currentColor" strokeWidth="0.5" />
        <line x1="8" y1="16" x2="13" y2="15" stroke="currentColor" strokeWidth="0.5" />
        <line x1="8" y1="18.5" x2="14" y2="17.5" stroke="currentColor" strokeWidth="0.5" />
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
        Wrender
        </span>
        <span
          className="text-xs text-muted-foreground"
          style={{ opacity: phase >= 5 ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          Render your world. Write your story.
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
        Wrender
      </span>
    </div>
  );
}
