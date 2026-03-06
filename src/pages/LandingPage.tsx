import { useState, useEffect } from "react";
import { SeeneryLogo } from "@/components/SeeneryLogo";
import { Button } from "@/components/ui/button";
import { ChevronDown, MapPin, BookOpen, Users, Check } from "lucide-react";

/* ───── tiny inline SVG icons for feature cards ───── */
const IconMapWorld = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
    <ellipse cx="24" cy="28" rx="18" ry="10" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
    <path d="M14 26 Q16 22 20 21 Q24 19 28 21 Q32 23 34 26" stroke="hsl(var(--foreground))" strokeWidth="1" fill="none" />
    <circle cx="24" cy="24" r="1.5" fill="hsl(var(--secondary))" />
    <path d="M24 14 L24 22" stroke="hsl(var(--foreground))" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
    <path d="M22 14 L24 10 L26 14" stroke="hsl(var(--foreground))" strokeWidth="1" fill="none" />
  </svg>
);

const IconPlaceStory = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
    <path d="M24 8 C24 8 18 14 18 20 C18 24 21 26 24 26 C27 26 30 24 30 20 C30 14 24 8 24 8Z" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
    <circle cx="24" cy="19" r="2" fill="hsl(var(--secondary))" />
    <rect x="19" y="30" width="10" height="12" rx="1" stroke="hsl(var(--foreground))" strokeWidth="1.2" fill="none" />
    <line x1="21" y1="34" x2="27" y2="34" stroke="hsl(var(--foreground))" strokeWidth="0.7" opacity="0.4" />
    <line x1="21" y1="36.5" x2="27" y2="36.5" stroke="hsl(var(--foreground))" strokeWidth="0.7" opacity="0.4" />
    <line x1="21" y1="39" x2="25" y2="39" stroke="hsl(var(--foreground))" strokeWidth="0.7" opacity="0.4" />
  </svg>
);

const IconCharacters = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
    <circle cx="24" cy="16" r="6" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
    <path d="M14 38 C14 30 19 26 24 26 C29 26 34 30 34 38" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" />
    <circle cx="30" cy="30" r="1.2" fill="hsl(var(--primary))" />
    <path d="M30 28 L30 25" stroke="hsl(var(--foreground))" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.5" />
  </svg>
);

/* ───── demo book card ───── */
function BookCard({ title, genre, setting, quote }: { title: string; genre: string; setting: string; quote: string }) {
  return (
    <div className="border border-border rounded-lg p-5 bg-card min-w-[280px] snap-center">
      <div className="h-36 bg-muted rounded-md mb-4 flex items-center justify-center">
        <span className="text-muted-foreground/30 text-xs italic font-serif">Map preview</span>
      </div>
      <span className="inline-block text-[10px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded mb-2">{genre}</span>
      <h4 className="font-serif font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground mb-3">{setting}</p>
      <p className="text-xs italic font-serif text-muted-foreground/70">"{quote}"</p>
    </div>
  );
}

