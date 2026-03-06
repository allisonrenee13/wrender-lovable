import { useEffect, useState } from "react";

interface SeeneryLogoProps {
  variant?: "icon" | "sidebar" | "full";
  className?: string;
  animate?: boolean;
}

/**
 * Wrender logo mark: An open book with a hand-drawn map on the right page.
 * Wordmark is lowercase sans-serif "wrender".
 */
export function SeeneryLogo({ variant = "sidebar", className = "", animate = false }: SeeneryLogoProps) {
  const [phase, setPhase] = useState(animate ? 0 : 5);

  useEffect(() => {
    if (!animate) return;
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 400);
    const t3 = setTimeout(() => setPhase(3), 700);
    const t4 = setTimeout(() => setPhase(4), 1000);
    const t5 = setTimeout(() => setPhase(5), 1200);
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
      {/* Book spine */}
      <line
        x1="16" y1="6" x2="16" y2="26"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity={phase >= 1 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />
      {/* Left page */}
      <path
        d="M16 6 Q14 5 6 7 L6 25 Q14 23 16 24"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity={phase >= 2 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />
      {/* Right page */}
      <path
        d="M16 6 Q18 5 26 7 L26 25 Q18 23 16 24"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity={phase >= 2 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />
      {/* Left page faint ruled lines */}
      <g opacity={phase >= 3 ? 0.15 : 0} style={{ transition: "opacity 0.3s ease" }}>
        <line x1="8" y1="11" x2="14" y2="10" stroke="currentColor" strokeWidth="0.4" />
        <line x1="8" y1="13.5" x2="14" y2="12.5" stroke="currentColor" strokeWidth="0.4" />
        <line x1="8" y1="16" x2="13" y2="15" stroke="currentColor" strokeWidth="0.4" />
        <line x1="8" y1="18.5" x2="14" y2="17.5" stroke="currentColor" strokeWidth="0.4" />
      </g>
      {/* Right page: organic island outline */}
      <g opacity={phase >= 3 ? 1 : 0} style={{ transition: "opacity 0.4s ease" }}>
        <path
          d="M18.5 13 Q19.2 11.2 20.8 10.8 Q22.2 10.4 23.3 11.2 Q24 12.2 23.8 13.2 Q23 14.2 21.5 14.6 Q19.8 14.8 18.5 13Z"
          stroke="currentColor" strokeWidth="0.7" fill="none"
        />
        <line x1="18.2" y1="16" x2="24.8" y2="16" stroke="currentColor" strokeWidth="0.3" opacity="0.12" />
        <line x1="18.8" y1="17.3" x2="24.2" y2="17.3" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
      </g>
      {/* Navy location dot */}
      <circle
        cx="21.2" cy="12.3" r="0.7"
        className="fill-primary"
        opacity={phase >= 4 ? 1 : 0}
        style={{ transition: "opacity 0.3s ease" }}
      />
      {/* Tiny compass rose */}
      <g opacity={phase >= 4 ? 0.35 : 0} style={{ transition: "opacity 0.3s ease" }}>
        <line x1="24.5" y1="18.5" x2="24.5" y2="21.5" stroke="currentColor" strokeWidth="0.35" />
        <line x1="23" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth="0.35" />
        <text x="24.5" y="18.2" textAnchor="middle" fill="currentColor" fontSize="1.8" fontFamily="serif" opacity="0.6">N</text>
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
          className="font-sans text-2xl font-medium tracking-tight text-foreground lowercase"
          style={{ opacity: phase >= 5 ? 1 : 0, transition: "opacity 0.3s ease" }}
        >
          wrender
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
        className="font-sans text-lg font-medium tracking-tight text-foreground lowercase"
        style={{ opacity: phase >= 5 ? 1 : 0, transition: "opacity 0.3s ease" }}
      >
        wrender
      </span>
    </div>
  );
}
