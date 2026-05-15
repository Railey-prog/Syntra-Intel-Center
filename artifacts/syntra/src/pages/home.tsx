import { Link } from "wouter";
import { ArrowRight, ScanSearch, ShieldCheck, BookOpen, Zap, Bot, CheckCircle } from "lucide-react";

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
    { value: "~40%", label: "Videos expected to be deepfakes by 2024" },
    { value: "5", label: "Peer-reviewed research datasets" },
  ];

  const trustItems = [
    "No account required",
    "Grounded in peer-reviewed research",
    "Instant AI-generation verdict",
    "Privacy-first — images not stored",
  ];

  return (
    <div className="w-full flex flex-col">

      {/* ── Hero ── */}
      <section className="w-full py-20 md:py-28 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div className="flex flex-col gap-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-semibold w-fit">
                <ScanSearch className="w-3 h-3" />
                AI Detection Platform
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.06] text-foreground">
                Can You Trust<br />
                <span className="text-primary">What You See?</span>
              </h1>

              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                Syntra uses neural AI detection to reveal whether an image is real or artificially generated — backed by peer-reviewed research.
              </p>

              <div className="flex flex-col gap-2">
                {trustItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link href="/the-prototype#live-image-analyzer">
                  <button className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all neon-glow">
                    Try the Analyzer <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/the-issue">
                  <button className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-slate-200 text-muted-foreground hover:text-foreground hover:border-slate-300 hover:bg-slate-50 transition-all">
                    Learn the Issue
                  </button>
                </Link>
              </div>
            </div>

            {/* Right: visual card */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-sm mx-auto">
                {/* Decorative blob */}
                <div className="absolute -inset-6 rounded-3xl bg-primary/6 blur-2xl" />

                {/* Main card */}
                <div className="relative rounded-3xl border border-slate-200 bg-white shadow-xl p-6 flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
                      <ScanSearch className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Syntra Scanner</p>
                      <p className="text-xs text-muted-foreground">AI Detection Engine</p>
                    </div>
                    <span className="ml-auto text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">● Live</span>
                  </div>

                  {/* Mock analysis result */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>AI-Generation Score</span>
                      <span className="font-mono font-bold text-primary">87.4%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "87.4%" }} />
                    </div>
                    <p className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      ⚠ Very likely AI-generated
                    </p>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {stats.map((s) => (
                      <div key={s.value} className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-base font-extrabold text-primary">{s.value}</p>
                        <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Dark banner ── */}
      <section className="w-full py-16 px-6 bg-slate-900">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            We Made Detection <span className="text-primary">Easier.</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Two powerful tools. One shared mission — expose synthetic media and build resilient media literacy.
          </p>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="w-full py-20 px-6 bg-slate-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Built for the truth</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              Two tools, one mission — expose synthetic media and build resilient media literacy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-7 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="w-full py-20 px-6 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-3xl border border-primary/15 bg-primary/5 p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-foreground">
              Start detecting <span className="text-primary">today</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
              No account required. Upload an image and get an AI-generation verdict in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/the-prototype#live-image-analyzer">
                <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all neon-glow">
                  Open the Prototype <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("openSyntraChat"))}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-slate-200 text-muted-foreground hover:text-foreground hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold"
              >
                <Bot className="w-4 h-4" />
                Ask the Chatbot
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
