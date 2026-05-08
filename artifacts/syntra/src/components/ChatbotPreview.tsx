import { Bot, User, Send, Sparkles, Maximize2 } from "lucide-react";

const SAMPLE_MESSAGES = [
  { role: "user", content: "What are deepfakes?" },
  {
    role: "assistant",
    content: `Deepfakes are AI-generated synthetic media where a person's likeness is convincingly replaced or fabricated using deep learning techniques.

**Key facts:**
— ~40% of public-facing videos are expected to be deepfakes by 2024 *(Gilbert & Gilbert, 2024)*
— Humans correctly identify fakes only **48.2%** of the time — below random chance *(Nightingale & Farid, PNAS 2022)*
— They are used in fraud, misinformation, and political manipulation

**Key Takeaway:** Detection tools like Syntra exist because human perception alone is no longer reliable.`,
  },
];

const SUGGESTED_QUESTIONS = [
  "What are deepfakes?",
  "How can I detect AI images?",
  "What is the liar's dividend?",
  "How is Meta handling AI content?",
];

export function ChatbotPreview() {
  return (
    <div className="w-full flex flex-col rounded-2xl border border-border/50 bg-[#0d0d0d] overflow-hidden select-none" style={{ minHeight: "540px" }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground tracking-wide uppercase">Syntra Intel Chat</p>
          <p className="text-[10px] text-muted-foreground/60">Powered by Groq + research datasets</p>
        </div>
        <span className="text-[10px] text-muted-foreground/40 font-mono">preview only</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden px-4 py-4 space-y-4">
        {/* Greeting */}
        <div className="flex gap-2.5 justify-start">
          <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="max-w-[82%] px-3 py-2.5 rounded-xl rounded-bl-sm bg-muted/40 border border-border/30 text-foreground">
            <p className="text-xs leading-relaxed">Syntra neural network online. How can I assist with your media analysis today?</p>
          </div>
        </div>

        {/* Sample conversation */}
        {SAMPLE_MESSAGES.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div className={`max-w-[82%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted/40 border border-border/30 text-foreground rounded-bl-sm"
            }`}>
              {msg.role === "assistant" ? (
                <div className="space-y-1.5">
                  {msg.content.split("\n").map((line, j) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <p key={j} className="font-semibold text-primary text-xs">{line.replace(/\*\*/g, "")}</p>;
                    }
                    if (line.startsWith("— ")) {
                      return (
                        <p key={j} className="flex gap-1.5 text-xs">
                          <span className="text-primary flex-shrink-0">—</span>
                          <span dangerouslySetInnerHTML={{
                            __html: line.slice(2)
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em class="text-muted-foreground">$1</em>')
                          }} />
                        </p>
                      );
                    }
                    if (line.trim() === "") return null;
                    return (
                      <p key={j} className="text-xs"
                        dangerouslySetInnerHTML={{
                          __html: line
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em class="text-muted-foreground">$1</em>')
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs">{msg.content}</span>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-md bg-secondary border border-border/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggested chips */}
      <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
        {SUGGESTED_QUESTIONS.map((q) => (
          <span
            key={q}
            className="text-[10px] px-2.5 py-1.5 rounded-full border border-border/50 bg-muted/20 text-muted-foreground/60 flex items-center gap-1 cursor-not-allowed"
          >
            <Sparkles className="w-2.5 h-2.5" />
            {q}
          </span>
        ))}
      </div>

      {/* Disabled input */}
      <div className="flex gap-2 px-3 pb-3 pt-2 border-t border-border/20 flex-shrink-0">
        <div className="flex-1 bg-muted/20 border border-border/30 rounded-xl px-3 py-2.5 text-xs text-muted-foreground/40 cursor-not-allowed">
          Use the chatbot button to interact...
        </div>
        <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-primary/20 flex items-center justify-center cursor-not-allowed">
          <Send className="w-3.5 h-3.5 text-primary/40" />
        </div>
      </div>
    </div>
  );
}
