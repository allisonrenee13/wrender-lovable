import { useState } from "react";
import { SeeneryLogo } from "@/components/SeeneryLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submitWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email || submitState === "loading") return;
    setSubmitState("loading");
    try {
      const res = await fetch("https://app.loops.so/api/newsletter-form/[FORM_ID]", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setSubmitState("success"); setEmail(""); }
      else setSubmitState("error");
    } catch { setSubmitState("error"); }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-border">
        <SeeneryLogo variant="sidebar" />
        <a
          href="/welcome"
          className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in
        </a>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <h1 className="font-serif text-3xl md:text-5xl font-semibold text-foreground text-center max-w-xl leading-tight">
          Be first to Wrender your world.
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground text-center max-w-md leading-relaxed">
          A visual writing companion for fiction writers. Sketch your setting, pin your plot, track your characters. Launching soon.
        </p>

        {/* Email capture */}
        <div className="mt-8 w-full max-w-md">
          {submitState === "success" ? (
            <p className="font-serif italic text-secondary text-center text-base md:text-lg">
              You're on the list! We'll email you when Wrender launches.
            </p>
          ) : (
            <form onSubmit={submitWaitlist} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-11 rounded-full border-border bg-background px-5 text-sm"
              />
              <Button
                type="submit"
                disabled={submitState === "loading"}
                className="h-11 rounded-full px-6 text-sm font-medium"
              >
                {submitState === "loading" ? "Joining..." : "Join the waitlist"}
              </Button>
            </form>
          )}
          {submitState === "error" && (
            <p className="mt-2 text-sm text-destructive text-center">
              Something went wrong. Try again.
            </p>
          )}
        </div>

        {/* Trust lines */}
        <div className="mt-8 flex flex-col items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Free to join. No credit card.</span>
          <span className="text-xs text-muted-foreground">Early access when we launch.</span>
          <span className="text-xs text-muted-foreground">Built by a writer, for writers.</span>
        </div>

        {/* Mini map sketch */}
        <div className="mt-16 w-40 md:w-52 text-muted-foreground/30">
          <PrythianSketch />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-border">
        <p className="font-serif text-sm text-muted-foreground">
          Wrender your world. Write your story.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Wrender. All rights reserved.
        </p>
      </footer>

      {/* Plausible analytics — uncomment when ready */}
      {/* <script defer data-domain="wrender.app" src="https://plausible.io/js/script.js" /> */}
    </div>
  );
}
