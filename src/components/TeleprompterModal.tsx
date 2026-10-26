import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Type,
  Maximize2,
  Video,
  Copy,
  Check,
  Sparkles,
  FlipHorizontal,
  Flame,
} from 'lucide-react';

interface TeleprompterModalProps {
  script: {
    hook?: string;
    spokenScript?: string;
    mainScript?: string;
    visualDirection?: string;
    callToActionScript?: string;
    productName?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  script,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedWpm, setSpeedWpm] = useState<number>(140);
  const [fontSize, setFontSize] = useState<number>(24);
  const [isMirrored, setIsMirrored] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copied, setCopied] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Timer while playing
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Smooth scroll loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Convert WPM to pixels per second: ~1 word is ~1 line per 10 words, ~35px line height
    const pixelsPerSecond = (speedWpm / 60) * (fontSize * 1.5);

    const step = (now: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (now - lastTimeRef.current) / 1000;
        scrollContainer.scrollTop += pixelsPerSecond * deltaSec;

        // Auto pause at the end
        if (
          scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 10
        ) {
          setIsPlaying(false);
          return;
        }
      }
      lastTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speedWpm, fontSize]);

  // Keyboard shortcut: Spacebar to Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !script) return null;

  const hookText = script.hook || '';
  const bodyText = script.mainScript || script.spokenScript || '';
  const ctaText = script.callToActionScript || '';

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedSeconds(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleCopyFull = () => {
    const full = `HOOK:\n${hookText}\n\nBODY:\n${bodyText}\n\nCTA:\n${ctaText}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg h-[92vh] max-h-[860px] bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-3.5 px-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-800/80 text-[11px] font-mono font-bold text-rose-400">
              <span
                className={`w-2 h-2 rounded-full bg-rose-500 ${
                  isPlaying ? 'animate-pulse' : 'opacity-40'
                }`}
              />
              <span>{isPlaying ? 'REC' : 'STANDBY'}</span>
            </div>
            <span className="text-xs font-mono text-white font-bold tabular-nums">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMirrored((m) => !m)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                isMirrored
                  ? 'bg-cyan-500 text-neutral-950 border-cyan-400 font-bold'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white border-neutral-700'
              }`}
              title="Mirror text horizontally (for camera reading)"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyFull}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
              title="Copy script"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Teleprompter Scroll Viewport (9:16 mobile format frame) */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto px-6 py-12 select-none scroll-smooth relative ${
            isMirrored ? 'scale-x-[-1]' : ''
          }`}
          style={{ scrollBehavior: 'auto' }}
        >
          {/* Eyeline Focus Marker */}
          <div className="sticky top-1/3 left-0 right-0 pointer-events-none z-10 opacity-30 flex items-center justify-between text-cyan-400 text-[10px] font-mono uppercase">
            <span className="bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              ◄ Eyeline Target
            </span>
            <div className="flex-1 h-px bg-cyan-500 mx-2" />
          </div>

          <div className="space-y-8 max-w-md mx-auto pt-16 pb-48 text-center sm:text-left">
            {/* Visual Direction Callout */}
            {script.visualDirection && (
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400 font-mono leading-relaxed">
                <span className="text-cyan-400 font-bold uppercase block mb-1">
                  🎬 Camera & Framing Cue:
                </span>
                {script.visualDirection}
              </div>
            )}

            {/* Glowing 0-3s Hook Section */}
            {hookText && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 inline-block">
                  ⚡ 0–3s Critical Hook
                </span>
                <p
                  className="font-bold text-amber-300 leading-tight tracking-tight drop-shadow-md"
                  style={{ fontSize: `${fontSize * 1.15}px` }}
                >
                  "{hookText}"
                </p>
              </div>
            )}

            {/* Spoken Word Body */}
            {bodyText && (
              <div className="space-y-3 pt-4 border-t border-neutral-800/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold block">
                  🎙️ Spoken Script
                </span>
                <p
                  className="text-white font-medium leading-relaxed whitespace-pre-line tracking-wide"
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                >
                  {bodyText}
                </p>
              </div>
            )}

            {/* Call To Action */}
            {ctaText && (
              <div className="space-y-2 pt-6 border-t border-neutral-800/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 inline-block">
                  👉 Whop Bio Call To Action
                </span>
                <p
                  className="font-bold text-cyan-300 leading-tight"
                  style={{ fontSize: `${fontSize * 1.05}px` }}
                >
                  "{ctaText}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Floating Control Deck */}
        <div className="p-4 bg-neutral-900/95 border-t border-neutral-800 z-20 space-y-3">
          {/* Sliders for Speed and Size */}
          <div className="grid grid-cols-2 gap-4 text-[11px] font-mono text-neutral-400">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Speed:</span>
                <span className="text-cyan-400 font-bold">{speedWpm} WPM</span>
              </div>
              <input
                type="range"
                min="90"
                max="240"
                step="5"
                value={speedWpm}
                onChange={(e) => setSpeedWpm(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Font Size:</span>
                <span className="text-white font-bold">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="18"
                max="36"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Transport Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => setIsPlaying((p) => !p)}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                isPlaying
                  ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-amber-950/50'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-neutral-950 shadow-cyan-950/50'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause (Space)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Scroll (Space)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
