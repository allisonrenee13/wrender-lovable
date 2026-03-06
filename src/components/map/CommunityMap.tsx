import { type Pin } from "@/data/projects";

interface CommunityMapProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
  pins?: Pin[];
}

const CommunityMap = ({ selectedLocationId, onSelectLocation, pins = [] }: CommunityMapProps) => {
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
          THE COMMUNITY
        </text>
        <line x1="210" y1="40" x2="390" y2="40" stroke="#1a1a1a" strokeWidth="0.5" />

        {/* Outer boundary — perfect circle (sameness) */}
        <circle cx="300" cy="380" r="230" fill="#f5f0e6" stroke="#1a1a1a" strokeWidth="2" />

        {/* Inner rings — concentric order */}
        <circle cx="300" cy="380" r="160" fill="none" stroke="#1a1a1a" strokeWidth="0.5" strokeDasharray="6 4" />
        <circle cx="300" cy="380" r="90" fill="none" stroke="#1a1a1a" strokeWidth="0.5" strokeDasharray="4 3" />

        {/* Grid lines — structured, oppressive order */}
        <line x1="300" y1="150" x2="300" y2="610" stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="3 3" />
        <line x1="70" y1="380" x2="530" y2="380" stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="3 3" />
        <line x1="145" y1="220" x2="455" y2="540" stroke="#1a1a1a" strokeWidth="0.3" strokeDasharray="2 3" />
        <line x1="455" y1="220" x2="145" y2="540" stroke="#1a1a1a" strokeWidth="0.3" strokeDasharray="2 3" />

        {/* Central plaza — Hall of Records */}
        <rect x="275" y="355" width="50" height="50" fill="none" stroke="#1a1a1a" strokeWidth="1" rx="2" />
        <text x="300" y="385" textAnchor="middle" fontSize="6" fill="#1a1a1a" fontWeight="500">HALL OF</text>
        <text x="300" y="393" textAnchor="middle" fontSize="6" fill="#1a1a1a" fontWeight="500">RECORDS</text>

        {/* Family Dwelling Units — small uniform rectangles */}
        {[
          { x: 240, y: 300 }, { x: 270, y: 300 }, { x: 330, y: 300 }, { x: 360, y: 300 },
          { x: 240, y: 440 }, { x: 270, y: 440 }, { x: 330, y: 440 }, { x: 360, y: 440 },
        ].map((pos, i) => (
          <rect key={`dw-${i}`} x={pos.x} y={pos.y} width="20" height="14" fill="none" stroke="#1a1a1a" strokeWidth="0.6" rx="1" />
        ))}
        <text x="300" y="290" textAnchor="middle" fontSize="7" fill="#8a8a8a" fontStyle="italic">Family Units</text>

        {/* Auditorium */}
        <ellipse cx="300" cy="240" rx="35" ry="20" fill="none" stroke="#1a1a1a" strokeWidth="0.8" />
        <text x="300" y="243" textAnchor="middle" fontSize="7" fill="#1a1a1a">Auditorium</text>

        {/* The Annex — at the edge */}
        <rect x="430" y="340" width="30" height="20" fill="none" stroke="#1a1a1a" strokeWidth="0.8" rx="2" />
        <text x="445" y="354" textAnchor="middle" fontSize="6" fill="#1a1a1a">Annex</text>

        {/* Nurturing Center */}
        <rect x="200" y="340" width="35" height="18" fill="none" stroke="#1a1a1a" strokeWidth="0.6" rx="1" />
        <text x="217" y="352" textAnchor="middle" fontSize="5.5" fill="#1a1a1a">Nurturing</text>

        {/* The River — boundary to Elsewhere */}
        <path
          d="M 70 590 Q 150 575, 220 585 Q 300 595, 380 580 Q 450 570, 530 585"
          fill="none"
          stroke="#8a9bb5"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text x="300" y="575" textAnchor="middle" fontSize="8" fill="#8a9bb5" fontStyle="italic" letterSpacing="2">
          THE RIVER
        </text>

        {/* Elsewhere label — beyond */}
        <text x="300" y="650" textAnchor="middle" fontSize="11" fill="#b0b0b0" fontStyle="italic" letterSpacing="4">
          ELSEWHERE
        </text>
        <text x="300" y="665" textAnchor="middle" fontSize="7" fill="#c0c0c0">
          — beyond the boundary —
        </text>

        {/* Location markers from pins */}
        {pins.map((pin) => {
          const isSelected = selectedLocationId === pin.id;
          const px = 70 + (pin.x / 100) * 460;
          const py = 150 + (pin.y / 100) * 460;
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
        <g transform="translate(530, 100)">
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

export default CommunityMap;