/* ───── pricing card ───── */
function PricingCard({
  name, price, period, features, cta, popular
}: {
  name: string; price: string; period?: string; features: string[]; cta: string; popular?: boolean;
}) {
  return (
    <div className={`border rounded-lg p-6 bg-card relative flex flex-col ${popular ? "border-secondary shadow-md" : "border-border"}`}>
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-[10px] font-semibold px-3 py-0.5 rounded-full">
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

/* ───── step ───── */
function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center relative">
      <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-sm font-serif font-bold text-primary mb-3">
        {num}
      </div>
      <h4 className="font-serif font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-[220px]">{desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════ */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.getElementById("landing-scroll");
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="landing-scroll" className="h-screen overflow-y-auto bg-background">
      {/* ── Sticky nav ── */}
      <nav
        className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 transition-all ${
          scrolled ? "bg-background/90 backdrop-blur-sm border-b border-border" : ""
        }`}
      >
        <SeeneryLogo variant="sidebar" />
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">Sign In</a>
          <Button className="bg-primary text-primary-foreground text-sm rounded-full px-5 h-9">Start Free</Button>
        </div>
      </nav>

      {/* ── Section 1 — Hero ── */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pb-16">
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground leading-tight max-w-3xl mb-6">
          See your story's world.
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl mb-8 leading-relaxed">
          The visual world-building companion for fiction writers. Map your locations, place your characters, and see your story come alive — before you write a single word.
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
            <span className="ml-3 text-[10px] text-muted-foreground">Seenery — Isla Serrano</span>
          </div>
          <div className="h-64 md:h-96 bg-[#FAFAF7] flex items-center justify-center relative overflow-hidden">
            {/* Stylised island sketch */}
            <svg viewBox="0 0 600 300" className="w-full h-full" fill="none">
              {/* Water lines */}
              <line x1="0" y1="200" x2="600" y2="200" stroke="hsl(var(--foreground))" strokeWidth="0.3" opacity="0.08" />
              <line x1="0" y1="220" x2="600" y2="220" stroke="hsl(var(--foreground))" strokeWidth="0.3" opacity="0.06" />
              <line x1="0" y1="240" x2="600" y2="240" stroke="hsl(var(--foreground))" strokeWidth="0.3" opacity="0.04" />
              {/* Island */}
              <path
                d="M150 160 Q180 100 230 90 Q280 80 320 85 Q370 75 420 100 Q460 120 470 155 Q465 175 440 185 Q400 200 350 195 Q300 205 250 195 Q200 190 170 180 Q150 175 150 160 Z"
                stroke="hsl(var(--foreground))"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Pins */}
              <circle cx="250" cy="130" r="5" fill="hsl(var(--secondary))" />
              <text x="250" y="120" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="Playfair Display, serif" opacity="0.7">Lighthouse</text>
              <circle cx="350" cy="110" r="5" fill="hsl(var(--secondary))" />
              <text x="350" y="100" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="Playfair Display, serif" opacity="0.7">Hotel</text>
              <circle cx="400" cy="145" r="4" fill="hsl(var(--primary))" />
              <text x="400" y="138" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontFamily="DM Sans, sans-serif" opacity="0.5">Police Station</text>
              <circle cx="200" cy="155" r="4" fill="hsl(var(--primary))" />
              <text x="200" y="148" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontFamily="DM Sans, sans-serif" opacity="0.5">Ferry Dock</text>
              {/* Compass */}
              <text x="540" y="60" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontFamily="Playfair Display, serif" opacity="0.25">N</text>
              <line x1="540" y1="62" x2="540" y2="80" stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.2" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Section 2 — The Problem ── */}
      <section className="py-20 px-6 md:px-12 bg-[#FAFAF7]">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="text-xs font-medium text-secondary uppercase tracking-widest mb-3 block">Sound familiar?</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Your story's world lives entirely in your head.
          </h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">Before Seenery</h3>
            <ul className="space-y-3">
              {[
                "Scribbled maps on notebook paper you keep losing",
                "Characters whose locations you can't keep track of",
                "Plot events you know happen somewhere but can't visualise",
                "A world fully formed in your imagination that nobody else can see",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive/50 mt-1.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">With Seenery</h3>
            <ul className="space-y-3">
              {[
                "A beautiful illustrated map of your story's world",
                "Every location pinned, named, and connected to your plot",
                "Characters tracked across your world scene by scene",
                "Your imagination, made visible",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Section 3 — Features ── */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <IconMapWorld />
              <h3 className="font-serif font-semibold text-lg mb-2">Map Your World</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload a real place or describe your world — Seenery sketches it into a beautiful illustrated map. Add locations, drag pins, and watch your world take shape.
              </p>
            </div>
            <div className="text-center p-6">
              <IconPlaceStory />
              <h3 className="font-serif font-semibold text-lg mb-2">Place Your Story</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Drop plot events and character moments onto your map. See exactly where everything happens — and whether your story's geography makes sense.
              </p>
            </div>
            <div className="text-center p-6">
              <IconCharacters />
              <h3 className="font-serif font-semibold text-lg mb-2">See Your Characters</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track your characters across your world. Know where everyone is at every moment — especially in your most complex scenes.
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <a href="#" className="text-sm text-secondary font-medium hover:underline">See all features →</a>
          </div>
        </div>
      </section>

      {/* ── Section 4 — Three books ── */}
      <section className="py-20 px-6 md:px-12 bg-[#FAFAF7]">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">For every kind of story.</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Whether your world is a fantasy kingdom, a controlled dystopia, or a sun-bleached island — Seenery makes it visible.
          </p>
        </div>
        <div className="max-w-5xl mx-auto flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:overflow-visible">
          <BookCard title="The Paper Palace" genre="Literary Fiction" setting="Cape Cod, Massachusetts" quote="The setting IS the story." />
          <BookCard title="The Giver" genre="Dystopian Fiction" setting="The Community" quote="Every boundary matters." />
          <BookCard title="A Court of Thorns and Roses" genre="Fantasy" setting="Prythian" quote="A world worth getting lost in." />
        </div>
      </section>

      {/* ── Section 5 — How it works ── */}
      <section id="how-it-works" className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            From imagination to illustration in minutes.
          </h2>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
          {/* dotted connector on desktop */}
          <div className="hidden md:block absolute top-5 left-[12.5%] right-[12.5%] border-t-2 border-dashed border-border" />
          <Step num={1} title="Describe your world" desc="Type a description or upload reference images of real places that inspired your setting." />
          <Step num={2} title="Mark it up" desc="Circle what to keep, exclude, or adapt using the markup tool. Guide Seenery toward your exact vision." />
          <Step num={3} title="Generate your map" desc="Seenery sketches your world as a beautiful minimalist line art illustration — like the map at the front of a novel." />
          <Step num={4} title="Build on it" desc="Add locations, drop plot pins, track characters. Your map grows with your story." />
        </div>
      </section>

      {/* ── Section 6 — Pricing ── */}
      <section className="py-20 px-6 md:px-12 bg-[#FAFAF7]">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">Simple, writer-friendly pricing.</h2>
          <p className="text-muted-foreground">Start free. Upgrade when your world demands it.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <PricingCard
            name="Free"
            price="$0"
            features={["1 project", "Up to 10 map pins", "5 characters", "Basic map generation", "Watermarked export"]}
            cta="Start Free"
          />
          <PricingCard
            name="Storyteller"
            price="$9/month"
            period="$7/month billed annually"
            popular
            features={["Unlimited projects", "Unlimited pins & characters", "AI map generation", "Upload & adapt real locations", "Clean export — print ready", "Location mood boards"]}
            cta="Start Free Trial"
          />
          <PricingCard
            name="Worldbuilder"
            price="$15/month"
            period="$12/month billed annually"
            features={["Everything in Storyteller", "Character movement mapping", "Advanced timeline view", "Co-authoring", "Priority generation", "Version history"]}
            cta="Start Free Trial"
          />
        </div>
        <p className="text-center text-xs text-muted-foreground/60 mt-8">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </section>

      {/* ── Section 7 — Emotional close ── */}
      <section className="py-24 px-6 text-center">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-2xl mx-auto mb-6">
          Your world has always existed.<br />Now you can see it.
        </h2>
        <p className="text-muted-foreground mb-8">Join writers who are building their story's world in Seenery.</p>
        <Button className="bg-primary text-secondary font-medium rounded-full px-10 h-12 text-base mb-3">
          Start Building Your World
        </Button>
        <p className="text-xs text-muted-foreground/60">Free to start · No credit card · 14-day trial</p>
      </section>

      {/* ── Section 8 — Footer ── */}
      <footer className="border-t border-border py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <SeeneryLogo variant="sidebar" />
          <p className="text-xs italic font-serif text-muted-foreground/50">See your story's world.</p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Features</a>
            <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#" className="hover:text-foreground transition-colors">Sign In</a>
            <a href="#" className="hover:text-foreground transition-colors font-medium text-foreground">Start Free</a>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground/40 mt-6">© 2025 Seenery · Built for fiction writers</p>
      </footer>
    </div>
  );
}
