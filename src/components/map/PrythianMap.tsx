import { type Pin } from "@/data/projects";

interface PrythianMapProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
  pins?: Pin[];
}

const PrythianMap = ({ selectedLocationId, onSelectLocation, pins = [] }: PrythianMapProps) => {
  return (
    <div className="w-full flex justify-center py-6">
      <svg
        viewBox="0 0 600 700"
        className="w-full max-w-[600px] h-auto"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {/* Parchment background */}
        <rect width="600" height="700" fill="#faf8f4" rx="4" />

        {/* Title */}
        <text x="300" y="32" textAnchor="middle" fontSize="18" fontWeight="600" fill="#1a1a1a" letterSpacing="3">
          PRYTHIAN
        </text>
        <line x1="240" y1="40" x2="360" y2="40" stroke="#1a1a1a" strokeWidth="0.5" />

        {/* The Wall — horizontal divide */}
        <line x1="40" y1="520" x2="560" y2="520" stroke="#1a1a1a" strokeWidth="2.5" />
        <line x1="40" y1="524" x2="560" y2="524" stroke="#1a1a1a" strokeWidth="0.5" />
        <text x="300" y="540" textAnchor="middle" fontSize="9" fill="#1a1a1a" letterSpacing="4" fontWeight="600">
          THE WALL
        </text>

        {/* Mortal Lands — south of the wall */}
        <text x="300" y="600" textAnchor="middle" fontSize="11" fill="#b0b0b0" fontStyle="italic" letterSpacing="2">
          THE MORTAL LANDS
        </text>
        <text x="300" y="618" textAnchor="middle" fontSize="7" fill="#c0c0c0">
          — Feyre's homeland —
        </text>

        {/* Mortal lands sparse trees */}
        <g stroke="#8a8a6a" fill="none" strokeWidth="0.6" opacity="0.4">
          <path d="M 200 580 Q 198 570 205 565 M 200 580 L 200 588" />
          <path d="M 380 590 Q 378 580 385 575 M 380 590 L 380 598" />
          <path d="M 150 600 Q 148 590 155 585 M 150 600 L 150 608" />
        </g>

        {/* Faerie realm — north territory outlines */}
        
        {/* Spring Court — east, lush */}
        <path
          d="M 340 250 Q 400 230, 440 260 Q 470 290, 460 340 Q 450 380, 410 400 Q 370 410, 340 390 Q 310 370, 320 330 Q 310 290, 340 250 Z"
          fill="#f0ede4"
          stroke="#5a7a5a"
          strokeWidth="1.2"
          strokeDasharray="4 2"
        />
        <text x="390" y="330" textAnchor="middle" fontSize="9" fill="#5a7a5a" fontWeight="500" letterSpacing="1">
          SPRING
        </text>
        <text x="390" y="342" textAnchor="middle" fontSize="7" fill="#5a7a5a">
          Court
        </text>

        {/* Flower dots for Spring */}
        <g fill="#C9A84C" opacity="0.5">
          {[{ x: 370, y: 280 }, { x: 410, y: 300 }, { x: 420, y: 360 }, { x: 360, y: 370 }, { x: 380, y: 260 }].map((p, i) => (
            <circle key={`fl-${i}`} cx={p.x} cy={p.y} r="2" />
          ))}
        </g>

        {/* Night Court — northwest, dark */}
        <path
          d="M 100 80 Q 160 70, 220 90 Q 260 110, 250 160 Q 240 210, 200 230 Q 160 240, 120 220 Q 80 200, 80 150 Q 80 110, 100 80 Z"
          fill="#eae8e2"
          stroke="#1B2A4A"
          strokeWidth="1.2"
          strokeDasharray="4 2"
        />
        <text x="165" y="155" textAnchor="middle" fontSize="9" fill="#1B2A4A" fontWeight="500" letterSpacing="1">
          NIGHT
        </text>
        <text x="165" y="167" textAnchor="middle" fontSize="7" fill="#1B2A4A">
          Court
        </text>

        {/* Stars for Night Court */}
        <g fill="#1B2A4A" opacity="0.3">
          {[{ x: 130, y: 100 }, { x: 190, y: 120 }, { x: 150, y: 190 }, { x: 210, y: 170 }, { x: 110, y: 160 }].map((p, i) => (
            <polygon key={`st-${i}`} points={`${p.x},${p.y - 3} ${p.x + 1},${p.y - 1} ${p.x + 3},${p.y} ${p.x + 1},${p.y + 1} ${p.x},${p.y + 3} ${p.x - 1},${p.y + 1} ${p.x - 3},${p.y} ${p.x - 1},${p.y - 1}`} />
          ))}
        </g>

        {/* Under the Mountain — center north */}
        <path
          d="M 260 70 L 300 30 L 340 70 Z"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1.5"
        />
        <path
          d="M 270 70 L 300 45 L 330 70"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="0.5"
        />
        <text x="300" y="85" textAnchor="middle" fontSize="7" fill="#1a1a1a" fontWeight="500">
          Under the Mountain
        </text>

        {/* Autumn Court — west */}
        <path
          d="M 80 300 Q 120 270, 170 280 Q 200 290, 200 330 Q 200 370, 170 390 Q 130 400, 100 380 Q 70 360, 70 330 Q 70 310, 80 300 Z"
          fill="#f2efe6"
          stroke="#8a6a3a"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <text x="135" y="340" textAnchor="middle" fontSize="8" fill="#8a6a3a" fontWeight="500" letterSpacing="1">
          AUTUMN
        </text>

        {/* Summer Court — east */}
        <path
          d="M 440 120 Q 490 100, 530 130 Q 550 160, 540 200 Q 520 230, 480 230 Q 440 220, 430 180 Q 420 150, 440 120 Z"
          fill="#f4f0e6"
          stroke="#b8860b"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <text x="485" y="170" textAnchor="middle" fontSize="8" fill="#b8860b" fontWeight="500" letterSpacing="1">
          SUMMER
        </text>

        {/* Forest of Wolves — southwest */}
        <g stroke="#4a5a3a" fill="none" strokeWidth="0.8" opacity="0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <path key={`fw-${i}`} d={`M ${120 + i * 25} ${460 + Math.sin(i) * 15} Q ${118 + i * 25} ${445 + Math.sin(i) * 15} ${125 + i * 25} ${440 + Math.sin(i) * 15} M ${120 + i * 25} ${460 + Math.sin(i) * 15} L ${120 + i * 25} ${468 + Math.sin(i) * 15}`} />
          ))}
        </g>
        <text x="195" y="490" textAnchor="middle" fontSize="7" fill="#4a5a3a" fontStyle="italic">
          Forest of Wolves
        </text>

        {/* Rivers */}
        <path
          d="M 250 200 Q 280 300, 260 400 Q 250 450, 260 500"
          fill="none"
          stroke="#8a9bb5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Location markers from pins */}
        {pins.map((pin) => {
          const isSelected = selectedLocationId === pin.id;
          const px = 60 + (pin.x / 100) * 480;
          const py = 60 + (pin.y / 100) * 460;
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
      </svg>
    </div>
  );
};

export default PrythianMap;
