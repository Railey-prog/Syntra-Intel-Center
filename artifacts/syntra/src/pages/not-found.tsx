import { Link } from "wouter";
import { ScanSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-6">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <ScanSearch className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold font-mono text-primary mb-2">404</h1>
          <p className="text-foreground font-semibold text-lg mb-1">Page Not Found</p>
          <p className="text-muted-foreground text-sm">
            The page you're looking for doesn't exist.
          </p>
        </div>
        <Link href="/">
          <button className="px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all neon-glow">
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
}
