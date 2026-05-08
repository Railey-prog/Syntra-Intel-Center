import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, User, Sparkles, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSendChatMessage } from "@workspace/api-client-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What are deepfakes?",
  "How can I detect AI images?",
  "What is the liar's dividend?",
  "How accurate is human detection?",
];

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Syntra neural network online. How can I assist with your media analysis today?",
    },
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

    mutation.mutate(
      { data: { message: trimmed, history } },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.reply },
          ]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Sorry, I encountered an error. Please try again.",
            },
          ]);
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

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg neon-glow hover:scale-105 transition-transform"
          aria-label="Open Syntra Chat"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/60 bg-card shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "560px" }}>

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/40 bg-black/40 flex-shrink-0">
            <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold font-mono text-primary tracking-wider uppercase">
                Syntra Intel Chat
              </p>
              <p className="text-[10px] text-muted-foreground/60 font-mono">
                Research-grounded AI
              </p>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chatbot-scroll"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted/50 border border-border/40 text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none
                      prose-headings:text-primary prose-headings:font-semibold prose-headings:text-sm prose-headings:mb-1 prose-headings:mt-2
                      prose-p:text-foreground prose-p:text-xs prose-p:leading-relaxed prose-p:my-1
                      prose-ul:my-1 prose-ul:pl-4 prose-li:text-xs prose-li:text-foreground prose-li:my-0
                      prose-ol:my-1 prose-ol:pl-4
                      prose-strong:text-primary prose-strong:font-semibold
                      prose-em:text-muted-foreground
                      prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded prose-code:text-xs
                      prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:text-xs
                      [&_h2]:text-xs [&_h3]:text-xs [&_h4]:text-xs
                    ">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
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

            {mutation.isPending && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted/50 border border-border/40 rounded-xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested prompts */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-border/50 bg-muted/30 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-border/30 flex gap-2 items-end flex-shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about deepfakes, AI images..."
              rows={1}
              className="flex-1 resize-none bg-muted/30 border border-border/40 rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-muted/50 transition-all chatbot-scroll"
              style={{ maxHeight: "80px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || mutation.isPending}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed neon-glow"
            >
              <Send className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Circular close button — shown when chat is open */}
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-secondary border border-border/60 flex items-center justify-center shadow-lg hover:bg-muted transition-colors"
          aria-label="Close Syntra Chat"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      )}
    </>
  );
}
