import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import {
  Camera, Search, Shield, Tag, LineChart, Sparkles, Check, ArrowRight, Quote,
} from "lucide-react";

const FEATURES = [
  { icon: Camera, title: "Screenshot every setup", body: "Snap and attach charts to every trade — visual memory beats scribbled notes." },
  { icon: Tag, title: "Tag and categorize", body: "Tag trades by setup, sector, or mistake. Find patterns you couldn't see before." },
  { icon: Search, title: "Instant search", body: "Search across stocks, setups, and tags. Your edge, one keystroke away." },
  { icon: Shield, title: "Private & secure", body: "Your journals stay yours. Isolated per account with server-side protection." },
  { icon: LineChart, title: "Setup library", body: "Breakout, Pullback, CPR, Trendline, S/R, MA — the setups pros actually track." },
  { icon: Sparkles, title: "Beautiful & fast", body: "A journal you'll actually want to open every morning. Light and dark mode included." },
];

const FAQ = [
  { q: "Is Trade Journal free?", a: "Yes — the Free plan gives you unlimited journal entries, screenshots and search. We may add a Pro tier later, but the core will always be free." },
  { q: "Are my journals private?", a: "Absolutely. Every journal is tied to your account. No one else — not even us in an ordinary workflow — can see your entries." },
  { q: "Can I use it on mobile?", a: "Yes, the interface is fully responsive. Log trades from your phone right after the close." },
  { q: "Which trading setups are supported?", a: "Breakout, Pullback, CPR, Trendline, Support & Resistance, Moving Average and Other. Use tags for finer categorization." },
  { q: "Do you support dark mode?", a: "Yes. Toggle between light and dark from any page — your preference is remembered." },
];

const TESTIMONIALS = [
  { name: "Maya R.", role: "Swing trader", body: "I used to lose my best setups in a mess of screenshots. Trade Journal is where every trade finally lives." },
  { name: "Arjun S.", role: "Options trader", body: "The tags + search combo is unfair. I found a pattern in my losers within a week." },
  { name: "Elena K.", role: "Prop desk", body: "The cleanest journaling UI I've used. It doesn't get in the way — it disappears." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 dot-pattern opacity-60" />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge variant="secondary" className="mb-6 rounded-full font-mono text-xs" data-testid="hero-badge">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Free during beta
            </Badge>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-7xl tracking-tight leading-[1.02]">
              Journal every trade.<br />
              <span className="text-muted-foreground">Compound every lesson.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Trade Journal is a private, secure trading journal for stock and options traders.
              Screenshot setups, tag your logic, and search your entire history in seconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/signup"><Button size="lg" className="rounded-full px-6" data-testid="hero-get-started-btn">
                Get started — free <ArrowRight className="h-4 w-4 ml-1" />
              </Button></Link>
              <Link to="/login"><Button size="lg" variant="ghost" className="rounded-full" data-testid="hero-login-btn">
                I already have an account
              </Button></Link>
            </div>
            <div className="mt-10 flex items-center gap-8 text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
              <span>No credit card</span><span>·</span><span>Data stays yours</span><span>·</span><span>Ready in 30 seconds</span>
            </div>
          </motion.div>

          {/* Product screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-16 lg:mt-24 rounded-xl border border-border bg-card overflow-hidden shadow-xl"
          >
            <div className="flex items-center gap-1.5 px-4 h-9 border-b border-border bg-muted/50">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              <div className="ml-4 text-xs text-muted-foreground font-mono">app.tradejournal.com/dashboard</div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"
              alt="Trade Journal dashboard preview"
              className="w-full aspect-[16/9] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Features</div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mt-3">
            Everything a serious trader keeps notes on.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {FEATURES.map((f, i) => (
            <Card key={i} className="p-6 border-border hover:-translate-y-1 transition-transform">
              <f.icon className="h-5 w-5 text-primary" />
              <div className="font-display font-bold text-lg mt-4">{f.title}</div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="mx-auto max-w-7xl px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-xl overflow-hidden border border-border">
          <img
            src="https://images.unsplash.com/photo-1625297673326-14790108da55?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
            alt="Trader at desk"
            className="w-full aspect-[4/5] object-cover"
          />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Why traders journal</div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl mt-3">
            The gap between good and great is written down.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Every professional trader we know keeps a journal. Not because it&apos;s trendy — because reviewing yesterday&apos;s decisions is the highest-leverage thing you can do this week.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Catch recurring mistakes before they compound",
              "Build a personal library of high-conviction setups",
              "Turn hindsight into a repeatable checklist",
              "Track your emotional patterns, not just your P&L",
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-sm">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why choose */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <h2 className="font-display font-bold text-3xl sm:text-4xl max-w-2xl">
            Why traders choose Trade Journal.
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { k: "01", t: "Private by default", b: "Isolated per-user storage with server-side auth. No sharing surface." },
              { k: "02", t: "Zero friction capture", b: "Auto-saved drafts, image uploads, and one-tap tagging. Save a trade in under 20 seconds." },
              { k: "03", t: "Built by traders", b: "The workflow, dropdown values and default setups come from real desks — not a template gallery." },
            ].map((x) => (
              <div key={x.k}>
                <div className="font-mono text-sm text-muted-foreground">{x.k}</div>
                <div className="font-display font-bold text-xl mt-2">{x.t}</div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{x.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Loved by traders</div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl mt-3 max-w-2xl">Real reviews from real users.</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} className="p-6 border-border">
              <Quote className="h-5 w-5 text-muted-foreground" />
              <p className="mt-4 text-sm leading-relaxed">{t.body}</p>
              <div className="mt-6">
                <div className="font-display font-bold text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{t.role}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground text-center">Pricing</div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl mt-3 text-center">One plan. Free. Forever core.</h2>
        <div className="mt-12 max-w-md mx-auto">
          <Card className="p-8 border-2 border-primary/20">
            <div className="font-display font-bold text-2xl">Free</div>
            <div className="mt-2 text-muted-foreground text-sm">Everything you need to journal seriously.</div>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display font-extrabold text-5xl">$0</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Unlimited journals",
                "Screenshot uploads",
                "Instant search & tags",
                "Dark & light modes",
                "Private per-user storage",
              ].map((line, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" /> {line}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="block mt-8"><Button size="lg" className="w-full rounded-full" data-testid="pricing-cta-btn">Start journaling</Button></Link>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
        <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">FAQ</div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl mt-3">Answers, before you ask.</h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} data-testid={`faq-item-${i}`}>
              <AccordionTrigger className="text-left font-display font-semibold">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <MarketingFooter />
    </div>
  );
}
