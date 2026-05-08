import { Shield, Lock, Eye, Scale, FileText, AlertOctagon } from "lucide-react";

export default function Ethics() {
  const topics = [
    {
      num: "01",
      title: "Transparency in AI Detection",
      icon: <Eye className="w-5 h-5 text-primary" />,
      content: "Users must understand that detection tools are probabilistic, not absolute. We display confidence scores and detailed breakdowns to prevent blind trust in the algorithm.",
      highlighted: false,
    },
    {
      num: "02",
      title: "Informed Consent & Privacy",
      icon: <Lock className="w-5 h-5 text-primary-foreground" />,
      content: "Images uploaded for analysis are processed statelessly. We do not use user uploads to train further models without explicit permission.",
      highlighted: true,
    },
    {
      num: "03",
      title: "Responsible Disclosure",
      icon: <FileText className="w-5 h-5 text-primary" />,
      content: "When synthetic media is detected, how it is reported matters. We provide context and educational material alongside verdicts to prevent unwarranted panic.",
      highlighted: false,
    },
    {
      num: "04",
      title: "Regulatory Frameworks",
      icon: <Scale className="w-5 h-5 text-primary" />,
      content: "The system aligns with the DEEPFAKES Accountability Act (US) and the EU Digital Services Act, advocating for watermarking and traceable origin protocols.",
      highlighted: false,
    },
    {
      num: "05",
      title: "Platform vs Individual Responsibility",
      icon: <Shield className="w-5 h-5 text-primary" />,
      content: "While platforms must moderate content, empowering individuals with detection tools decentralizes the defense against misinformation.",
      highlighted: false,
    },
    {
      num: "06",
      title: "The Liar's Dividend",
      icon: <AlertOctagon className="w-5 h-5 text-primary-foreground" />,
      content: "Bad actors can dismiss genuine evidence as 'AI-generated'. Reliable detection tools are crucial to protect truth, not just expose fakes.",
      highlighted: true,
    },
  ];

  return (
    <div className="w-full py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16">
          <p className="text-primary text-sm font-semibold mb-3">03. Ethics</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            The moral imperatives guiding<br /><span className="text-primary">responsible detection.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Building synthetic media detection tools carries significant ethical responsibilities — here's how Syntra addresses them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {topics.map((topic, i) => (
            <div
              key={i}
              className={`p-8 rounded-xl border transition-colors ${
                topic.highlighted
                  ? "bg-primary border-primary"
                  : "bg-card border-white/8 hover:border-white/15"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  topic.highlighted ? "bg-primary-foreground/10" : "bg-secondary border border-white/8"
                }`}>
                  {topic.icon}
                </div>
                <div>
                  <p className={`text-xs font-medium mb-1 ${topic.highlighted ? "text-primary-foreground/60" : "text-primary"}`}>
                    {topic.num}.
                  </p>
                  <h3 className={`font-bold text-base leading-tight ${topic.highlighted ? "text-primary-foreground" : "text-foreground"}`}>
                    {topic.title}
                  </h3>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${topic.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {topic.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
