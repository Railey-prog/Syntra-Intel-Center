import { ScanSearch, Terminal, Bot } from "lucide-react";
import { ImageAnalyzer } from "@/components/ImageAnalyzer";
import { ChatbotPreview } from "@/components/ChatbotPreview";

export default function ThePrototype() {
  return (
    <div className="w-full py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-primary text-sm font-semibold font-mono mb-3">02. The Prototype</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Two tools.<br />
            <span className="text-primary">One mission.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Detect AI-generated images with neural analysis, and explore deepfake research with our intelligent chatbot — both in real time.
          </p>
        </div>

        {/* Live Image Analyzer — centered */}
        <div className="mb-20 mx-auto max-w-3xl">
          <div className="mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
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

        {/* Syntra Intel Chat — centered */}
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">Syntra Intel Chat</h2>
                  <p className="text-xs text-muted-foreground font-mono">Powered by Groq + research datasets</p>
                </div>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("openSyntraChat"))}
                className="flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all neon-glow"
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
