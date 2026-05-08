import React, { useState, useRef, useCallback } from "react";
import { useAnalyzeImage } from "@workspace/api-client-react";
import { CloudUpload, ScanSearch, AlertTriangle, CheckCircle, Loader2, RotateCcw } from "lucide-react";
import { Progress } from "./ui/progress";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_MB = 10;

export function ImageAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = useAnalyzeImage();

  const processFile = (file: File) => {
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Unsupported format. Please upload a PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    setSelectedFile(file);
    analyzeMutation.reset();
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      analyzeMutation.mutate({ data: { imageBase64: dataUrl } });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setFileError(null);
    analyzeMutation.reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  const data = analyzeMutation.data;

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left panel — upload */}
        <div
          className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-4 p-10 min-h-[260px] ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border/60 bg-card/30 hover:border-primary/50 hover:bg-card/50"
          }`}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {preview && selectedFile ? (
            <>
              <img
                src={preview}
                alt="Uploaded preview"
                className="max-h-36 max-w-full object-contain rounded-md"
              />
              <p className="text-xs text-muted-foreground text-center truncate max-w-full px-2">
                {selectedFile.name}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Upload different image
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CloudUpload className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Upload an Image</p>
                <p className="text-sm text-muted-foreground mt-1">Click to browse or drag and drop</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Supports JPG, PNG, WebP up to {MAX_SIZE_MB}MB</p>
              </div>
            </>
          )}

          {fileError && (
            <p className="text-destructive text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              {fileError}
            </p>
          )}
        </div>

        {/* Right panel — results */}
        <div className="rounded-xl border border-border/50 bg-card/30 flex flex-col items-center justify-center gap-4 p-8 min-h-[260px]">
          {analyzeMutation.isPending && (
            <>
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Scanning Image...</p>
                <p className="text-sm text-muted-foreground mt-1">Running neural analysis</p>
              </div>
            </>
          )}

          {analyzeMutation.isError && (
            <>
              <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-destructive">Analysis Failed</p>
                <p className="text-sm text-muted-foreground mt-1">Could not process the image. Try a different file.</p>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Try again
              </button>
            </>
          )}

          {!analyzeMutation.isPending && !analyzeMutation.isError && !data && (
            <>
              <div className="w-14 h-14 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center">
                <ScanSearch className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Ready to Analyze</p>
                <p className="text-sm text-muted-foreground mt-1">Upload an image to see the AI detection results</p>
              </div>
            </>
          )}

          {data && !analyzeMutation.isPending && (
            <div className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
              {/* Verdict */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                data.isAiGenerated
                  ? "bg-destructive/10 border-destructive/30"
                  : "bg-primary/10 border-primary/30"
              }`}>
                {data.isAiGenerated
                  ? <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
                  : <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                }
                <div>
                  <p className={`font-bold text-sm ${data.isAiGenerated ? "text-destructive" : "text-primary"}`}>
                    {data.verdict}
                  </p>
                  <p className="text-xs text-muted-foreground">SightEngine AI Detection</p>
                </div>
              </div>

              {/* Confidence */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-mono uppercase tracking-wide">Confidence</span>
                  <span className="font-mono font-semibold text-foreground">{(data.confidence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={data.confidence * 100} className="h-1.5" />
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background/60 border border-border/40 p-3 text-center">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-1">AI Score</p>
                  <p className="text-2xl font-mono font-bold text-destructive">
                    {(data.details.aiGeneratedScore * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="rounded-lg bg-background/60 border border-border/40 p-3 text-center">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-1">Real Score</p>
                  <p className="text-2xl font-mono font-bold text-primary">
                    {(data.details.realScore * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1.5 pt-1"
              >
                <RotateCcw className="w-3 h-3" /> Analyze another image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
