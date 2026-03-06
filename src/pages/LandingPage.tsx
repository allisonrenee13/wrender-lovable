import { useState, useEffect } from "react";
import { SeeneryLogo } from "@/components/SeeneryLogo";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Menu, X } from "lucide-react";

/* ───── SVG Icons (architectural / drafting style) ───── */
const IconSketchSetting = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
    <path d="M12 28 Q14 20 20 18 Q24 16 30 18 Q36 21 38 28 Q34 30 30 31 Q24 33 20 31 Q14 30 12 28Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <line x1="8" y1="34" x2="40" y2="34" stroke="currentColor" strokeWidth="0.6" opacity="0.15" />
    <line x1="10" y1="37" x2="38" y2="37" stroke="currentColor" strokeWidth="0.6" opacity="0.1" />
    <circle cx="24" cy="23" r="1.5" className="fill-secondary" />
  </svg>
);

const IconPlaceStory = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
    <path d="M24 10 C24 10 18 18 18 23 C18 27 21 29 24 29 C27 29 30 27 30 23 C30 18 24 10 24 10Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <circle cx="24" cy="22" r="2" className="fill-secondary" />
    <line x1="16" y1="34" x2="32" y2="34" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
    <line x1="18" y1="37" x2="30" y2="37" stroke="currentColor" strokeWidth="0.6" opacity="0.15" />
  </svg>
);

const IconTrackChars = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
    <circle cx="24" cy="16" r="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path d="M15 36 C15 28 19 25 24 25 C29 25 33 28 33 36" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <circle cx="30" cy="20" r="1" className="fill-secondary" />
    <path d="M30 22 L30 25" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.5 1.5" opacity="0.4" />
  </svg>
);

/* ───── Step icons ───── */
const StepIcon1 = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2">
    <rect x="4" y="6" width="24" height="20" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
    <line x1="8" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
    <line x1="8" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
    <line x1="8" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
  </svg>
);
const StepIcon2 = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2">
    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" fill="none" />
    <path d="M12 14 L20 14 L18 20 L10 20 Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
  </svg>
);
const StepIcon3 = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2">
    <path d="M8 20 Q10 14 14 12 Q18 10 22 12 Q26 15 26 20" stroke="currentColor" strokeWidth="1" fill="none" />
    <circle cx="16" cy="15" r="1" className="fill-secondary" />
    <line x1="6" y1="22" x2="28" y2="22" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
  </svg>
);
const StepIcon4 = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2">
    <rect x="4" y="4" width="11" height="24" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <rect x="17" y="4" width="11" height="24" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <line x1="6" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <line x1="6" y1="13" x2="12" y2="13" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    <path d="M19 14 Q21 11 23 12 Q25 13 25 15" stroke="currentColor" strokeWidth="0.6" fill="none" />
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
      <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-xs font-serif font-bold text-primary mb-2">
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
    <rect x="60" y="30" width="30" height="25" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <ellipse cx="140" cy="60" rx="25" ry="15" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <path d="M30 80 Q50 70 80 75 Q110 80 130 70 Q150 65 170 75" stroke="currentColor" strokeWidth="0.6" fill="none" />
    <circle cx="75" cy="42" r="1.5" className="fill-secondary" />
    <circle cx="140" cy="58" r="1.5" className="fill-secondary" />
    <line x1="20" y1="95" x2="180" y2="95" stroke="currentColor" strokeWidth="0.3" opacity="0.15" />
  </svg>
);

const CommunitySketch = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
    <circle cx="100" cy="60" r="40" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <circle cx="100" cy="60" r="25" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" fill="none" />
    <line x1="60" y1="60" x2="140" y2="60" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
    <line x1="100" y1="20" x2="100" y2="100" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
    <rect x="90" y="50" width="20" height="20" rx="1" stroke="currentColor" strokeWidth="0.5" fill="none" />
    <circle cx="100" cy="60" r="1.5" className="fill-secondary" />
  </svg>
);

