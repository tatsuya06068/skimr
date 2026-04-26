"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";

type GenerateResult = {
  imageUrl: string;
  caption: string;
};

const chips = ["落ち着きたい", "少し元気に", "そのままでいい"];

export default function Home() {
  const [feeling, setFeeling] = useState("");
  const [status, setStatus] = useState<"initial" | "loading" | "result">("initial");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captionVisible, setCaptionVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [downloadBlobUrl, setDownloadBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let blobUrl: string | null = null;
    let timer: ReturnType<typeof setTimeout>;

    setCaptionVisible(false);
    setImageLoaded(false);
    setDownloadReady(false);
    setDownloadBlobUrl(null);

    if (result) {
      timer = setTimeout(() => setCaptionVisible(true), 100);

      (async () => {
        try {
          const response = await fetch(`/api/download?url=${encodeURIComponent(result.imageUrl)}`);
          if (!response.ok) throw new Error("Failed to preload image");
          const blob = await response.blob();
          blobUrl = URL.createObjectURL(blob);
          if (!isMounted) return;
          setDownloadBlobUrl(blobUrl);
          setDownloadReady(true);
        } catch (error) {
          console.error("Image prefetch failed", error);
        }
      })();
    }

    return () => {
      isMounted = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (timer) clearTimeout(timer);
    };
  }, [result]);

  const handleSave = () => {
    if (!downloadReady || !downloadBlobUrl) return;

    posthog.capture("download_clicked");

    const link = document.createElement("a");
    link.href = downloadBlobUrl;
    link.download = "skimr-wallpaper.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async () => {
    if (status === "loading" || !feeling.trim()) return;

    posthog.capture("generate_clicked", { emotion: feeling });

    setStatus("loading");
    setError(null);
    setResult(null); // Fade out previous result

    try {
      const [imageResponse, textResponse] = await Promise.all([
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: feeling }),
        }),
        fetch("/api/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: feeling }),
        }),
      ]);

      if (!imageResponse.ok || !textResponse.ok) {
        throw new Error("API request failed");
      }

      const imageData = await imageResponse.json();
      const textData = await textResponse.json();

      setResult({
        imageUrl: imageData.image,
        caption: textData.text,
      });
      setStatus("result");

      posthog.capture("image_generated");
    } catch (err) {
      setError("生成に失敗しました。");
      setStatus("initial");
    }
  };


  return (
    <main className="min-h-screen bg-[#0F1115] px-6 py-8 text-[#EAEAF0] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col justify-center">
        <header className="text-center">
          <p className="text-sm text-[#A0A3AA]">Skimr</p>
        </header>

        <section className="mt-10 overflow-hidden rounded-[2rem] bg-[#1A1C21]/95 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)] ring-1 ring-white/5 backdrop-blur-xl">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm text-[#A0A3AA]">今の気分をひとこと</label>
              <input
                value={feeling}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFeeling(event.target.value)}
                placeholder="ひとことでいい"
                className="w-full rounded-[1.75rem] border border-white/10 bg-[#0F1115] px-4 py-4 text-base text-[#EAEAF0] placeholder:text-[#A0A3AA] outline-none transition focus:border-[#7AA7F9]/70 focus:ring-2 focus:ring-[#7AA7F9]/20"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFeeling(chip)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    feeling === chip
                      ? "bg-[#7AA7F9]/20 text-[#EAEAF0]"
                      : "bg-white/5 text-[#A0A3AA] hover:bg-white/10"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="min-h-[3.5rem]">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={status === "loading"}
                className={`w-full rounded-[1.75rem] px-5 py-4 text-base font-medium transition ${
                  status === "loading"
                    ? "cursor-not-allowed bg-[#7AA7F9]/50 text-[#EAEAF0] opacity-75 animate-slow-pulse"
                    : "bg-[#7AA7F9] text-[#0F1115] shadow-sm shadow-[#7AA7F9]/20 hover:bg-[#6A96E0] focus:outline-none focus:ring-2 focus:ring-[#7AA7F9]/40"
                }`}
              >
                {status === "loading" ? "気分をすくい上げています" : "形にする"}
              </button>
            </div>

            {error ? (
              <p className="text-center text-sm text-red-300">{error}</p>
            ) : null}

            <div className={`space-y-4 transition-all duration-500 ${status === "result" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
              <div className="overflow-hidden rounded-[2rem] bg-[#0F1115] relative">
              {result?.imageUrl && (
                <img
                  src={result.imageUrl}
                  alt="Generated wallpaper"
                  loading="eager"
                  decoding="async"
                  className={`h-[320px] w-full object-cover rounded-[2rem] transition-opacity duration-500 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              )}
              {!imageLoaded && result?.imageUrl && (
                <div className="absolute inset-0 rounded-[2rem] bg-white/5" />
              )}
            </div>
            <p className={`text-center text-sm text-[#A0A3AA] transition-opacity duration-300 ${captionVisible ? "opacity-100" : "opacity-0"}`}>
              {result?.caption || "あなたの気分をやさしく表現した壁紙"}
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={!downloadReady}
              className={`w-full rounded-[1.75rem] px-5 py-4 text-base font-semibold text-[#0F1115] shadow-[0_20px_40px_rgba(122,167,249,0.25)] transition duration-200 ${
                downloadReady
                  ? "bg-[#7AA7F9] hover:bg-[#6A96E0] hover:shadow-[0_22px_45px_rgba(122,167,249,0.30)]"
                  : "cursor-not-allowed bg-[#7AA7F9]/60 text-[#A0A3AA]"
              } focus:outline-none focus:ring-2 focus:ring-[#7AA7F9]/40`}
            >
              {downloadReady ? "壁紙として保存" : "保存を準備中..."}
            </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
