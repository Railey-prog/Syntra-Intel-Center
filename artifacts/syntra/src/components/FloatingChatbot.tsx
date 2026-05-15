import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, User, Sparkles, Minus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSendChatMessage } from "@workspace/api-client-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Language = "en" | "fil" | "bsy";

const LANGUAGES: { code: Language; label: string; flag: string; instruction: string }[] = [
  { code: "en", label: "EN", flag: "🇺🇸", instruction: "Respond ONLY in English." },
  { code: "fil", label: "FIL", flag: "🇵🇭", instruction: "Sumagot LAMANG sa Filipino/Tagalog." },
  { code: "bsy", label: "BSY", flag: "🌺", instruction: "Tubaga LAMANG sa Bisaya/Cebuano." },
];

const SUGGESTED_QUESTIONS: Record<Language, string[]> = {
  en: [
    "What are deepfakes?",
    "How can I detect AI images?",
    "What is the liar's dividend?",
    "How is Meta handling AI content?",
  ],
  fil: [
    "Ano ang deepfake?",
    "Paano matukoy ang AI na larawan?",
    "Ano ang 'liar's dividend'?",
    "Paano hinahawakan ng Meta ang AI content?",
  ],
  bsy: [
    "Unsa man ang deepfake?",
    "Unsaon pag-ila sa AI nga larawan?",
    "Unsa ang 'liar's dividend'?",
    "Unsay gibuhat sa Meta sa AI content?",
  ],
};

const WELCOME: Record<Language, string> = {
  en: "Hi! I'm Syntra Intel. Ask me anything about AI-generated images, deepfakes, or media literacy.",
  fil: "Kamusta! Ako si Syntra Intel. Itanong mo sa akin ang tungkol sa AI-generated na larawan, deepfakes, o media literacy.",
  bsy: "Kumusta! Ako si Syntra Intel. Pangutana ko bahin sa AI-generated nga mga hulagway, deepfakes, o media literacy.",
};

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<Language>("en");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME.en },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const mutation = useSendChatMessage();

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("openSyntraChat", handler);
    return () => window.removeEventListener("openSyntraChat", handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, mutation.isPending]);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    setMessages([{ role: "assistant", content: WELCOME[newLang] }]);
    mutation.reset();
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;

    const newMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");

    const history = newMessages.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const langConfig = LANGUAGES.find((l) => l.code === lang)!;
    const messageWithLang = `[${langConfig.instruction}]\n${trimmed}`;

    mutation.mutate(
      { data: { message: messageWithLang, history } },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.reply },
          ]);
        },
        onError: (err: unknown) => {
          const status = (err as { response?: { status?: number } })?.response?.status;
          const content =
            status === 429
              ? "Naabot na ang limitasyon ng chatbot ngayon. Subukan ulit bukas (UTC midnight).\n\nThe chatbot has reached its daily limit. Please try again after midnight (UTC).\n\nNakab-ot na ang adlaw-adlaw nga limitasyon. Palihug sulayi ugma."
              : "Sorry, I encountered an error. Please try again.";
          setMessages((prev) => [...prev, { role: "assistant", content }]);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const suggestions = SUGGESTED_QUESTIONS[lang];

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl neon-glow hover:scale-105 transition-transform"
          aria-label="Open Syntra Chat"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "510px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 flex-shrink-0 bg-white">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground tracking-wide">Syntra Intel</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <p className="text-[10px] text-muted-foreground">AI Detection Assistant</p>
              </div>
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLangChange(l.code)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-all ${
                    lang === l.code
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title={l.flag}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors ml-1"
              aria-label="Minimize"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chatbot-scroll bg-slate-50/50"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-white border border-slate-200 text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none
                      prose-headings:text-primary prose-headings:font-semibold prose-headings:text-xs prose-headings:mb-1 prose-headings:mt-2
                      prose-p:text-slate-700 prose-p:text-xs prose-p:leading-relaxed prose-p:my-1
                      prose-ul:my-1 prose-ul:pl-4 prose-li:text-xs prose-li:text-slate-700 prose-li:my-0
                      prose-ol:my-1 prose-ol:pl-4
                      prose-strong:text-primary prose-strong:font-semibold
                      prose-em:text-slate-500
                      prose-code:text-primary prose-code:bg-primary/8 prose-code:px-1 prose-code:rounded prose-code:text-xs
                      [&_h2]:text-xs [&_h3]:text-xs [&_h4]:text-xs
                    ">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
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

            {mutation.isPending && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested chips */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 pt-1 flex flex-wrap gap-1.5 flex-shrink-0 bg-white border-t border-slate-100">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] px-2.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5 flex-shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-slate-100 flex gap-2 items-end flex-shrink-0 bg-white">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                lang === "fil"
                  ? "Magtanong tungkol sa deepfakes..."
                  : lang === "bsy"
                  ? "Mangutana bahin sa deepfakes..."
                  : "Ask about deepfakes or AI images..."
              }
              rows={1}
              className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all chatbot-scroll"
              style={{ maxHeight: "80px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || mutation.isPending}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed neon-glow"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center shadow-xl hover:bg-slate-700 transition-colors"
          aria-label="Close Syntra Chat"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}
    </>
  );
}
