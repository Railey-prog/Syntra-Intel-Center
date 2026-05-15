import React from "react";
import { Link, useLocation } from "wouter";
import { ScanSearch, Menu, X } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/the-issue", label: "The Issue" },
    { href: "/the-prototype", label: "The Prototype" },
    { href: "/ethics", label: "Ethics" },
    { href: "/conclusion", label: "Conclusion" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur shadow-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ScanSearch className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg text-foreground tracking-tight">
            SYNTRA<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                location === link.href
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("openSyntraChat"))}
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all neon-glow"
          >
            Try Chatbot
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="flex flex-col py-4 px-6 gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm ${
                  location === link.href ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent("openSyntraChat"));
              }}
              className="mt-2 w-full px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold neon-glow"
            >
              Try Chatbot
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
