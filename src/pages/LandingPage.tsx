import { useState, useEffect } from "react";
import { SeeneryLogo } from "@/components/SeeneryLogo";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Menu, X } from "lucide-react";

/* ───── SVG Icons (architectural / drafting style) ───── */
const IconSketchSetting = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
    {/* Detailed island with coastline, roads, terrain */}
    <path d="M10 28 Q12 18 18 15 Q22 12 28 14 Q34 12 38 18 Q42 24 40 30 Q36 34 30 35 Q22 37 16 34 Q11 32 10 28Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <path d="M14 26 Q18 24 22 25 Q26 24 30 26" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
    <path d="M18 20 L18 28" stroke="currentColor" strokeWidth="0.3" opacity="0.25" />
    <path d="M28 18 L28 30" stroke="currentColor" strokeWidth="0.3" opacity="0.25" />
    <rect x="20" y="22" width="4" height="3" rx="0.3" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.4" />
    <circle cx="24" cy="20" r="1.2" className="fill-secondary" />
    <line x1="6" y1="36" x2="42" y2="36" stroke="currentColor" strokeWidth="0.4" opacity="0.1" />
    <line x1="8" y1="38" x2="40" y2="38" stroke="currentColor" strokeWidth="0.4" opacity="0.07" />
  </svg>
);

const IconPlaceStory = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
    <path d="M24 10 C24 10 18 18 18 23 C18 27 21 29 24 29 C27 29 30 27 30 23 C30 18 24 10 24 10Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <circle cx="24" cy="22" r="1.5" className="fill-secondary" />
    <line x1="16" y1="34" x2="32" y2="34" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
    <line x1="18" y1="36" x2="30" y2="36" stroke="currentColor" strokeWidth="0.4" opacity="0.1" />
  </svg>
);

const IconTrackChars = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
    <circle cx="24" cy="16" r="5" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <path d="M15 36 C15 28 19 25 24 25 C29 25 33 28 33 36" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <circle cx="30" cy="20" r="1" className="fill-secondary" />
    <path d="M30 22 L30 25" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 1.5" opacity="0.4" />
  </svg>
);

/* ───── Step icons ───── */
const StepIcon1 = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2">
    <rect x="4" y="6" width="24" height="20" rx="1" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.6" />
    <line x1="8" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
    <line x1="8" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
    <line x1="8" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
  </svg>
);
const StepIcon2 = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2">
    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 3" fill="none" opacity="0.5" />
    <path d="M12 14 L20 14 L18 20 L10 20 Z" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.5" />
  </svg>
);
const StepIcon3 = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2">
    <path d="M8 20 Q10 14 14 12 Q18 10 22 12 Q26 15 26 20" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.6" />
    <circle cx="16" cy="15" r="1" className="fill-secondary" />
    <line x1="6" y1="22" x2="28" y2="22" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
  </svg>
);
const StepIcon4 = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2">
    <rect x="4" y="4" width="11" height="24" rx="1" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.5" />
    <rect x="17" y="4" width="11" height="24" rx="1" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.5" />
    <line x1="6" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
    <line x1="6" y1="13" x2="12" y2="13" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
    <path d="M19 14 Q21 11 23 12 Q25 13 25 15" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
    <circle cx="22" cy="13" r="0.7" className="fill-secondary" />
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
      <h4 className="font-serif font-semibold text-foreground mb-1">{title}</h4>
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
      <h4 className="font-serif font-semibold text-lg mb-1">{name}</h4>
      <p className="text-2xl font-serif font-bold text-foreground mb-0.5">{price}</p>
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

/* ───── Step ───── */
function Step({ num, title, desc, icon }: { num: number; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center relative">
      {icon}
      <div className="w-8 h-8 rounded-full border border-foreground/30 flex items-center justify-center text-xs text-foreground/60 mb-2">
        {num}
      </div>
      <h4 className="font-serif font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-[220px]">{desc}</p>
    </div>
  );
}

