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
      icon: <Lock className="w-5 h-5 text-white" />,
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
      icon: <AlertOctagon className="w-5 h-5 text-white" />,
      content: "Bad actors can dismiss genuine evidence as 'AI-generated'. Reliable detection tools are crucial to protect truth, not just expose fakes.",
      highlighted: true,
    },
  ];

  return (
    <div className="w-full py-20 px-6 bg-white">
      <div className="container mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-16">
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-3">03. Ethics</p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 text-foreground">
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
              className={`p-8 rounded-2xl border transition-all ${
                topic.highlighted
                  ? "bg-primary border-primary shadow-lg"
                  : "bg-white border-slate-200 hover:border-primary/25 hover:shadow-md shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  topic.highlighted ? "bg-white/15" : "bg-primary/10 border border-primary/15"
                }`}>
                  {topic.icon}
                </div>
                <div>
                  <p className={`text-xs font-bold mb-1 ${topic.highlighted ? "text-white/60" : "text-primary"}`}>
                    {topic.num}.
                  </p>
                  <h3 className={`font-bold text-base leading-tight ${topic.highlighted ? "text-white" : "text-foreground"}`}>
                    {topic.title}
                  </h3>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${topic.highlighted ? "text-white/85" : "text-muted-foreground"}`}>
                {topic.content}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
