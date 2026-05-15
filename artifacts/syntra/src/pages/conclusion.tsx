import { Link } from "wouter";
import { ArrowRight, Bot } from "lucide-react";

export default function Conclusion() {
  return (
    <div className="w-full py-20 px-6 bg-white">
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-16">
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">04. Conclusion</p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 text-foreground">
            The future of <span className="text-primary">digital truth</span><br />starts with awareness.
          </h1>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <div className="pl-5 border-l-2 border-primary">
              <p className="text-foreground font-semibold leading-relaxed">
                The arms race between generative AI and digital forensics will define the next decade of information security.
              </p>
            </div>
            <p className="text-sm">
              Syntra demonstrates that technical solutions alone are insufficient — we must pair detection algorithms with robust media literacy education to create informed, resilient users.
            </p>
          </div>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p className="text-sm">
              By combining a high-accuracy neural image analyzer with a semantic chatbot grounded in current research, we empower users to move beyond passive consumption.
            </p>
            <p className="text-sm">
              This platform serves as a blueprint for accessible, transparent, and educational tools that defend the integrity of digital truth — tools that belong in the hands of everyone, not just experts.
            </p>
          </div>
        </div>

        {/* CTA block */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left */}
            <div className="p-10 border-b md:border-b-0 md:border-r border-slate-100">
              <h3 className="font-bold text-xl text-foreground mb-2">Deploy the Tools</h3>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                Access the live prototype to analyze images or query the research database.
              </p>
              <Link href="/the-prototype#live-image-analyzer">
                <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all neon-glow">
                  Try the Analyzer <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            {/* Right */}
            <div className="p-10 bg-primary/5">
              <h3 className="font-bold text-xl text-foreground mb-2">Ask a Question</h3>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                Chat with Syntra's AI, grounded in research on deepfakes and media literacy.
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("openSyntraChat"))}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-primary/25 text-primary font-semibold hover:bg-primary/10 transition-all"
              >
                <Bot className="w-4 h-4" />
                Chat with Syntra
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
