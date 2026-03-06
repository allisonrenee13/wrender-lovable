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
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Book outline: two pages meeting at a V-spine at the bottom centre */}
      {/* Left page: curves up-left from spine, slight curl at top-right corner */}
      {/* Right page: curves up-right from spine, slight curl at top-left corner */}
      <path
        ref={animate ? bookRef : undefined}
        d={[
          // Start at top-left corner of left page (slight upward curl)
          "M 5.5 8",
          // Left page top edge curving gently inward
          "Q 5 7.5 6 7.2",
          // Across to spine top
          "L 15.5 6.5",
          // Down the right side of the left page (the spine)
          "Q 16 7 16 8",
          // Down spine to bottom
          "L 16 25",
          // Back up the left side of the right page (spine)
          "M 16 25",
          "L 16 8",
          "Q 16 7 16.5 6.5",
          // Right page top edge
          "L 26 7.2",
          "Q 27 7.5 26.5 8",
          // Right page outer edge
          "L 26.5 24",
          // Right page bottom edge curving to spine
          "Q 26 24.5 16 25",
          // Left page bottom edge curving from spine
          "M 16 25",
          "Q 6 24.5 5.5 24",
          // Left page outer edge back to top
          "L 5.5 8",
        ].join(" ")}
        stroke="#1a1a1a"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={animate ? (phase >= 1 ? 1 : 0) : 1}
      />

      {/* Spine centre line — subtle V */}
      <line
        x1="16" y1="7" x2="16" y2="25"
        stroke="#1a1a1a"
        strokeWidth="0.8"
        opacity={animate ? (phase >= 1 ? 0.5 : 0) : 0.5}
        style={animate ? { transition: "opacity 0.3s ease" } : undefined}
      />

      {/* Left page — faint ruled lines */}
      <g
        opacity={animate ? (phase >= 2 ? 0.15 : 0) : 0.15}
        style={animate ? { transition: "opacity 0.2s ease" } : undefined}
      >
        <line x1="7.5" y1="11" x2="14" y2="10.2" stroke="#1a1a1a" strokeWidth="0.75" />
        <line x1="7.5" y1="14" x2="14" y2="13.2" stroke="#1a1a1a" strokeWidth="0.75" />
        <line x1="7.5" y1="17" x2="14" y2="16.2" stroke="#1a1a1a" strokeWidth="0.75" />
      </g>

      {/* Right page — island outline */}
      {/* Barrier island shape: wider in middle, tapering at ends, slightly irregular */}
      <path
        ref={animate ? islandRef : undefined}
        d="M 19.2 13.8 Q 19.5 12.5 20.5 11.8 Q 21.3 11.2 22.2 11 Q 23 10.9 23.6 11.3 Q 24.2 11.8 24.3 12.6 Q 24.3 13.4 23.8 14 Q 23.2 14.6 22.3 14.9 Q 21.2 15.2 20.2 14.8 Q 19.4 14.5 19.2 13.8 Z"
        stroke="#1a1a1a"
        strokeWidth="1"
        fill="none"
        strokeLinejoin="round"
        opacity={animate ? (phase >= 3 ? 1 : 0) : 1}
      />

      {/* Navy location dot on the island */}
      <circle
        cx="21.8"
        cy="12.8"
        r="0.9"
        fill="#1B2A4A"
        opacity={animate ? (phase >= 4 ? 1 : 0) : 1}
        style={animate ? { transition: "opacity 0.15s ease" } : undefined}
      />

      {/* Faint water lines below island */}
      <g
        opacity={animate ? (phase >= 3 ? 0.2 : 0) : 0.2}
        style={animate ? { transition: "opacity 0.3s ease" } : undefined}
      >
        <line x1="18.5" y1="16.5" x2="25" y2="16.5" stroke="#1a1a1a" strokeWidth="0.75" />
        <line x1="19" y1="18" x2="24.5" y2="18" stroke="#1a1a1a" strokeWidth="0.75" />
      </g>

      {/* Tiny compass rose — bottom right of right page */}
      <g
        opacity={animate ? (phase >= 3 ? 0.3 : 0) : 0.3}
        style={animate ? { transition: "opacity 0.3s ease" } : undefined}
      >
        {/* N-S line */}
        <line x1="24.5" y1="19.5" x2="24.5" y2="22.5" stroke="#1a1a1a" strokeWidth="0.75" />
        {/* E-W line */}
        <line x1="23" y1="21" x2="26" y2="21" stroke="#1a1a1a" strokeWidth="0.75" />
        {/* N indicator — tiny triangle */}
        <text x="24.5" y="19.2" textAnchor="middle" fill="#1a1a1a" fontSize="2" fontFamily="DM Sans, sans-serif" opacity="0.7">N</text>
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
