import { Bot, User, Send, Sparkles } from "lucide-react";

const SAMPLE_MESSAGES = [
  { role: "user", content: "Can humans tell AI faces from real ones?" },
  {
    role: "assistant",
    content: `Research shows people perform **worse than random guessing** when trying to spot AI-generated faces.\n\n— Baseline accuracy: **48.2%** — below the 50% chance level *(Nightingale & Farid, PNAS 2022)*\n— Even with training and feedback, accuracy only reached **59%** — still a **41% error rate** *(Nightingale & Farid, PNAS 2022)*\n— AI-synthesized faces are rated **7.7% more trustworthy** than real faces *(Nightingale & Farid, PNAS 2022)*\n— The **top 3 most trustworthy** faces in the study were all synthetic *(Nightingale & Farid, PNAS 2022)*\n— When people expect fakes, **44% of real faces** are mistakenly judged as AI-generated *(Makowski et al., 2025)*\n\n**Key Takeaway:** Human perception alone cannot reliably detect AI-generated faces — and AI faces are actively more convincing and trustworthy-looking than real ones.`,
  },
];

const SUGGESTED_QUESTIONS = [
  "What is a deepfake?",
  "How does misinformation spread on social media?",
  "How do I protect myself from deepfakes?",
  "How do I fact-check AI-generated content?",
];

export function ChatbotPreview() {
  return (
    <div className="w-full flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md select-none" style={{ minHeight: "540px" }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 flex-shrink-0 bg-white">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">Syntra Intel Chat</p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <p className="text-[10px] text-muted-foreground">Powered by Gemini + research datasets</p>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-full">preview</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden px-4 py-4 space-y-4 bg-slate-50/50">
        {/* Greeting */}
        <div className="flex gap-2.5 justify-start">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="max-w-[82%] px-3 py-2.5 rounded-2xl rounded-bl-sm bg-white border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-700 leading-relaxed">Hi! I'm Syntra Intel. How can I assist with your media literacy today?</p>
          </div>
        </div>

        {/* Sample conversation */}
        {SAMPLE_MESSAGES.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[82%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === "user"
                ? "bg-primary text-white rounded-br-sm"
                : "bg-[#0f1623] border border-slate-700/60 text-white rounded-bl-sm"
            }`}>
              {msg.role === "assistant" ? (
                <div className="space-y-1.5">
                  {msg.content.split("\n").map((line, j) => {
                    if (!line.trim()) return null;
                    const html = line
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-400 font-semibold">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em class="text-slate-400 text-[10px]">$1</em>');
                    if (line.startsWith("— ") || line.startsWith("- ")) {
                      return <p key={j} className="flex gap-1.5 text-xs text-slate-200"><span className="text-amber-400 flex-shrink-0">•</span><span dangerouslySetInnerHTML={{ __html: html.replace(/^[—\-] /, "") }} /></p>;
                    }
                    return <p key={j} className="text-xs text-slate-200" dangerouslySetInnerHTML={{ __html: html }} />;
                  })}
                </div>
              ) : (
                <span className="text-xs">{msg.content}</span>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggested chips */}
      <div className="px-3 pb-2 pt-2 flex flex-wrap gap-1.5 flex-shrink-0 bg-white border-t border-slate-100">
        {SUGGESTED_QUESTIONS.map((q) => (
          <span key={q} className="text-[10px] px-2.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-500 flex items-center gap-1 cursor-not-allowed">
            <Sparkles className="w-2.5 h-2.5" />
            {q}
          </span>
        ))}
      </div>

      {/* Disabled input */}
      <div className="flex gap-2 px-3 pb-3 pt-2 border-t border-slate-100 flex-shrink-0 bg-white">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-400 cursor-not-allowed">
          Use the chatbot button to interact...
        </div>
        <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-primary/20 flex items-center justify-center cursor-not-allowed">
          <Send className="w-3.5 h-3.5 text-primary/40" />
        </div>
      </div>
    </div>
  );
}
