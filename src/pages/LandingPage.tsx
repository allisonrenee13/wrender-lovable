import { useState, useEffect } from "react";
import { SeeneryLogo } from "@/components/SeeneryLogo";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Menu, X } from "lucide-react";

/* ───── Mini map sketches for demo cards ───── */
const CapeCodSketch = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
    <path d="M20 85 Q40 78 60 82 Q80 75 100 80 Q130 72 160 78 Q180 82 195 75" stroke="currentColor" strokeWidth="0.7" fill="none" />
    <rect x="55" y="35" width="22" height="18" rx="0.5" stroke="currentColor" strokeWidth="0.7" fill="none" />
    <path d="M53 35 L66 25 L79 35" stroke="currentColor" strokeWidth="0.6" fill="none" />
    <path d="M120 40 Q130 32 145 35 Q155 38 152 48 Q148 55 135 56 Q122 54 120 45Z" stroke="currentColor" strokeWidth="0.7" fill="none" />
    <path d="M30 50 L33 38 L36 50" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
    <path d="M38 52 L41 40 L44 52" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
    <path d="M66 53 Q80 60 100 58 Q120 55 135 56" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 2" opacity="0.3" />
    <circle cx="66" cy="42" r="1.8" className="fill-secondary" />
    <circle cx="135" cy="45" r="1.8" className="fill-secondary" />
    <text x="66" y="30" textAnchor="middle" fill="currentColor" fontSize="5" fontFamily="serif" opacity="0.4">The House</text>
    <text x="137" y="30" textAnchor="middle" fill="currentColor" fontSize="5" fontFamily="serif" opacity="0.4">The Pond</text>
  </svg>
);

const CommunitySketch = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
    <circle cx="100" cy="60" r="42" stroke="currentColor" strokeWidth="0.7" fill="none" />
    <circle cx="100" cy="60" r="28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" fill="none" opacity="0.4" />
    <line x1="70" y1="40" x2="70" y2="80" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    <line x1="100" y1="32" x2="100" y2="88" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    <line x1="130" y1="40" x2="130" y2="80" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    <line x1="65" y1="50" x2="135" y2="50" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    <line x1="60" y1="60" x2="140" y2="60" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    <line x1="65" y1="70" x2="135" y2="70" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    <rect x="88" y="52" width="10" height="8" rx="0.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
    <rect x="103" y="52" width="8" height="6" rx="0.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
    <circle cx="100" cy="60" r="1.8" className="fill-secondary" />
    <text x="100" y="108" textAnchor="middle" fill="currentColor" fontSize="5" fontFamily="serif" opacity="0.3">The Community</text>
  </svg>
);

const PrythianSketch = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
    <line x1="100" y1="8" x2="100" y2="112" stroke="currentColor" strokeWidth="1" />
    <text x="100" y="6" textAnchor="middle" fill="currentColor" fontSize="4.5" fontFamily="serif" opacity="0.35">The Wall</text>
    <path d="M15 25 Q30 20 50 30 Q65 38 85 35 L85 95 Q60 90 40 80 Q25 75 15 85Z" stroke="currentColor" strokeWidth="0.6" fill="none" />
    <path d="M35 40 L37 33 L39 40" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    <path d="M42 42 L44 35 L46 42" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    <path d="M115 25 Q130 18 150 28 Q168 35 180 30 L180 95 Q165 88 145 82 Q125 78 115 88Z" stroke="currentColor" strokeWidth="0.6" fill="none" />
    <path d="M130 38 L133 28 L136 38" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.35" />
    <path d="M140 35 L143 25 L146 35" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.35" />
    <path d="M150 40 L153 30 L156 40" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    <circle cx="55" cy="55" r="1.8" className="fill-secondary" />
    <circle cx="150" cy="50" r="1.8" className="fill-secondary" />
    <path d="M85 60 Q92 58 100 60 Q108 62 115 60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" fill="none" opacity="0.35" />
    <text x="50" y="100" textAnchor="middle" fill="currentColor" fontSize="4.5" fontFamily="serif" opacity="0.3">Mortal Lands</text>
    <text x="150" y="100" textAnchor="middle" fill="currentColor" fontSize="4.5" fontFamily="serif" opacity="0.3">Prythian</text>
  </svg>
);

