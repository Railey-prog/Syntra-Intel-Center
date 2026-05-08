import { TrendingUp, Users, AlertTriangle, ShieldAlert } from "lucide-react";

export default function TheIssue() {
  const stats = [
    {
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      value: "~40%",
      label: "Of public-facing videos expected to be deepfakes by 2024",
      source: "Gilbert & Gilbert, 2024",
      highlighted: false,
    },
    {
      icon: <Users className="w-6 h-6 text-primary-foreground" />,
      value: "48.2%",
      label: "Human baseline accuracy in detecting fakes — below chance",
      source: "Nightingale & Farid, PNAS 2022",
      highlighted: true,
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      value: "41.18%",
      label: "AI-generated content proportion on Meta by Nov 2024",
      source: "Issues in Information Systems, 2025",
      highlighted: false,
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-primary" />,
      value: "$243K",
      label: "Lost in a single corporate voice deepfake fraud case",
      source: "Folorunsho & Boamah, 2025",
      highlighted: false,
    },
  ];

  return (
    <div className="w-full py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16">
          <p className="text-primary text-sm font-semibold mb-3">01. The Problem</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            The growing crisis of<br /><span className="text-primary">digital misinformation.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Declining public trust caused by deepfake technology threatens individuals, institutions, and democracy itself.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`p-8 rounded-xl border transition-colors ${
                stat.highlighted
                  ? "bg-primary border-primary"
                  : "bg-card border-white/8 hover:border-white/15"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-5 ${
                stat.highlighted ? "bg-primary-foreground/10" : "bg-secondary"
              }`}>
                {stat.icon}
              </div>
              <p className={`text-4xl font-bold mb-2 ${stat.highlighted ? "text-primary-foreground" : "text-foreground"}`}>
                {stat.value}
              </p>
              <p className={`text-sm leading-relaxed mb-3 ${stat.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {stat.label}
              </p>
              <p className={`text-xs ${stat.highlighted ? "text-primary-foreground/50" : "text-muted-foreground/50"}`}>
                — {stat.source}
              </p>
            </div>
          ))}
        </div>

        {/* Research context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold mb-6">
              The <span className="text-primary">Research</span> Context
            </h2>
            <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
              <p>
                This study addresses the growing problem of digital misinformation and declining public trust caused by deepfake technology. It aims to help people identify AI-generated content by combining an AI Image Analyzer with an interactive chatbot that promotes media literacy.
              </p>
              <p>
                The system is designed to reduce human vulnerability to misleading synthetic media, encourage critical thinking, and make digital forensic tools more accessible to the public.
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Why It <span className="text-primary">Matters</span>
            </h2>
            <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
              <p>
                Ultimately, this study supports the IT field's responsibility to protect society from misinformation and help users become more informed and resilient in the age of generative AI.
              </p>
              <p>
                We cannot rely solely on platform moderation — users must be equipped with the cognitive tools and software assistance to verify reality for themselves.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
