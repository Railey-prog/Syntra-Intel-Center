import { useEffect } from "react";
import {
  ScanSearch,
  Terminal,
  Bot,
  ArrowRight,
  Database,
  Cpu,
  MessageSquare,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react";
import { ImageAnalyzer } from "@/components/ImageAnalyzer";
import { ChatbotPreview } from "@/components/ChatbotPreview";

function ArchitectureSection() {
  return (
    <div className="mb-20">
      <div className="text-center mb-10">
        <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">
          System Architecture
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">How it works</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Analyzer pipeline */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ScanSearch className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">
              Image Analyzer Pipeline
            </span>
          </div>

          <div className="space-y-2">
            {[
              { icon: <Upload className="w-3.5 h-3.5 text-primary" />, label: "User Input", desc: "JPG / PNG / WebP upload or URL" },
              { icon: <Cpu className="w-3.5 h-3.5 text-primary" />, label: "SightEngine genai Model", desc: "Neural network scores AI probability 0→1" },
              { icon: <ShieldCheck className="w-3.5 h-3.5 text-primary" />, label: "Verdict Engine", desc: "Thresholds map score to human-readable verdict" },
              { icon: <Zap className="w-3.5 h-3.5 text-primary" />, label: "Result", desc: "AI Score + Confidence + Real/AI breakdown" },
            ].map((step, i, arr) => (
              <div key={i}>
                <div className="flex items-start gap-3 py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{step.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{step.desc}</p>
                  </div>
                  <span className="text-[10px] font-mono text-primary/60 flex-shrink-0 mt-1">0{i + 1}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-3 h-3 text-slate-300 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-muted-foreground font-mono">
              <span className="text-primary">API:</span> POST /api/analyze-image → SightEngine REST
            </p>
          </div>
        </div>

        {/* Chatbot pipeline */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">
              Chatbot RAG Pipeline
            </span>
          </div>

          <div className="space-y-2">
            {[
              { icon: <MessageSquare className="w-3.5 h-3.5 text-primary" />, label: "User Message", desc: "Natural language query about deepfakes/AI media" },
              { icon: <Database className="w-3.5 h-3.5 text-primary" />, label: "Context Retrieval", desc: "Keyword scoring selects top 3 of 5 research datasets" },
              { icon: <Cpu className="w-3.5 h-3.5 text-primary" />, label: "Groq LLM (llama-3.3-70b)", desc: "Generates structured response grounded in research" },
              { icon: <Zap className="w-3.5 h-3.5 text-primary" />, label: "Formatted Reply", desc: "Markdown response with headers, bullets & sources" },
            ].map((step, i, arr) => (
              <div key={i}>
                <div className="flex items-start gap-3 py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{step.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{step.desc}</p>
                  </div>
                  <span className="text-[10px] font-mono text-primary/60 flex-shrink-0 mt-1">0{i + 1}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-3 h-3 text-slate-300 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-muted-foreground font-mono">
              <span className="text-primary">API:</span> POST /api/chat → Groq SDK (llama-3.3-70b-versatile)
            </p>
          </div>
        </div>
      </div>

      {/* Research datasets strip */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-[10px] text-primary font-mono uppercase tracking-widest mb-3">
          Grounding Knowledge Base — 5 Research Datasets
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Gilbert & Gilbert (2024) — AI in Combatting Deepfakes",
            "Nightingale & Farid, PNAS (2022) — AI-synthesized faces",
            "Makowski et al. (2025) — Too beautiful to be fake",
            "Issues in Information Systems (2025) — AI misinformation on social media",
            "Folorunsho & Boamah (2025) — Deepfake Technology and its Impact",
          ].map((ds) => (
            <span
              key={ds}
              className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 bg-white text-muted-foreground font-mono shadow-sm"
            >
              {ds}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ThePrototype() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  return (
    <div className="w-full py-20 px-6 bg-white">
      <div className="container mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
          <div className="flex-shrink-0">
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">
              02. The Prototype
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
              Two tools.<br />
              <span className="text-primary">One mission.</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed md:pb-1 flex-1">
            Detect AI-generated images with neural analysis, and explore
            deepfake research with our intelligent chatbot — both in real time.
          </p>
        </div>

        {/* Architecture section */}
        <ArchitectureSection />

        {/* Live Image Analyzer */}
        <div id="live-image-analyzer" className="mb-20 scroll-mt-20">
          <div className="mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ScanSearch className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">Live Image Analyzer</h2>
                <p className="text-xs text-muted-foreground font-mono">Powered by SightEngine genai model</p>
              </div>
            </div>
          </div>
          <ImageAnalyzer />
        </div>

        {/* Syntra Intel Chat */}
        <div className="w-full">
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">Syntra Intel Chat</h2>
                  <p className="text-xs text-muted-foreground font-mono">Powered by Groq + research datasets</p>
                </div>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("openSyntraChat"))}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all neon-glow"
              >
                <Bot className="w-4 h-4" />
                Chat Now
              </button>
            </div>
          </div>
          <ChatbotPreview />
        </div>

      </div>
    </div>
  );
}