/* ───── Feature Tab Illustrations ───── */
const RenderIllustration = () => (
  <svg viewBox="0 0 400 260" className="w-full h-full" fill="none">
    {/* Outer boundary */}
    <circle cx="200" cy="125" r="95" stroke="currentColor" strokeWidth="1" fill="none" />
    {/* Inner rings */}
    <circle cx="200" cy="125" r="65" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 3" fill="none" opacity="0.35" />
    <circle cx="200" cy="125" r="35" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" fill="none" opacity="0.25" />
    {/* Grid lines */}
    <line x1="200" y1="30" x2="200" y2="220" stroke="currentColor" strokeWidth="0.3" opacity="0.12" />
    <line x1="105" y1="125" x2="295" y2="125" stroke="currentColor" strokeWidth="0.3" opacity="0.12" />
    {/* Central plaza */}
    <rect x="188" y="113" width="24" height="24" stroke="currentColor" strokeWidth="0.6" fill="none" rx="1" opacity="0.4" />
    {/* Dwelling units */}
    <rect x="170" y="85" width="10" height="7" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    <rect x="220" y="85" width="10" height="7" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    <rect x="170" y="160" width="10" height="7" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    <rect x="220" y="160" width="10" height="7" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    {/* Rendering effect - dashed partial lines */}
    <path d="M140 80 Q160 60 200 55" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 3" fill="none" opacity="0.2" />
    <path d="M260 170 Q280 190 270 210" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 3" fill="none" opacity="0.2" />
    {/* Pins */}
    <circle cx="200" cy="125" r="3.5" className="fill-secondary" />
    <circle cx="200" cy="72" r="3" className="fill-primary" />
    {/* Label */}
    <text x="200" y="245" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="serif" opacity="0.25" fontStyle="italic">The Community</text>
  </svg>
);

const PlaceIllustration = () => (
  <svg viewBox="0 0 400 260" className="w-full h-full" fill="none">
    {/* Cape Cod silhouette */}
    <path d="M60 150 C55 160 48 178 50 198 C52 212 72 212 98 200 C120 190 150 186 180 187 C210 188 240 185 268 188 C290 186 302 176 308 160 C312 145 310 125 306 105 C302 82 296 62 288 48 C278 36 266 28 252 26 C240 24 230 30 226 38 C224 46 230 48 240 46 C254 42 268 50 276 62 C286 78 290 100 290 122 C290 138 280 146 262 150 C235 156 200 154 170 150 C135 146 100 142 75 146 C62 148 58 149 60 150Z" stroke="currentColor" strokeWidth="1" fill="none" />
    {/* Roads */}
    <path d="M130 155 Q170 145 210 150 Q240 140 260 125" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 2" opacity="0.2" />
    {/* Plot event pins with labels */}
    <circle cx="155" cy="140" r="4" className="fill-secondary" />
    <text x="155" y="130" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="serif" opacity="0.5">Ch. 3: The arrival</text>
    <circle cx="235" cy="130" r="4" className="fill-secondary" />
    <text x="235" y="120" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="serif" opacity="0.5">Ch. 7: The discovery</text>
    <circle cx="270" cy="100" r="3.5" className="fill-primary" />
    <text x="285" y="97" fill="currentColor" fontSize="6" opacity="0.4">Ch. 12: Confrontation</text>
    <circle cx="190" cy="170" r="3.5" className="fill-primary" />
    <text x="190" y="183" textAnchor="middle" fill="currentColor" fontSize="6" opacity="0.4">Ch. 15: Escape</text>
    {/* Timeline bar at bottom */}
    <line x1="60" y1="225" x2="340" y2="225" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
    <circle cx="100" cy="225" r="2.5" className="fill-secondary" opacity="0.6" />
    <circle cx="170" cy="225" r="2.5" className="fill-secondary" opacity="0.6" />
    <circle cx="240" cy="225" r="2.5" className="fill-primary" opacity="0.5" />
    <circle cx="310" cy="225" r="2.5" className="fill-primary" opacity="0.5" />
    <text x="100" y="238" textAnchor="middle" fill="currentColor" fontSize="5" opacity="0.3">Ch.3</text>
    <text x="170" y="238" textAnchor="middle" fill="currentColor" fontSize="5" opacity="0.3">Ch.7</text>
    <text x="240" y="238" textAnchor="middle" fill="currentColor" fontSize="5" opacity="0.3">Ch.12</text>
    <text x="310" y="238" textAnchor="middle" fill="currentColor" fontSize="5" opacity="0.3">Ch.15</text>
  </svg>
);