/* ───── Mini map sketches for demo cards ───── */
const CapeCodSketch = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
    {/* Coastline */}
    <path d="M20 85 Q40 78 60 82 Q80 75 100 80 Q130 72 160 78 Q180 82 195 75" stroke="currentColor" strokeWidth="0.7" fill="none" />
    {/* House */}
    <rect x="55" y="35" width="22" height="18" rx="0.5" stroke="currentColor" strokeWidth="0.7" fill="none" />
    <path d="M53 35 L66 25 L79 35" stroke="currentColor" strokeWidth="0.6" fill="none" />
    {/* Pond */}
    <path d="M120 40 Q130 32 145 35 Q155 38 152 48 Q148 55 135 56 Q122 54 120 45Z" stroke="currentColor" strokeWidth="0.7" fill="none" />
    {/* Woods / trees */}
    <path d="M30 50 L33 38 L36 50" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
    <path d="M38 52 L41 40 L44 52" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
    <path d="M34 54 L37 42 L40 54" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.35" />
    {/* Road */}
    <path d="M66 53 Q80 60 100 58 Q120 55 135 56" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 2" opacity="0.3" />
    {/* Pins */}
    <circle cx="66" cy="42" r="1.8" className="fill-secondary" />
    <circle cx="135" cy="45" r="1.8" className="fill-secondary" />
    {/* Labels */}
    <text x="66" y="30" textAnchor="middle" fill="currentColor" fontSize="5" fontFamily="serif" opacity="0.4">The House</text>
    <text x="137" y="30" textAnchor="middle" fill="currentColor" fontSize="5" fontFamily="serif" opacity="0.4">The Pond</text>
    <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
  </svg>
);

const CommunitySketch = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
    {/* Outer boundary */}
    <circle cx="100" cy="60" r="42" stroke="currentColor" strokeWidth="0.7" fill="none" />
    {/* Inner ring */}
    <circle cx="100" cy="60" r="28" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" fill="none" opacity="0.4" />
    {/* Grid streets */}
    <line x1="70" y1="40" x2="70" y2="80" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    <line x1="100" y1="32" x2="100" y2="88" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    <line x1="130" y1="40" x2="130" y2="80" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    <line x1="65" y1="50" x2="135" y2="50" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    <line x1="60" y1="60" x2="140" y2="60" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    <line x1="65" y1="70" x2="135" y2="70" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />
    {/* Buildings */}
    <rect x="88" y="52" width="10" height="8" rx="0.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
    <rect x="103" y="52" width="8" height="6" rx="0.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
    <rect x="75" y="62" width="8" height="6" rx="0.5" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
    {/* Centre pin */}
    <circle cx="100" cy="60" r="1.8" className="fill-secondary" />
    {/* Label */}
    <text x="100" y="108" textAnchor="middle" fill="currentColor" fontSize="5" fontFamily="serif" opacity="0.3">The Community</text>
  </svg>
);

const PrythianSketch = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
    {/* The Wall */}
    <line x1="100" y1="8" x2="100" y2="112" stroke="currentColor" strokeWidth="1" />
    <text x="100" y="6" textAnchor="middle" fill="currentColor" fontSize="4.5" fontFamily="serif" opacity="0.35">The Wall</text>
    {/* Mortal Lands (left) with terrain */}
    <path d="M15 25 Q30 20 50 30 Q65 38 85 35 L85 95 Q60 90 40 80 Q25 75 15 85Z" stroke="currentColor" strokeWidth="0.6" fill="none" />
    <path d="M25 50 Q35 45 45 52" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
    <path d="M30 65 Q40 60 55 68" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
    {/* Trees on mortal side */}
    <path d="M35 40 L37 33 L39 40" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    <path d="M42 42 L44 35 L46 42" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    {/* Fae Lands (right) with wilder terrain */}
    <path d="M115 25 Q130 18 150 28 Q168 35 180 30 L180 95 Q165 88 145 82 Q125 78 115 88Z" stroke="currentColor" strokeWidth="0.6" fill="none" />
    <path d="M120 50 Q135 42 150 55 Q160 60 170 52" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
    <path d="M125 70 Q140 62 155 72" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
    {/* Wild forest on fae side */}
    <path d="M130 38 L133 28 L136 38" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.35" />
    <path d="M140 35 L143 25 L146 35" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.35" />
    <path d="M150 40 L153 30 L156 40" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
    {/* Pins */}
    <circle cx="55" cy="55" r="1.8" className="fill-secondary" />
    <circle cx="150" cy="50" r="1.8" className="fill-secondary" />
    {/* Path through wall */}
    <path d="M85 60 Q92 58 100 60 Q108 62 115 60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" fill="none" opacity="0.35" />
    {/* Labels */}
    <text x="50" y="100" textAnchor="middle" fill="currentColor" fontSize="4.5" fontFamily="serif" opacity="0.3">Mortal Lands</text>
    <text x="150" y="100" textAnchor="middle" fill="currentColor" fontSize="4.5" fontFamily="serif" opacity="0.3">Prythian</text>
  </svg>
);