const PrythianSketch = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none">
    <line x1="100" y1="10" x2="100" y2="110" stroke="currentColor" strokeWidth="1" />
    <path d="M20 30 Q40 25 60 35 Q80 45 90 40 L90 100 Q70 95 50 85 Q30 80 20 90 Z" stroke="currentColor" strokeWidth="0.6" fill="none" />
    <path d="M110 30 Q130 20 150 35 Q170 45 180 40 L180 100 Q160 90 140 85 Q120 80 110 90 Z" stroke="currentColor" strokeWidth="0.6" fill="none" />
    <circle cx="60" cy="55" r="1.5" className="fill-secondary" />
    <circle cx="150" cy="50" r="1.5" className="fill-secondary" />
    <path d="M130 60 Q140 55 150 65 Q160 70 170 65" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" fill="none" opacity="0.4" />
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

        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-10 h-px bg-secondary" />
          <p className="font-serif italic text-foreground/50 text-sm md:text-base">
            From the world in your head — to something you can actually see.
          </p>
          <div className="w-10 h-px bg-secondary" />
        </div>

        <p className="text-muted-foreground text-base md:text-lg max-w-xl mb-8 leading-relaxed">
          Wrender is the visual companion writers use while writing. Sketch your story's setting as a clean line drawing — see what's in your head, plan where everything happens, and write with clarity.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <Button className="bg-primary text-secondary font-medium rounded-full px-8 h-11 text-base">
            Start Free
          </Button>
          <button onClick={() => scrollTo("how-it-works")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            See How It Works <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground/60">14-day free trial · No credit card required</p>

        {/* Hero app preview */}
        <div className="mt-12 w-full max-w-4xl border border-border rounded-xl shadow-lg overflow-hidden bg-card">
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-muted/50 border-b border-border">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-secondary/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/40" />
            <span className="ml-3 text-[10px] text-muted-foreground">Wrender — Isla Serrano</span>
          </div>
          <div className="h-64 md:h-96 bg-[hsl(40,20%,97%)] flex items-center justify-center relative overflow-hidden">
            <svg viewBox="0 0 600 300" className="w-full h-full" fill="none">
              <line x1="0" y1="200" x2="600" y2="200" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
              <line x1="0" y1="220" x2="600" y2="220" stroke="currentColor" strokeWidth="0.3" opacity="0.06" />
              <line x1="0" y1="240" x2="600" y2="240" stroke="currentColor" strokeWidth="0.3" opacity="0.04" />
              <path
                d="M150 160 Q165 110 210 95 Q260 78 310 82 Q360 72 410 100 Q450 120 465 155 Q458 178 430 188 Q390 202 340 196 Q290 208 240 196 Q195 192 168 180 Q148 174 150 160Z"
                stroke="currentColor" strokeWidth="1.5" fill="none"
              />
              <line x1="200" y1="100" x2="200" y2="190" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
              <line x1="260" y1="85" x2="260" y2="200" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
              <line x1="340" y1="80" x2="340" y2="195" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
              <line x1="400" y1="95" x2="400" y2="185" stroke="currentColor" strokeWidth="0.3" opacity="0.08" />
              <circle cx="250" cy="130" r="5" className="fill-secondary" />
              <text x="250" y="120" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="Playfair Display, serif" opacity="0.7">Lighthouse</text>
              <circle cx="350" cy="110" r="5" className="fill-secondary" />
              <text x="350" y="100" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="Playfair Display, serif" opacity="0.7">Hotel</text>
              <circle cx="400" cy="145" r="4" className="fill-primary" />
              <text x="400" y="138" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.5">Police Station</text>
              <circle cx="200" cy="155" r="4" className="fill-primary" />
              <text x="200" y="148" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.5">Ferry Dock</text>
              <text x="540" y="60" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="Playfair Display, serif" opacity="0.25">N</text>
              <line x1="540" y1="62" x2="540" y2="80" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
            </svg>
          </div>
        </div>
      </section>

      {/* ══ Section 2 — From Imagination to Reality ══ */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <span className="text-xs font-medium text-secondary uppercase tracking-widest mb-3 block">The idea behind Wrender</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight mb-2">You imagined it.</h2>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight mb-6">Now you can see it.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Your story's world is vivid, detailed, fully formed — but invisible to everyone else. Wrender takes the world you've been carrying in your head and turns it into something you can see, plan, and build on.
          </p>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          <div className="flex flex-col items-center">
            <svg width="160" height="120" viewBox="0 0 160 120" fill="none" className="mb-3">
              <path
                d="M30 65 Q35 40 55 33 Q75 26 95 30 Q115 25 130 45 Q140 55 138 68 Q130 78 110 82 Q85 88 65 82 Q42 78 32 72 Q28 70 30 65Z"
                stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.4"
              />
              <circle cx="80" cy="52" r="2" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.3" />
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
              <path
                d="M30 65 Q35 40 55 33 Q75 26 95 30 Q115 25 130 45 Q140 55 138 68 Q130 78 110 82 Q85 88 65 82 Q42 78 32 72 Q28 70 30 65Z"
                stroke="currentColor" strokeWidth="1.5" fill="none"
              />
              <circle cx="80" cy="52" r="2.5" className="fill-primary" />
              <line x1="50" y1="55" x2="70" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <line x1="90" y1="48" x2="115" y2="52" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <path d="M60 65 Q70 60 80 63" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
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
              <p>You're mid-chapter. Your characters are at the yacht club and split up — but you can't quite picture where everyone goes. You know the lighthouse is north and the hotel is south, but is the timing right? Does the geography work?</p>
              <p>Wrender sits alongside your writing. Open it when you need to think visually — see your setting as a clean line sketch, place your events on the map, and figure out what happens next before you write it.</p>
              <p className="font-medium text-foreground">Not after you finish your book. While you're writing it.</p>
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
              {["A precise line sketch of your setting — always open beside your writing","Every location planned before you write the scene","Characters tracked across your world — you always know where everyone is","Plot events pinned to the sketch so you can see the story spatially","Clarity on what happens next — before you write a single word"].map((t) => (
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
              <p className="text-sm text-muted-foreground leading-relaxed">Describe your world or upload a reference — Wrender generates a precise architectural line sketch of your setting. Like a floor plan for your story.</p>
            </div>
            <div className="text-center p-6">
              <IconPlaceStory />
              <h3 className="font-serif font-semibold text-lg mb-2">Place Your Story</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Pin plot events and scenes directly onto your sketch. See exactly where everything happens — and whether your story's geography actually works.</p>
            </div>
            <div className="text-center p-6">
              <IconTrackChars />
              <h3 className="font-serif font-semibold text-lg mb-2">Track Your Characters</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Track your characters across your setting. Know where everyone is at every moment — especially when your scenes get complex.</p>
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
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">If setting matters to your story — Wrender is for you.</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Whether your world is a fantasy kingdom, a controlled dystopia, or a sun-bleached island — if place shapes your story, you need to see it.</p>
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
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">From the world in your head — to a floor plan in minutes.</h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] border-t-2 border-dashed border-border" />
          <Step num={1} title="Describe what you imagined" desc="Type a description of your setting or upload reference images of real places that inspired your world." icon={<StepIcon1 />} />
          <Step num={2} title="Mark it up" desc="Circle what to keep, exclude, or adapt. Guide Wrender toward your exact vision using the markup tool." icon={<StepIcon2 />} />
          <Step num={3} title="Render your sketch" desc="Wrender draws a precise black line sketch of your setting — like an architectural floor plan or a director's location map." icon={<StepIcon3 />} />
          <Step num={4} title="Write alongside it" desc="Keep Wrender open while you write. Drop pins, track characters, plan scenes. Your sketch grows as your story does." icon={<StepIcon4 />} />
        </div>
      </section>

      {/* ══ Section 8 — Writer Quote ══ */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif text-xl md:text-2xl italic text-foreground leading-relaxed mb-6">
            "I always knew what the island looked like. I just couldn't see it — until I rendered it out in Wrender. Now I visualise every scene before I write it."
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
          <PricingCard name="Storyteller" price="$9/month" period="$7/month billed annually" popular features={["Unlimited projects","Unlimited pins & characters","AI sketch generation","Upload & adapt real locations","Clean export — print ready","Location sketch mood boards"]} cta="Start Free Trial" />
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
        <p className="text-xs text-muted-foreground/60">Free to start · No credit card · 14-day trial</p>
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
        <p className="text-center text-[10px] text-muted-foreground/40 mt-6">© 2025 Wrender · Built for fiction writers</p>
      </footer>
    </div>
  );
}