const TrackIllustration = () => (
  <svg viewBox="0 0 400 260" className="w-full h-full" fill="none">
    {/* Cape Cod silhouette */}
    <path d="M60 150 C55 160 48 178 50 198 C52 212 72 212 98 200 C120 190 150 186 180 187 C210 188 240 185 268 188 C290 186 302 176 308 160 C312 145 310 125 306 105 C302 82 296 62 288 48 C278 36 266 28 252 26 C240 24 230 30 226 38 C224 46 230 48 240 46 C254 42 268 50 276 62 C286 78 290 100 290 122 C290 138 280 146 262 150 C235 156 200 154 170 150 C135 146 100 142 75 146 C62 148 58 149 60 150Z" stroke="currentColor" strokeWidth="1" fill="none" />
    {/* Character A path */}
    <path d="M130 165 Q150 150 175 142 Q200 135 220 140 Q240 135 255 120" stroke="hsl(var(--secondary))" strokeWidth="1" strokeDasharray="4 3" fill="none" opacity="0.6" />
    <circle cx="130" cy="165" r="4" className="fill-secondary" />
    <circle cx="255" cy="120" r="4" className="fill-secondary" />
    <text x="130" y="180" textAnchor="middle" fill="currentColor" fontSize="6" opacity="0.5">Elena (start)</text>
    <text x="255" y="112" textAnchor="middle" fill="currentColor" fontSize="6" opacity="0.5">Elena (end)</text>
    {/* Character B path */}
    <path d="M175 120 Q195 140 215 155 Q235 165 260 165" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="4 3" fill="none" opacity="0.5" />
    <circle cx="175" cy="120" r="3.5" className="fill-primary" />
    <circle cx="260" cy="165" r="3.5" className="fill-primary" />
    <text x="175" y="113" textAnchor="middle" fill="currentColor" fontSize="6" opacity="0.45">Marco</text>
    <text x="275" y="163" fill="currentColor" fontSize="6" opacity="0.45">Marco</text>
    {/* Buildings */}
    <rect x="163" y="135" width="10" height="8" rx="0.3" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    <rect x="242" y="132" width="12" height="8" rx="0.3" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
  </svg>
);

/* ───── Book Card ───── */
function BookCard({ title, genre, setting, quote, sketch }: {
  title: string; genre: string; setting: string; quote: string;
  sketch: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg p-5 bg-card min-w-[280px] snap-center">
      <div className="h-36 bg-muted/30 rounded-md mb-4 flex items-center justify-center overflow-hidden">
        {sketch}
      </div>
      <span className="inline-block text-[10px] bg-secondary/10 text-secondary font-medium px-2 py-0.5 rounded mb-2">{genre}</span>
      <h4 className="font-serif font-normal text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground mb-3">{setting}</p>
      <p className="text-xs italic font-serif text-muted-foreground/70">"{quote}"</p>
    </div>
  );
}

