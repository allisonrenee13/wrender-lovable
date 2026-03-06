import { islaSerranoLocations } from "@/data/isla-serrano";

interface IslaSerranoMapProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
}

const IslaSerranoMap = ({ selectedLocationId, onSelectLocation }: IslaSerranoMapProps) => {
  return (
    <div className="w-full flex justify-center py-6">
      <svg
        viewBox="0 0 600 700"
        className="w-full max-w-[600px] h-auto"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {/* Cream background */}
        <rect width="600" height="700" fill="#faf8f4" rx="4" />

        {/* Title banner */}
        <text x="300" y="32" textAnchor="middle" fontSize="18" fontWeight="600" fill="#1a1a1a" letterSpacing="3">
          ISLA SERRANO
        </text>
        <line x1="220" y1="40" x2="380" y2="40" stroke="#1a1a1a" strokeWidth="0.5" />

        {/* Ocean label — east */}
        <text x="520" y="350" textAnchor="middle" fontSize="11" fill="#8a9bb5" fontStyle="italic" letterSpacing="2" transform="rotate(90, 520, 350)">
          ATLANTIC OCEAN
        </text>

        {/* Bay label — west */}
        <text x="100" y="350" textAnchor="middle" fontSize="11" fill="#8a9bb5" fontStyle="italic" letterSpacing="2" transform="rotate(-90, 100, 350)">
          BISCAYNE BAY
        </text>

        {/* Bay hatching — west side */}
        <g stroke="#c8d4e0" strokeWidth="0.4" opacity="0.5">
          {Array.from({ length: 25 }).map((_, i) => (
            <line key={`bh-${i}`} x1={140 + i * 3} y1={100 + i * 8} x2={130 + i * 2} y2={120 + i * 8} />
          ))}
        </g>

        {/* Beach texture — east side */}
        <g fill="#d4c9a8" opacity="0.4">
          {Array.from({ length: 30 }).map((_, i) => (
            <circle key={`bt-${i}`} cx={390 + Math.sin(i * 1.3) * 15} cy={100 + i * 17} r={1} />
          ))}
        </g>

        {/* Causeway — road from north */}
        <path
          d="M 300 0 L 300 55 Q 300 65 300 80"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeDasharray="6 3"
        />
        {/* Causeway bridge rails */}
        <line x1="294" y1="10" x2="294" y2="70" stroke="#1a1a1a" strokeWidth="0.5" />
        <line x1="306" y1="10" x2="306" y2="70" stroke="#1a1a1a" strokeWidth="0.5" />

        {/* Island outline — organic, hand-drawn style */}
        <path
          d="
            M 300 75
            Q 330 72, 345 85
            Q 370 100, 365 120
            Q 375 135, 370 155
            Q 380 180, 375 200
            Q 385 225, 378 250
            Q 382 275, 375 295
            Q 380 315, 370 335
            Q 378 355, 372 375
            Q 380 400, 368 420
            Q 365 445, 355 460
            Q 348 480, 338 500
            Q 330 520, 322 540
            Q 315 560, 308 575
            Q 303 588, 300 600
            Q 297 588, 292 575
            Q 285 560, 278 540
            Q 270 520, 262 500
            Q 252 480, 245 460
            Q 235 445, 232 420
            Q 220 400, 228 375
            Q 222 355, 230 335
            Q 220 315, 225 295
            Q 218 275, 222 250
            Q 215 225, 225 200
            Q 220 180, 230 155
            Q 225 135, 235 120
            Q 230 100, 255 85
            Q 270 72, 300 75
            Z
          "
          fill="#f5f0e6"
          stroke="#1a1a1a"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Internal road — dotted path through island */}
        <path
          d="M 300 85 Q 305 120, 310 160 Q 315 200, 305 250 Q 298 300, 300 350 Q 302 400, 300 450 Q 298 500, 300 560"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="0.7"
          strokeDasharray="4 3"
        />

        {/* Palm tree clusters — green areas */}
        <g stroke="#5a7a5a" fill="none" strokeWidth="1" opacity="0.6">
          {/* North trees */}
          <path d="M 270 130 Q 268 120 275 115 M 270 130 Q 272 120 265 115 M 270 130 L 270 138" />
          <path d="M 280 140 Q 278 130 285 125 M 280 140 Q 282 130 275 125 M 280 140 L 280 148" />
          {/* Mid trees */}
          <path d="M 255 340 Q 253 330 260 325 M 255 340 Q 257 330 250 325 M 255 340 L 255 348" />
          <path d="M 265 350 Q 263 340 270 335 M 265 350 Q 267 340 260 335 M 265 350 L 265 358" />
          <path d="M 320 360 Q 318 350 325 345 M 320 360 Q 322 350 315 345 M 320 360 L 320 368" />
          {/* South trees */}
          <path d="M 290 510 Q 288 500 295 495 M 290 510 Q 292 500 285 495 M 290 510 L 290 518" />
          <path d="M 310 530 Q 308 520 315 515 M 310 530 Q 312 520 305 515 M 310 530 L 310 538" />
        </g>

        {/* Mangrove marks — west bay side */}
        <g stroke="#6a8a6a" strokeWidth="0.6" fill="none" opacity="0.4">
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={`mg-${i}`} d={`M ${225 + Math.sin(i) * 5} ${200 + i * 35} q -8 -5 -3 -12 m 3 12 q -10 -2 -8 -10`} />
          ))}
        </g>

        {/* Location markers */}
        {islaSerranoLocations.map((loc) => {
          const isSelected = selectedLocationId === loc.id;
          return (
            <g
              key={loc.id}
              className="cursor-pointer"
              onClick={() => onSelectLocation(isSelected ? null : loc.id)}
            >
              {/* Pulse animation ring */}
              {isSelected && (
                <circle cx={loc.x} cy={loc.y} r="14" fill="none" stroke="hsl(var(--secondary))" strokeWidth="1.5" opacity="0.6">
                  <animate attributeName="r" from="10" to="20" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Location-specific icons */}
              {loc.type === "hotel" && (
                <>
                  <rect x={loc.x - 7} y={loc.y - 8} width="14" height="10" fill="none" stroke="#1a1a1a" strokeWidth="1" rx="1" />
                  <line x1={loc.x} y1={loc.y - 8} x2={loc.x} y2={loc.y - 14} stroke="#1a1a1a" strokeWidth="0.8" />
                  <path d={`M ${loc.x} ${loc.y - 14} l 5 2 l -5 2`} fill="hsl(var(--secondary))" stroke="none" />
                </>
              )}
              {loc.type === "residence" && (
                <path
                  d={`M ${loc.x - 6} ${loc.y + 3} L ${loc.x - 6} ${loc.y - 3} L ${loc.x} ${loc.y - 9} L ${loc.x + 6} ${loc.y - 3} L ${loc.x + 6} ${loc.y + 3} Z`}
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="1"
                />
              )}
              {loc.type === "landmark" && (
                <>
                  <rect x={loc.x - 3} y={loc.y - 14} width="6" height="18" fill="none" stroke="#1a1a1a" strokeWidth="1" rx="1" />
                  <line x1={loc.x - 6} y1={loc.y - 14} x2={loc.x + 6} y2={loc.y - 14} stroke="#1a1a1a" strokeWidth="0.8" />
                  {/* Light rays */}
                  <line x1={loc.x - 8} y1={loc.y - 16} x2={loc.x - 5} y2={loc.y - 15} stroke="hsl(var(--secondary))" strokeWidth="0.8" />
                  <line x1={loc.x + 8} y1={loc.y - 16} x2={loc.x + 5} y2={loc.y - 15} stroke="hsl(var(--secondary))" strokeWidth="0.8" />
                  <line x1={loc.x} y1={loc.y - 20} x2={loc.x} y2={loc.y - 16} stroke="hsl(var(--secondary))" strokeWidth="0.8" />
                </>
              )}
              {loc.type === "club" && loc.id === "harbour-club" && (
                <>
                  {/* Sailboat */}
                  <path d={`M ${loc.x} ${loc.y - 12} L ${loc.x} ${loc.y + 2} M ${loc.x} ${loc.y - 10} Q ${loc.x + 10} ${loc.y - 4} ${loc.x} ${loc.y + 2}`} fill="none" stroke="#1a1a1a" strokeWidth="1" />
                  <path d={`M ${loc.x - 6} ${loc.y + 2} Q ${loc.x} ${loc.y + 5} ${loc.x + 6} ${loc.y + 2}`} fill="none" stroke="#1a1a1a" strokeWidth="1" />
                </>
              )}
              {loc.type === "club" && loc.id === "beach-club" && (
                <>
                  {/* Umbrella */}
                  <line x1={loc.x} y1={loc.y - 10} x2={loc.x} y2={loc.y + 3} stroke="#1a1a1a" strokeWidth="1" />
                  <path d={`M ${loc.x - 8} ${loc.y - 6} Q ${loc.x} ${loc.y - 14} ${loc.x + 8} ${loc.y - 6}`} fill="none" stroke="#1a1a1a" strokeWidth="1" />
                </>
              )}
              {loc.type === "public" && (
                <>
                  {/* Tree cluster */}
                  <circle cx={loc.x - 4} cy={loc.y - 5} r="4" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
                  <circle cx={loc.x + 4} cy={loc.y - 5} r="4" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
                  <circle cx={loc.x} cy={loc.y - 9} r="4" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
                  <line x1={loc.x} y1={loc.y - 1} x2={loc.x} y2={loc.y + 4} stroke="#1a1a1a" strokeWidth="0.8" />
                </>
              )}
              {loc.type === "infrastructure" && (
                <>
                  {/* Bridge/road icon */}
                  <rect x={loc.x - 8} y={loc.y - 3} width="16" height="6" fill="none" stroke="#1a1a1a" strokeWidth="1" rx="1" />
                  <line x1={loc.x - 4} y1={loc.y - 3} x2={loc.x - 4} y2={loc.y + 3} stroke="#1a1a1a" strokeWidth="0.6" />
                  <line x1={loc.x + 4} y1={loc.y - 3} x2={loc.x + 4} y2={loc.y + 3} stroke="#1a1a1a" strokeWidth="0.6" />
                </>
              )}

              {/* Gold dot */}
              <circle
                cx={loc.x}
                cy={loc.y}
                r={isSelected ? 4 : 3}
                fill="hsl(var(--secondary))"
                stroke="#1a1a1a"
                strokeWidth="0.5"
              />

              {/* Label */}
              <text
                x={loc.labelAnchor === "right" ? loc.x + 16 : loc.x - 16}
                y={loc.y + 1}
                textAnchor={loc.labelAnchor === "right" ? "start" : "end"}
                fontSize="9"
                fill="#1a1a1a"
                fontWeight={isSelected ? "600" : "400"}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {loc.name}
              </text>
            </g>
          );
        })}

        {/* Compass rose — bottom right */}
        <g transform="translate(530, 630)">
          <circle cx="0" cy="0" r="18" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
          <line x1="0" y1="-16" x2="0" y2="16" stroke="#1a1a1a" strokeWidth="0.8" />
          <line x1="-16" y1="0" x2="16" y2="0" stroke="#1a1a1a" strokeWidth="0.8" />
          <polygon points="0,-14 -3,-4 3,-4" fill="#1a1a1a" />
          <text x="0" y="-20" textAnchor="middle" fontSize="7" fill="#1a1a1a" fontWeight="600">N</text>
          <text x="0" y="26" textAnchor="middle" fontSize="6" fill="#8a8a8a">S</text>
          <text x="22" y="3" textAnchor="start" fontSize="6" fill="#8a8a8a">E</text>
          <text x="-22" y="3" textAnchor="end" fontSize="6" fill="#8a8a8a">W</text>
        </g>
      </svg>
    </div>
  );
};

export default IslaSerranoMap;
