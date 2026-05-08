import { Link } from "wouter";
import { ArrowRight, ScanSearch, ShieldCheck, BookOpen, Zap } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <ScanSearch className="w-5 h-5 text-primary" />,
      title: "Neural Image Analysis",
      desc: "Upload any image and get a real-time AI-generation probability score powered by SightEngine.",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-primary" />,
      title: "Research-Grounded Chat",
      desc: "Ask our Groq-powered chatbot questions grounded in five peer-reviewed datasets on deepfake detection.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
      title: "Media Literacy Education",
      desc: "Understand the psychological, ethical, and societal impacts of synthetic media and AI-generated content.",
    },
    {
      icon: <Zap className="w-5 h-5 text-primary" />,
      title: "Instant Results",
      desc: "Get verdicts in seconds — no account required. Built for awareness, not surveillance.",
    },
  ];

  const stats = [
    { value: "48.2%", label: "Human detection baseline" },
    { value: "40%", label: "Videos expected to be deepfakes by 2024" },
    { value: "5", label: "Peer-reviewed research datasets" },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* Hero — centered single-column layout */}
      <section className="relative w-full py-28 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold">
            <ScanSearch className="w-3 h-3" />
            AI Detection Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Can You Trust<br />
            <span className="text-primary neon-text">What You See?</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed">
            Syntra uses neural AI detection to reveal whether an image is real or artificially generated — backed by peer-reviewed research.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/the-prototype">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all neon-glow">
                Try the Analyzer <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/the-issue">
              <button className="flex items-center gap-2 px-7 py-3.5 rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-all">
                Learn the Issue
              </button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-6 flex flex-col sm:flex-row gap-8 sm:gap-12 items-center justify-center">
            {stats.map((stat) => (
              <div key={stat.value} className="text-center">
                <p className="text-2xl font-mono font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[140px] leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="w-full py-20 px-6 border-t border-border/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold font-mono mb-3">CAPABILITIES</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the truth</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Two tools, one mission — expose synthetic media and build resilient media literacy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl border border-border/50 bg-card/40 hover:border-primary/30 hover:bg-card/60 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="w-full py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Start detecting <span className="text-primary">today</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              No account required. Upload an image and get an AI-generation verdict in seconds.
            </p>
            <Link href="/the-prototype">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all neon-glow">
                Open the Prototype <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