/* ───── Pricing Card ───── */
function PricingCard({ name, price, period, features, cta, popular }: {
  name: string; price: string; period?: string; features: string[]; cta: string; popular?: boolean;
}) {
  return (
    <div className={`border rounded-lg p-6 bg-card relative flex flex-col ${popular ? "border-secondary shadow-md" : "border-border"}`}>
      {popular && (
        <span className="absolute -top-3 right-4 bg-secondary text-secondary-foreground text-[10px] font-semibold px-3 py-0.5 rounded-full">
          Most Popular
        </span>
      )}
      <h4 className="font-serif font-normal text-lg mb-1">{name}</h4>
      <p className="text-2xl font-serif font-normal text-foreground mb-0.5">{price}</p>
      {period && <p className="text-xs text-muted-foreground mb-4">{period}</p>}
      {!period && <div className="mb-4" />}
      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-secondary mt-0.5 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={popular ? "default" : "outline"}
        className={`w-full ${popular ? "bg-primary text-secondary font-medium" : ""}`}
      >
        {cta}
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "place" | "track">("create");

  useEffect(() => {
    const el = document.getElementById("landing-scroll");
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const tabContent = {
    create: {
      heading: "Create your map.",
      body: "Describe your world, upload reference images, and mark up what you want to keep or change. Wrender generates a precise line sketch of your setting. Like an architectural drawing of the world your story lives in.",
      tags: ["Line sketch generation", "Reference image upload", "Markup tool", "Version history"],
      illustration: <RenderIllustration />,
    },
    place: {
      heading: "Place your story on the map.",
      body: "Drop locations and plot events directly onto your sketch. See exactly where everything happens and whether your story's geography actually works. Main events and minor moments, all placed where they belong. The level of detail is up to you.",
      tags: ["Plot event pins", "Main and minor events", "Story timeline", "Location detail"],
      illustration: <PlaceIllustration />,
    },
    track: {
      heading: "Track your characters across your world.",
      body: "Know where every character is at key moments and events in your story. See who is where, when, and whether their movements make narrative sense. Especially when your scenes get complex.",
      tags: ["Character profiles", "Location tracking", "Scene choreography", "Coming soon: movement mapping"],
      illustration: <TrackIllustration />,
    },
  };

  const current = tabContent[activeTab];

  return (
    <div id="landing-scroll" className="h-screen overflow-y-auto bg-background text-foreground">
      {/* ── Section 1: Nav ── */}
      <nav
        className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all ${
          scrolled ? "bg-background/90 backdrop-blur-sm border-b border-border" : ""
        }`}
      >
        <SeeneryLogo variant="sidebar" />
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">Features</button>
          <button onClick={() => scrollTo("pricing")} className="hover:text-foreground transition-colors">Pricing</button>
          <button onClick={() => scrollTo("about")} className="hover:text-foreground transition-colors">About</button>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</a>
          <Button className="bg-primary text-primary-foreground text-sm rounded-full px-5 h-9">Start free</Button>
        </div>
        <button className="sm:hidden p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-[60px] z-40 bg-background border-b border-border px-6 py-4 flex flex-col gap-3">
          <button onClick={() => scrollTo("features")} className="text-sm text-muted-foreground text-left">Features</button>
          <button onClick={() => scrollTo("pricing")} className="text-sm text-muted-foreground text-left">Pricing</button>
          <button onClick={() => scrollTo("about")} className="text-sm text-muted-foreground text-left">About</button>
          <a href="#" className="text-sm text-muted-foreground">Sign in</a>
          <Button className="bg-primary text-primary-foreground text-sm rounded-full w-full h-9">Start free</Button>
        </div>
      )}

      {/* ══ Section 2: Hero ══ */}
      <section className="pt-20 md:pt-28 pb-6 flex flex-col items-center text-center px-6">
        <h1 className="font-serif text-5xl md:text-7xl font-semibold text-foreground leading-[1.1] max-w-3xl mb-8">
          See your story's world.
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-[560px] mb-2 leading-relaxed">
          Your visual writing companion.
        </p>
      </section>

      {/* ══ Large App Visual ══ */}
      <section className="pt-8 pb-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="border border-border rounded-xl shadow-lg overflow-hidden bg-card">
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-muted/50 border-b border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-secondary/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/40" />
              <span className="ml-3 text-[10px] text-muted-foreground">wrender &mdash; The Community</span>
            </div>
            <div className="h-72 md:h-[28rem] bg-[hsl(40,20%,97%)] flex items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 600 400" className="w-full h-full" fill="none">
                {/* Outer boundary */}
                <circle cx="300" cy="200" r="150" stroke="currentColor" strokeWidth="1.5" fill="none" />
                {/* Inner rings */}
                <circle cx="300" cy="200" r="105" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 4" fill="none" opacity="0.4" />
                <circle cx="300" cy="200" r="58" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 3" fill="none" opacity="0.3" />
                {/* Grid lines */}
                <line x1="300" y1="50" x2="300" y2="350" stroke="currentColor" strokeWidth="0.35" opacity="0.15" />
                <line x1="150" y1="200" x2="450" y2="200" stroke="currentColor" strokeWidth="0.35" opacity="0.15" />
                <line x1="195" y1="95" x2="405" y2="305" stroke="currentColor" strokeWidth="0.25" opacity="0.1" />
                <line x1="405" y1="95" x2="195" y2="305" stroke="currentColor" strokeWidth="0.25" opacity="0.1" />
                {/* Central plaza */}
                <rect x="283" y="183" width="34" height="34" stroke="currentColor" strokeWidth="0.7" fill="none" rx="1.5" opacity="0.5" />
                {/* Dwelling units */}
                {[
                  { x: 260, y: 150 }, { x: 285, y: 150 }, { x: 315, y: 150 }, { x: 340, y: 150 },
                  { x: 260, y: 235 }, { x: 285, y: 235 }, { x: 315, y: 235 }, { x: 340, y: 235 },
                ].map((pos, i) => (
                  <rect key={`dw-${i}`} x={pos.x} y={pos.y} width="14" height="10" stroke="currentColor" strokeWidth="0.5" fill="none" rx="0.5" opacity="0.35" />
                ))}
                {/* Pins */}
                <circle cx="300" cy="200" r="5" className="fill-secondary" />
                <text x="300" y="225" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="Playfair Display, serif" opacity="0.5">Hall of Records</text>
                <circle cx="300" cy="135" r="4" className="fill-primary" />
                <text x="300" y="128" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.4">Auditorium</text>
                <circle cx="370" cy="190" r="4" className="fill-primary" />
                <text x="385" y="187" fill="currentColor" fontSize="7" opacity="0.4">The Annex</text>
                <circle cx="240" cy="190" r="4" className="fill-primary" />
                <text x="218" y="187" textAnchor="end" fill="currentColor" fontSize="7" opacity="0.4">Nurturing</text>
                {/* Label */}
                <text x="300" y="375" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="Playfair Display, serif" opacity="0.25" fontStyle="italic">The Community</text>
              </svg>
            </div>
          </div>
          <p className="text-center text-xs italic font-serif text-muted-foreground/50 mt-4">The Community. From Lois Lowry's The Giver. Rendered in Wrender.</p>
        </div>
      </section>

      {/* ══ Live Stat ══ */}
      <section className="py-12 px-6 bg-[hsl(40,20%,97%)]">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs font-medium text-secondary uppercase tracking-widest mb-4">Worlds created in Wrender</p>
          <div className="flex items-center justify-center gap-12">
            <div>
              <p className="font-serif text-4xl font-normal text-foreground">312</p>
              <p className="text-xs text-muted-foreground mt-1">Today</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <p className="font-serif text-4xl font-normal text-foreground">24,847</p>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-4">Every map is a story's world made visible.</p>
        </div>
      </section>

      {/* ══ Section 5: The Problem ══ */}
      <section className="py-20 px-6 md:px-12 bg-[hsl(40,20%,97%)]">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">A visual tool for writers.</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">Before Wrender</h3>
            <ul className="space-y-3">
              {["Scribbled maps on notebook paper you keep losing","Stopping mid-scene because you cannot picture the geography","Characters whose locations you are constantly second-guessing","Plot events you know happen somewhere but cannot visualise","Staring at a blank page when you could be planning what comes next"].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive/50 mt-1.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">With Wrender</h3>
            <ul className="space-y-3">
              {["A precise line sketch of your setting, always open beside your writing","Every location planned before you write the scene","Plot events pinned to the sketch so you can see the story spatially","Characters whose locations you are constantly second-guessing","Visual clarity as you write"].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══ How It Works ══ */}
      <section id="how-it-works" className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="text-xs font-medium text-secondary uppercase tracking-widest mb-4 block">The Wrender Flow</span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground leading-snug">
            Your map grows as your story does.
          </h2>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 mb-20 relative">
          <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] border-t border-dashed border-foreground/15" />
          {[
            { num: "1", title: "Outline", desc: "Give your world a shape. The geography, the land, the skeleton." },
            { num: "2", title: "Detail", desc: "Place your locations, events, and moments." },
            { num: "3", title: "Companion", desc: "Write with the map open. Play out where characters go, what they pass, what's possible." },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center px-6">
              <span className="font-serif text-sm text-secondary/50 mb-4 relative z-10 bg-background px-3">{step.num}</span>
              <h4 className="font-serif text-xl text-foreground mb-3">{step.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto pt-10 border-t border-border text-center">
          <p className="font-serif text-xl text-foreground">You aren't creating a basic map. It's a writer's render.</p>
        </div>
      </section>

      {/* ══ Feature Tabs ══ */}
      <section id="features" className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-1 mb-12">
            {(["create", "place", "track"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${activeTab === "place" ? "md:direction-rtl" : ""}`}>
            <div className={activeTab === "place" ? "md:order-2" : ""}>
              <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">{current.heading}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{current.body}</p>
              <div className="flex flex-wrap gap-2">
                {current.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div className={`border border-border rounded-lg bg-muted/20 p-4 ${activeTab === "place" ? "md:order-1" : ""}`}>
              <div className="aspect-[4/3] flex items-center justify-center">
                {current.illustration}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Three Books ══ */}
      <section className="py-20 px-6 md:px-12 bg-[hsl(40,20%,97%)]">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">Wrender your world.  Write your story.</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Whether your world is a fantasy kingdom, a controlled dystopia, or a sun-bleached island, if place shapes your story, you need to see it.</p>
        </div>
        <div className="max-w-5xl mx-auto flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:overflow-visible">
          <BookCard title="The Paper Palace" genre="Literary Fiction" setting="Cape Cod, Massachusetts" quote="The lake, the house, the woods. Every scene lives in a specific place." sketch={<CapeCodSketch />} />
          <BookCard title="The Giver" genre="Dystopian Fiction" setting="The Community" quote="The boundary between here and Elsewhere is everything." sketch={<CommunitySketch />} />
          <BookCard title="A Court of Thorns and Roses" genre="Fantasy" setting="Prythian" quote="You need to know where the Wall is before you can cross it." sketch={<PrythianSketch />} />
        </div>
      </section>

      {/* ══ Section 9: Founder Note ══ */}
      <section id="about" className="py-20 px-6 md:px-12 bg-[hsl(40,20%,97%)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">Built by a writer, for writers.</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed italic">
            <p>"I was writing my novel, set on an island I know well, and I kept stopping to scribble maps on paper. I knew exactly what the island looked like. I knew where the lighthouse was, where the hotel sat, where the path wound down to the beach. But I could not see it all at once."</p>
            <p>"I wanted a tool that would let me render my story's world the way an architect renders a building or a director scouts a location. Precise. Clear. Useful. Not art. A working sketch."</p>
            <p>"Wrender is that tool. Built to sit beside your writing, not replace it."</p>
          </div>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-border" />
            <div className="text-left">
              <p className="text-sm text-foreground font-medium">Name Placeholder</p>
              <p className="text-xs text-muted-foreground">Founder, Wrender</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Section 10: Pricing ══ */}
      <section id="pricing" className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <span className="text-xs font-medium text-secondary uppercase tracking-widest mb-3 block">Pricing</span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">Starting at just $9 a month.</h2>
          <p className="text-muted-foreground">Start visualising your world with a 14-day free trial.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <PricingCard name="Free" price="$0" features={["1 project","Up to 10 map pins","5 characters","Basic line sketch generation","Watermarked export"]} cta="Start free" />
          <PricingCard name="Storyteller" price="$9/month" period="$7/month billed annually" popular features={["Unlimited projects","Unlimited pins and characters","AI sketch generation","Upload and adapt real locations","Clean export, print ready","Location sketch mood boards"]} cta="Start free trial" />
          <PricingCard name="Worldbuilder" price="$15/month" period="$12/month billed annually" features={["Everything in Storyteller","Character movement mapping","Advanced timeline view","Co-authoring","Priority generation","Full version history"]} cta="Start free trial" />
        </div>
        <p className="text-center text-xs text-muted-foreground/60 mt-8">All plans include a 14-day free trial. No credit card required.</p>
      </section>

      {/* ══ Section 11: Final CTA ══ */}
      <section className="py-24 px-6 text-center bg-[hsl(40,20%,97%)]">
        <h2 className="font-serif text-3xl md:text-5xl font-semibold text-foreground mb-4">Ready to Wrender?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Depict your story's location as a clean line drawing, see what is in your head, plan where everything happens, and write with clarity.</p>
        <Button className="bg-primary text-secondary font-medium rounded-full px-10 h-12 text-base mb-3">Start visualising your world</Button>
        <p className="text-xs text-muted-foreground/60">No credit card required. 14-day free trial.</p>
      </section>

      {/* ══ Section 12: Footer ══ */}
      <footer className="border-t border-border py-12 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">Get to know us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Reviews</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Press Kit</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">For writers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">How it works</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Sign in</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Start free</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Request a feature</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto text-center pt-6">
          <p className="font-serif text-sm italic text-muted-foreground/50">
            Wrender = Write + Render. It's a writer's render.
          </p>
        </div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
          <SeeneryLogo variant="sidebar" />
          <p className="text-xs italic font-serif text-muted-foreground/50">Wrender your world. Write your story.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground/40 mt-6">© 2025 Wrender. Built for fiction writers.</p>
      </footer>
    </div>
  );
}