/* ═══════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <div id="landing-scroll" className="h-screen overflow-y-auto bg-background text-foreground">
      {/* ── Sticky Nav ── */}
      <nav
        className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all ${
          scrolled ? "bg-background/90 backdrop-blur-sm border-b border-border" : ""
        }`}
      >
        <SeeneryLogo variant="sidebar" />
        <div className="hidden sm:flex items-center gap-4">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</a>
          <Button className="bg-primary text-primary-foreground text-sm rounded-full px-5 h-9">Start Free</Button>
        </div>
        <button className="sm:hidden p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-[60px] z-40 bg-background border-b border-border px-6 py-4 flex flex-col gap-3">
          <a href="#" className="text-sm text-muted-foreground">Sign In</a>
          <Button className="bg-primary text-primary-foreground text-sm rounded-full w-full h-9">Start Free</Button>
        </div>
      )}

      {/* ══ Section 1 — Hero ══ */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pb-16">
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground leading-tight max-w-3xl mb-6">
          See your story's world.
        </h1>

        <p className="text-muted-foreground text-base md:text-lg max-w-xl mb-10 leading-relaxed">
          Your visual companion while you write. Render your story's setting as a clean line drawing, see what's in your head, plan where everything happens, and write with clarity.
        </p>

        {/* Hero app preview */}
        <div className="w-full max-w-4xl border border-border rounded-xl shadow-lg overflow-hidden bg-card mb-8">
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-muted/50 border-b border-border">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-secondary/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/40" />
            <span className="ml-3 text-[10px] text-muted-foreground">Wrender &mdash; Isla Serrano</span>
          </div>
          <div className="h-64 md:h-96 bg-[hsl(40,20%,97%)] flex items-center justify-center relative overflow-hidden">
            <svg viewBox="0 0 600 300" className="w-full h-full" fill="none">
              {/* Water lines */}
              <line x1="0" y1="210" x2="600" y2="210" stroke="currentColor" strokeWidth="0.3" opacity="0.06" />
              <line x1="0" y1="225" x2="600" y2="225" stroke="currentColor" strokeWidth="0.3" opacity="0.04" />
              <line x1="0" y1="240" x2="600" y2="240" stroke="currentColor" strokeWidth="0.3" opacity="0.03" />
              {/* Island outline with coastline detail */}
              <path
                d="M140 160 Q150 120 185 102 Q215 88 260 82 Q300 75 340 80 Q380 72 420 98 Q450 115 465 148 Q470 168 455 182 Q430 195 395 198 Q360 205 320 200 Q280 210 240 200 Q200 195 170 182 Q148 175 142 168Z"
                stroke="currentColor" strokeWidth="1.2" fill="none"
              />
              {/* Interior coastline details */}
              <path d="M180 150 Q200 142 220 148" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
              <path d="M350 150 Q370 142 400 155" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
              {/* Roads */}
              <path d="M200 130 Q250 125 300 128 Q350 125 400 135" stroke="currentColor" strokeWidth="0.4" strokeDasharray="4 3" opacity="0.2" />
              <path d="M250 105 L250 170" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 3" opacity="0.15" />
              <path d="M350 95 L350 180" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 3" opacity="0.15" />
              {/* Building outlines */}
              <rect x="225" y="115" width="12" height="8" rx="0.5" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
              <rect x="340" y="108" width="14" height="10" rx="0.5" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.3" />
              <rect x="380" y="140" width="10" height="7" rx="0.5" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.25" />
              {/* Pins with labels */}
              <circle cx="250" cy="128" r="5" className="fill-secondary" />
              <text x="250" y="108" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="Playfair Display, serif" opacity="0.6">Lighthouse</text>
              <circle cx="350" cy="110" r="5" className="fill-secondary" />
              <text x="350" y="98" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="Playfair Display, serif" opacity="0.6">Hotel</text>
              <circle cx="400" cy="145" r="4" className="fill-primary" />
              <text x="415" y="142" fill="currentColor" fontSize="7" opacity="0.45">Police Station</text>
              <circle cx="200" cy="150" r="4" className="fill-primary" />
              <text x="200" y="142" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.45">Ferry Dock</text>
              {/* Compass */}
              <line x1="540" y1="55" x2="540" y2="80" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              <line x1="530" y1="67" x2="550" y2="67" stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
              <text x="540" y="52" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="Playfair Display, serif" opacity="0.25">N</text>
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-10 h-px bg-secondary" />
          <p className="font-serif italic text-foreground/50 text-sm md:text-base">
            From the world in your head to something you can actually see.
          </p>
          <div className="w-10 h-px bg-secondary" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <Button className="bg-primary text-secondary font-medium rounded-full px-8 h-11 text-base">
            Start Free
          </Button>
          <button onClick={() => scrollTo("how-it-works")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            See How It Works <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground/60">14-day free trial. No credit card required.</p>
      </section>

      {/* ══ Section 2 — From Imagination to Reality ══ */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <span className="text-xs font-medium text-secondary uppercase tracking-widest mb-3 block">The idea behind Wrender</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight mb-2">You imagined it.</h2>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6">Now you can see it.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Your story's world is vivid, detailed, fully formed, but invisible to everyone else. Wrender takes the world you've been carrying in your head and turns it into something you can see, plan, and build on.
          </p>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          <div className="flex flex-col items-center">
            <svg width="160" height="120" viewBox="0 0 160 120" fill="none" className="mb-3">
              {/* Dotted island with coastline shape */}
              <path
                d="M28 62 Q32 38 50 30 Q65 22 82 26 Q100 20 118 32 Q132 42 135 58 Q138 72 128 80 Q115 88 95 90 Q75 94 55 88 Q38 82 30 72Z"
                stroke="currentColor" strokeWidth="0.8" strokeDasharray="2.5 2.5" fill="none" opacity="0.35"
              />
              <path d="M50 55 Q65 48 80 54" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" fill="none" opacity="0.2" />
              <circle cx="80" cy="50" r="1.5" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.5 1.5" fill="none" opacity="0.25" />
            </svg>
            <p className="text-xs italic text-muted-foreground">Your world</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground/50">Wrender</span>
            <svg width="60" height="20" viewBox="0 0 60 20" fill="none" className="md:block hidden">
              <line x1="0" y1="10" x2="50" y2="10" stroke="hsl(var(--secondary))" strokeWidth="1.5" />
              <path d="M46 5 L55 10 L46 15" stroke="hsl(var(--secondary))" strokeWidth="1.5" fill="none" />
            </svg>
            <svg width="20" height="40" viewBox="0 0 20 40" fill="none" className="md:hidden block">
              <line x1="10" y1="0" x2="10" y2="32" stroke="hsl(var(--secondary))" strokeWidth="1.5" />
              <path d="M5 28 L10 37 L15 28" stroke="hsl(var(--secondary))" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          <div className="flex flex-col items-center">
            <svg width="160" height="120" viewBox="0 0 160 120" fill="none" className="mb-3">
              {/* Solid island with coastline detail, roads, buildings */}
              <path
                d="M28 62 Q32 38 50 30 Q65 22 82 26 Q100 20 118 32 Q132 42 135 58 Q138 72 128 80 Q115 88 95 90 Q75 94 55 88 Q38 82 30 72Z"
                stroke="currentColor" strokeWidth="1.2" fill="none"
              />
              {/* Interior roads */}
              <path d="M50 55 Q65 48 85 52 Q105 48 120 55" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 2" opacity="0.25" />
              <path d="M75 35 L75 75" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 2" opacity="0.2" />
              {/* Building outlines */}
              <rect x="68" y="48" width="6" height="5" rx="0.3" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.35" />
              <rect x="90" y="45" width="8" height="5" rx="0.3" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.35" />
              {/* Terrain */}
              <path d="M45 65 Q55 60 65 66" stroke="currentColor" strokeWidth="0.35" opacity="0.2" />
              <circle cx="80" cy="50" r="2" className="fill-primary" />
            </svg>
            <p className="text-xs italic text-muted-foreground">Your setting</p>
          </div>
        </div>
      </section>

      {/* ══ Section 3 — Writing Companion ══ */}
      <section className="py-20 px-6 md:px-12 bg-[hsl(40,20%,97%)]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-medium text-secondary uppercase tracking-widest mb-3 block">Built for while you write</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              Sometimes seeing what's in your head helps you write what comes next.
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>You are mid-chapter. Two of your characters split up and head in different directions across your story's world. You know roughly where they go, but is the timing right? Does the geography hold up?</p>
              <p>Wrender sits alongside your writing. Open it when you need to think visually, place your events on the map, and figure out what happens next before you write it.</p>
              <p className="font-medium text-foreground">Not after you finish your book. While you are writing it.</p>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-destructive/40" />
              <span className="w-2 h-2 rounded-full bg-secondary/40" />
              <span className="w-2 h-2 rounded-full bg-green-400/40" />
            </div>
            <div className="flex h-56 md:h-64">
              <div className="flex-1 p-4 border-r border-border bg-card">
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-full" />
                  <div className="h-2 bg-muted rounded w-5/6" />
                  <div className="h-2 bg-muted rounded w-2/3" />
                  <div className="h-6" />
                  <div className="h-2 bg-muted rounded w-full" />
                  <div className="h-2 bg-muted rounded w-4/5" />
                  <div className="h-2 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-full" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
                <p className="text-[8px] text-muted-foreground/40 mt-3 font-serif italic">Your writing app</p>
              </div>
              <div className="flex-1 bg-[hsl(40,20%,97%)] flex items-center justify-center">
                <svg viewBox="0 0 160 120" className="w-4/5 h-4/5" fill="none">
                  <path d="M30 60 Q40 35 60 30 Q80 25 100 30 Q120 40 130 60 Q120 70 100 75 Q80 80 60 75 Q40 70 30 60Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
                  <path d="M50 55 Q65 48 80 54 Q95 48 110 55" stroke="currentColor" strokeWidth="0.35" strokeDasharray="2 2" opacity="0.2" />
                  <circle cx="70" cy="48" r="2.5" className="fill-secondary" />
                  <circle cx="100" cy="45" r="2.5" className="fill-secondary" />
                  <circle cx="85" cy="55" r="2" className="fill-primary" />
                  <line x1="20" y1="90" x2="140" y2="90" stroke="currentColor" strokeWidth="0.3" opacity="0.1" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Section 4 — The Problem ══ */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="text-xs font-medium text-secondary uppercase tracking-widest mb-3 block">Sound familiar?</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Your story's world lives entirely in your head.</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">Before Wrender</h3>
            <ul className="space-y-3">
              {["Scribbled maps on notebook paper you keep losing","Stopping mid-scene because you can't picture the geography","Characters whose locations you're constantly second-guessing","Plot events you know happen somewhere but can't visualise","Staring at a blank page when you could be planning what comes next"].map((t) => (
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
              {["A precise line sketch of your setting, always open beside your writing","Every location planned before you write the scene","Characters tracked across your world so you always know where everyone is","Plot events pinned to the sketch so you can see the story spatially","Clarity on what happens next, before you write a single word"].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══ Section 5 — Three Core Features ══ */}
      <section className="py-20 px-6 md:px-12 bg-[hsl(40,20%,97%)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <IconSketchSetting />
              <h3 className="font-serif font-semibold text-lg mb-2">Render Your Setting</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Describe your world or upload a reference. Wrender generates a precise architectural line sketch of your setting, like a location sketch for your story.</p>
            </div>
            <div className="text-center p-6">
              <IconPlaceStory />
              <h3 className="font-serif font-semibold text-lg mb-2">Place Your Story</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Pin plot events and scenes directly onto your sketch. See exactly where everything happens, and whether your story's geography actually works.</p>
            </div>
            <div className="text-center p-6">
              <IconTrackChars />
              <h3 className="font-serif font-semibold text-lg mb-2">Track Your Characters</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Track your characters across your setting. Know where everyone is at every moment, especially when your scenes get complex.</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="#" className="text-sm text-secondary font-medium hover:underline">See all features →</a>
          </div>
        </div>
      </section>

      {/* ══ Section 6 — Three Books Demo ══ */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <span className="text-xs font-medium text-secondary uppercase tracking-widest mb-3 block">Works for every kind of story</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">If setting matters to your story, Wrender is for you.</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Whether your world is a fantasy kingdom, a controlled dystopia, or a sun-bleached island, if place shapes your story, you need to see it.</p>
        </div>
        <div className="max-w-5xl mx-auto flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:overflow-visible">
          <BookCard title="The Paper Palace" genre="Literary Fiction" setting="Cape Cod, Massachusetts" quote="The lake, the house, the woods. Every scene lives in a specific place." sketch={<CapeCodSketch />} />
          <BookCard title="The Giver" genre="Dystopian Fiction" setting="The Community" quote="The boundary between here and Elsewhere is everything." sketch={<CommunitySketch />} />
          <BookCard title="A Court of Thorns and Roses" genre="Fantasy" setting="Prythian" quote="You need to know where the Wall is before you can cross it." sketch={<PrythianSketch />} />
        </div>
      </section>

      {/* ══ Section 7 — How It Works ══ */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 bg-[hsl(40,20%,97%)]">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <span className="text-xs font-medium text-secondary uppercase tracking-widest mb-3 block">How it works</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">From the world in your head to a precise line sketch in minutes.</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] border-t border-dashed border-foreground/20" />
          <Step num={1} title="Describe what you imagined" desc="Type a description of your setting or upload reference images of real places that inspired your world." icon={<StepIcon1 />} />
          <Step num={2} title="Mark it up" desc="Circle what to keep, exclude, or adapt. Guide Wrender toward your exact vision using the markup tool." icon={<StepIcon2 />} />
          <Step num={3} title="Render your sketch" desc="Wrender draws a precise black line sketch of your setting, like an architectural drawing or a director's location map." icon={<StepIcon3 />} />
          <Step num={4} title="Write alongside it" desc="Keep Wrender open while you write. Drop pins, track characters, plan scenes. Your sketch grows as your story does." icon={<StepIcon4 />} />
        </div>
      </section>

      {/* ══ Section 8 — Writer Quote ══ */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif text-xl md:text-2xl italic text-foreground leading-relaxed mb-6">
            "I always knew what the island looked like. I just couldn't see it until I rendered it out in Wrender. Now I visualise every scene before I write it."
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-border" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Fiction writer</p>
              <p className="text-xs text-muted-foreground/60">Thriller set on an island</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Section 9 — Pricing ══ */}
      <section className="py-20 px-6 md:px-12 bg-[hsl(40,20%,97%)]">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <span className="text-xs font-medium text-secondary uppercase tracking-widest mb-3 block">Pricing</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">Simple, writer-friendly pricing.</h2>
          <p className="text-muted-foreground">Start free. Upgrade when your world demands it.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <PricingCard name="Free" price="$0" features={["1 project","Up to 10 map pins","5 characters","Basic line sketch generation","Watermarked export"]} cta="Start Free" />
          <PricingCard name="Storyteller" price="$9/month" period="$7/month billed annually" popular features={["Unlimited projects","Unlimited pins & characters","AI sketch generation","Upload & adapt real locations","Clean export, print ready","Location sketch mood boards"]} cta="Start Free Trial" />
          <PricingCard name="Worldbuilder" price="$15/month" period="$12/month billed annually" features={["Everything in Storyteller","Character movement mapping","Advanced timeline view","Co-authoring","Priority generation","Full version history"]} cta="Start Free Trial" />
        </div>
        <p className="text-center text-xs text-muted-foreground/60 mt-8">All plans include a 14-day free trial. No credit card required.</p>
      </section>

      {/* ══ Section 10 — Emotional Close ══ */}
      <section className="py-24 px-6 text-center">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-2xl mx-auto mb-2">You imagined it.</h2>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-2xl mx-auto mb-8">Now you can see it.</h2>
        <p className="text-muted-foreground mb-8">Join writers who visualise their world in Wrender.</p>
        <Button className="bg-primary text-secondary font-medium rounded-full px-10 h-12 text-base mb-3">Start Visualising Your World</Button>
        <p className="text-xs text-muted-foreground/60">Free to start. No credit card. 14-day trial.</p>
      </section>

      {/* ══ Section 11 — Footer ══ */}
      <footer className="border-t border-border py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <SeeneryLogo variant="sidebar" />
          <p className="text-xs italic font-serif text-muted-foreground/50">Render your world. Write your story.</p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Features</a>
            <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#" className="hover:text-foreground transition-colors">Sign In</a>
            <a href="#" className="hover:text-foreground transition-colors font-medium text-foreground">Start Free</a>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground/40 mt-6">© 2025 Wrender. Built for fiction writers.</p>
      </footer>
    </div>
  );
}
