import { type Pin } from "@/data/projects";

interface CapeCodeMapProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
  pins?: Pin[];
}

const CapeCodeMap = ({ selectedLocationId, onSelectLocation, pins = [] }: CapeCodeMapProps) => {
  return (
    <div className="w-full flex justify-center py-6">
      <svg
        viewBox="0 0 600 700"
        className="w-full max-w-[600px] h-auto"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {/* Cream background */}
        <rect width="600" height="700" fill="#faf8f4" rx="4" />

        {/* Title */}
        <text x="300" y="32" textAnchor="middle" fontSize="18" fontWeight="600" fill="#1a1a1a" letterSpacing="3">
          CAPE COD
        </text>
        <line x1="240" y1="40" x2="360" y2="40" stroke="#1a1a1a" strokeWidth="0.5" />

        {/* Ocean label */}
        <text x="500" y="300" textAnchor="middle" fontSize="11" fill="#8a9bb5" fontStyle="italic" letterSpacing="2" transform="rotate(90, 500, 300)">
          ATLANTIC OCEAN
        </text>

        {/* Bay label */}
        <text x="160" y="400" textAnchor="middle" fontSize="11" fill="#8a9bb5" fontStyle="italic" letterSpacing="2" transform="rotate(-30, 160, 400)">
          CAPE COD BAY
        </text>

        {/* Water hatching */}
        <g stroke="#c8d4e0" strokeWidth="0.4" opacity="0.4">
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`w-${i}`} x1={420 + i * 5} y1={100 + i * 20} x2={430 + i * 5} y2={130 + i * 20} />
          ))}
        </g>

        {/* Cape Cod peninsula — hook shape */}
        <path
          d="
            M 200 680
            Q 190 600, 200 520
            Q 210 440, 230 380
            Q 250 320, 270 280
            Q 290 240, 310 210
            Q 340 180, 370 170
            Q 400 165, 420 175
            Q 445 190, 460 210
            Q 475 235, 475 260
            Q 470 280, 455 290
            Q 435 300, 415 295
            Q 400 288, 390 275
            Q 380 262, 370 250
            Q 358 240, 348 238
            Q 335 240, 325 248
            Q 310 260, 298 280
            Q 280 310, 265 345
            Q 248 380, 240 420
            Q 232 470, 235 520
            Q 240 580, 250 640
            Q 255 670, 260 680
            Z
          "
          fill="#f5f0e6"
          stroke="#1a1a1a"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Internal road */}
        <path
          d="M 230 650 Q 235 550, 248 460 Q 260 370, 285 300 Q 310 240, 350 210 Q 380 190, 420 185"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="0.7"
          strokeDasharray="4 3"
        />

        {/* Trees */}
        <g stroke="#5a7a5a" fill="none" strokeWidth="1" opacity="0.6">
          <path d="M 260 450 Q 258 440 265 435 M 260 450 Q 262 440 255 435 M 260 450 L 260 458" />
          <path d="M 250 500 Q 248 490 255 485 M 250 500 Q 252 490 245 485 M 250 500 L 250 508" />
          <path d="M 320 260 Q 318 250 325 245 M 320 260 Q 322 250 315 245 M 320 260 L 320 268" />
        </g>

        {/* Location markers from pins */}
        {pins.map((pin) => {
          const isSelected = selectedLocationId === pin.id;
          // Scale pin x/y (0-100) to SVG coords
          const px = 180 + (pin.x / 100) * 300;
          const py = 100 + (pin.y / 100) * 550;
          const color = pin.type === "plot" ? "#b91c1c" : pin.type === "character" ? "#1B2A4A" : "#C9A84C";
          return (
            <g key={pin.id} className="cursor-pointer" onClick={() => onSelectLocation(isSelected ? null : pin.id)}>
              {isSelected && (
                <circle cx={px} cy={py} r="14" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6">
                  <animate attributeName="r" from="10" to="20" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={px} cy={py} r={isSelected ? 5 : 4} fill={color} stroke="#1a1a1a" strokeWidth="0.5" />
              <text
                x={px + 10}
                y={py + 3}
                fontSize="8"
                fill="#1a1a1a"
                fontWeight={isSelected ? "600" : "400"}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {pin.title}
              </text>
            </g>
          );
        })}

        {/* Compass rose */}
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

        {/* Landmarks */}
        <text x="240" y="620" fontSize="7" fill="#8a8a8a" fontStyle="italic">Wellfleet</text>
        <text x="260" y="420" fontSize="7" fill="#8a8a8a" fontStyle="italic">Orleans</text>
        <text x="360" y="200" fontSize="7" fill="#8a8a8a" fontStyle="italic">Provincetown</text>
      </svg>
    </div>
  );
};

export default CapeCodeMap;
