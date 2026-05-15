import React from "react";
import { Link } from "wouter";
import { Navbar } from "./Navbar";
import { ScanSearch } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/the-issue", label: "The Issue" },
  { href: "/the-prototype", label: "The Prototype" },
  { href: "/ethics", label: "Ethics" },
  { href: "/conclusion", label: "Conclusion" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <ScanSearch className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-primary tracking-tight">
              SYNTRA<span className="text-primary">.</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6 flex-wrap justify-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="container mx-auto px-6 py-6 text-center space-y-2">
          <p className="text-muted-foreground text-xs">
            © 2026 Syntra. Built for awareness and education.
          </p>
          <p className="text-muted-foreground/70 text-xs max-w-xl mx-auto">
            <span className="font-semibold text-muted-foreground">Powered by:</span>{" "}
            Syntra combines AI detection with expert knowledge to expose synthetic media and build media literacy in a world where seeing is no longer believing.
          </p>
        </div>
      </footer>
    </div>
  );
}
