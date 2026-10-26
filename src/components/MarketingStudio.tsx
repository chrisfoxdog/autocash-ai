import React, { useState, useEffect, useRef } from 'react';
import {
  UserAccount,
  GeneratedAsset,
  MarketingVideoProject,
  MarketingVideoScene,
  MarketingImageResult,
  AIPersonaId,
} from '../types';
import { AIPersonaSelector } from './AIPersonaSelector';
import { VideoAudioEngine } from '../utils/audioSynthesizer';
import {
  Video,
  Image as ImageIcon,
  Play,
  Pause,
  RotateCcw,
  Download,
  Sparkles,
  Sliders,
  Layers,
  Volume2,
  VolumeX,
  Maximize2,
  Save,
  Check,
  CheckCircle2,
  Clock,
  Zap,
  Flame,
  Wand2,
  ChevronRight,
  ExternalLink,
  Loader2,
  Film,
  Camera,
  Copy,
  Plus,
  RefreshCw,
  Share2,
} from 'lucide-react';

interface MarketingStudioProps {
  user: UserAccount | null;
  onAssetCreated?: (asset: GeneratedAsset) => void;
  onOpenUpgrade?: () => void;
  initialVideoProject?: MarketingVideoProject | null;
}

export const MarketingStudio: React.FC<MarketingStudioProps> = ({
  user,
  onAssetCreated,
  onOpenUpgrade,
  initialVideoProject,
}) => {
  // Main Studio Mode: 'video' or 'image'
  const [activeStudio, setActiveStudio] = useState<'video' | 'image'>('video');

  // ==========================================
  // 1. VIDEO CREATOR STATE
  // ==========================================
  const [videoPrompt, setVideoPrompt] = useState(
    'Automated AI digital product system that helps creators earn recurring monthly cashflow on Whop'
  );
  const [videoNiche, setVideoNiche] = useState('AI Automation & Whop Products');
  const [videoPlatform, setVideoPlatform] = useState<'9:16' | '16:9'>('9:16');
  const [videoGoal, setVideoGoal] = useState<
    'launch_teaser' | 'feature_demo' | 'social_proof' | 'urgency_sale' | 'faceless_hook'
  >('launch_teaser');
  const [videoPersona, setVideoPersona] = useState<AIPersonaId>('aggressive_salesman');
  const [videoDiscountCode, setVideoDiscountCode] = useState('AUTOCASH50');
  const [videoCta, setVideoCta] = useState('Link in bio on Whop to get instant access');

  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Active Video Project
  const [project, setProject] = useState<MarketingVideoProject>(
    initialVideoProject || {
      title: 'The 15-Second Whop Cashflow Blueprint',
      niche: 'AI Automation & Whop Products',
      platform: '9:16',
      aspectRatio: '9:16',
      audioTrack: 'cyberpunk_synth',
      callToAction: 'Tap link in bio to copy the complete Whop system',
      whopDiscountCode: 'AUTOCASH50',
      voiceoverScript:
        'Stop wasting months building from scratch. Top creators use this exact automated pipeline to generate digital revenue on Whop. Grab the system at the link in bio today.',
      totalDurationSeconds: 15,
      aiPersonaUsed: 'aggressive_salesman',
      scenes: [
        {
          id: 'scene-1',
          sceneNumber: 1,
          durationSeconds: 3,
          heading: 'STOP WASTING 40 HOURS A WEEK',
          subtext: 'If you are still doing this manually in 2026, you are losing cash every single day.',
          visualPrompt: 'Dynamic camera zoom into high-contrast glowing dashboard with live revenue metric.',
          motionStyle: 'kinetic_zoom',
          badgeOverlay: '🔥 URGENT ALERT',
          bgGradient: ['#0f172a', '#1e1b4b'],
        },
        {
          id: 'scene-2',
          sceneNumber: 2,
          durationSeconds: 4,
          heading: 'THE AUTOMATION ENGINE',
          subtext: 'How smart operators replace 5 complex tools with 1 automated Whop checkout machine.',
          visualPrompt: 'Futuristic digital schematic with node connections lighting up in neon cyan.',
          motionStyle: 'glitch_strike',
          badgeOverlay: '⚡ ZERO CODE',
          bgGradient: ['#1e1b4b', '#312e81'],
        },
        {
          id: 'scene-3',
          sceneNumber: 3,
          durationSeconds: 4,
          heading: '14 PAYING CUSTOMERS IN 72H',
          subtext: 'Turnkey playbooks and recurring membership triggers ready to deploy this afternoon.',
          visualPrompt: 'Glowing notifications cascading on screen with Stripe and Whop transaction alerts.',
          motionStyle: 'cyber_pulse',
          badgeOverlay: '★ VERIFIED RESULTS',
          bgGradient: ['#022c22', '#064e3b'],
        },
        {
          id: 'scene-4',
          sceneNumber: 4,
          durationSeconds: 4,
          heading: 'CLAIM YOUR PASS BEFORE MIDNIGHT',
          subtext: 'Use code AUTOCASH50 at the Whop link in bio for instant commercial access.',
          visualPrompt: 'Whop verified store badge, countdown timer ticking down, and direct checkout button.',
          motionStyle: 'pan_reveal',
          badgeOverlay: '⏳ 50% OFF TODAY',
          bgGradient: ['#450a0a', '#7f1d1d'],
        },
      ],
    }
  );

  // Playback & Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [enableVoiceover, setEnableVoiceover] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Canvas Refs & Live Playback Tracking
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioEngineRef = useRef<VideoAudioEngine | null>(null);
  const loadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const currentTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const projectRef = useRef(project);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      currentTimeRef.current = currentTime;
    }
  }, [currentTime, isPlaying]);

  // Derive active scene index synchronously during render from currentTime and project.scenes (no extra setState in useEffect!)
  const activeSceneIndex = (() => {
    let accumulated = 0;
    for (let i = 0; i < project.scenes.length; i++) {
      accumulated += project.scenes[i].durationSeconds;
      if (currentTime <= accumulated || i === project.scenes.length - 1) {
        return i;
      }
    }
    return 0;
  })();

  // ==========================================
  // 2. IMAGE CREATOR STATE
  // ==========================================
  const [imagePrompt, setImagePrompt] = useState(
    'Futuristic glowing 3D holographic digital product mockup box with neon cyan accents, gold Whop verified emblem, and floating cashflow telemetry'
  );
  const [imageRatio, setImageRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('16:9');
  const [imagePurpose, setImagePurpose] = useState<
    'whop_banner' | 'product_mockup' | 'social_ad' | 'community_badge' | 'custom'
  >('whop_banner');
  const [imageStyle, setImageStyle] = useState('Cyberpunk Neon & Dark Glassmorphism');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeGeneratedImage, setActiveGeneratedImage] = useState<MarketingImageResult | null>(null);
  const [recentImages, setRecentImages] = useState<MarketingImageResult[]>([]);
  const [copiedImageLink, setCopiedImageLink] = useState(false);

  // Initialize Web Audio Engine
  useEffect(() => {
    audioEngineRef.current = new VideoAudioEngine();
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update total duration when scenes change
  const totalDuration = project.scenes.reduce((acc, s) => acc + (s.durationSeconds || 3), 0);

  // Preload any scene background images
  useEffect(() => {
    project.scenes.forEach((scene) => {
      if (scene.imageUrl && !loadedImagesRef.current.has(scene.imageUrl)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';
        img.src = scene.imageUrl;
        img.onload = () => {
          loadedImagesRef.current.set(scene.imageUrl!, img);
        };
      }
    });
  }, [project.scenes]);

  // Render Canvas Loop (smooth 60fps via requestAnimationFrame without triggering re-render cascades)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    const isVertical = project.platform === '9:16';
    const width = isVertical ? 720 : 1280;
    const height = isVertical ? 1280 : 720;
    canvas.width = width;
    canvas.height = height;

    let lastTimestamp = performance.now();
    let lastUiUpdate = performance.now();

    const render = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      const currentProj = projectRef.current;
      const dur = currentProj.scenes.reduce((acc, s) => acc + (s.durationSeconds || 3), 0);

      if (isPlayingRef.current) {
        currentTimeRef.current += delta;
        if (currentTimeRef.current >= dur) {
          currentTimeRef.current = 0;
        }

        // Throttle UI React state updates to 10fps (every 100ms) to prevent re-render thrashing
        if (now - lastUiUpdate > 100) {
          lastUiUpdate = now;
          setCurrentTime(currentTimeRef.current);
        }
      }

      // Draw active scene for current timestamp
      const scenes = currentProj.scenes;
      let acc = 0;
      let sceneToDraw = scenes[0];
      for (let i = 0; i < scenes.length; i++) {
        acc += scenes[i].durationSeconds;
        if (currentTimeRef.current <= acc || i === scenes.length - 1) {
          sceneToDraw = scenes[i];
          break;
        }
      }

      if (sceneToDraw) {
        drawScene(ctx, width, height, sceneToDraw, currentTimeRef.current, dur, now);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [project.platform]);

  // Draw scene frame onto 2D Canvas
  const drawScene = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scene: MarketingVideoScene,
    time: number,
    totalDur: number,
    nowMs: number
  ) => {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background (Image or Dynamic Kinetic Gradient)
    const bgImg = scene.imageUrl ? loadedImagesRef.current.get(scene.imageUrl) : null;
    if (bgImg && bgImg.complete) {
      // Ken Burns smooth scale
      const scale = 1.05 + 0.05 * Math.sin((time * 0.5) % Math.PI);
      const scaledW = width * scale;
      const scaledH = height * scale;
      const offsetX = (width - scaledW) / 2;
      const offsetY = (height - scaledH) / 2;
      ctx.drawImage(bgImg, offsetX, offsetY, scaledW, scaledH);

      // Dark gradient overlay for typography readability
      const overlayGrad = ctx.createLinearGradient(0, 0, 0, height);
      overlayGrad.addColorStop(0, 'rgba(2, 6, 23, 0.4)');
      overlayGrad.addColorStop(0.5, 'rgba(2, 6, 23, 0.65)');
      overlayGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Rich Procedural Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, scene.bgGradient?.[0] || '#0f172a');
      grad.addColorStop(1, scene.bgGradient?.[1] || '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Animated glowing cyber grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1.5;
      const gridSpacing = 60;
      const offsetGrid = (nowMs * 0.02) % gridSpacing;
      for (let x = offsetGrid; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = offsetGrid; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Floating ambient particles
      for (let i = 0; i < 18; i++) {
        const px = (Math.sin(nowMs * 0.001 + i) * 0.5 + 0.5) * width;
        const py = ((nowMs * 0.03 + i * 80) % height);
        const radius = 2 + (i % 4);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.3)' : 'rgba(245, 158, 11, 0.25)';
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Top Header & Badge Overlay
    const topMargin = height * 0.08;
    if (scene.badgeOverlay) {
      ctx.save();
      const badgeText = scene.badgeOverlay.toUpperCase();
      ctx.font = `bold ${Math.round(height * 0.022)}px -apple-system, system-ui, sans-serif`;
      const badgeWidth = ctx.measureText(badgeText).width + 36;
      const badgeHeight = height * 0.045;
      const badgeX = (width - badgeWidth) / 2;
      const badgeY = topMargin;

      // Glow pulse
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(8, 47, 73, 0.85)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 12);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, width / 2, badgeY + badgeHeight / 2);
      ctx.restore();
    }

    // 3. Motion Typography: Kinetic Headline
    ctx.save();
    const headingY = height * 0.35;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.round(height * 0.052)}px -apple-system, system-ui, sans-serif`;

    // Glow and kinetic punch
    let scalePunch = 1.0;
    if (scene.motionStyle === 'kinetic_zoom') {
      scalePunch = 1.0 + 0.03 * Math.sin(nowMs * 0.006);
    } else if (scene.motionStyle === 'glitch_strike' && Math.random() > 0.88) {
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(scene.heading, width / 2 + 3, headingY - 2);
    }

    ctx.shadowColor = 'rgba(6, 182, 212, 0.7)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#ffffff';

    // Word wrap headline
    const words = scene.heading.split(' ');
    let lines: string[] = [];
    let currentLine = '';
    const maxLineW = width * 0.85;

    for (let w of words) {
      const testLine = currentLine ? `${currentLine} ${w}` : w;
      if (ctx.measureText(testLine).width > maxLineW) {
        lines.push(currentLine);
        currentLine = w;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = height * 0.065 * scalePunch;
    const startY = headingY - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + idx * lineHeight);
    });
    ctx.restore();

    // 4. Subtitle / Voiceover Caption Card
    ctx.save();
    const captionBoxY = height * 0.65;
    const captionBoxW = width * 0.88;
    const captionBoxH = height * 0.16;
    const captionBoxX = (width - captionBoxW) / 2;

    // Glass backdrop for subtitles
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(captionBoxX, captionBoxY, captionBoxW, captionBoxH, 18);
    ctx.fill();
    ctx.stroke();

    // Accent left stripe
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.roundRect(captionBoxX, captionBoxY, 6, captionBoxH, [18, 0, 0, 18]);
    ctx.fill();

    // Caption text
    ctx.font = `600 ${Math.round(height * 0.024)}px -apple-system, system-ui, sans-serif`;
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const subWords = scene.subtext.split(' ');
    let subLines: string[] = [];
    let subCur = '';
    const maxSubW = captionBoxW - 40;

    for (let sw of subWords) {
      const test = subCur ? `${subCur} ${sw}` : sw;
      if (ctx.measureText(test).width > maxSubW) {
        subLines.push(subCur);
        subCur = sw;
      } else {
        subCur = test;
      }
    }
    if (subCur) subLines.push(subCur);

    subLines.slice(0, 3).forEach((line, lIdx) => {
      ctx.fillText(line, captionBoxX + 24, captionBoxY + 20 + lIdx * (height * 0.034));
    });
    ctx.restore();

    // 5. Audio Waveform Visualizer at Bottom
    ctx.save();
    const waveY = height * 0.88;
    const numBars = 36;
    const barW = (width * 0.7) / numBars;
    const waveStartX = width * 0.15;

    for (let b = 0; b < numBars; b++) {
      const barHeight = isPlaying
        ? (Math.sin(nowMs * 0.008 + b * 0.4) * 0.5 + 0.5) * (height * 0.045) + 6
        : 6;
      const bx = waveStartX + b * barW;
      const by = waveY - barHeight;

      ctx.fillStyle = b % 3 === 0 ? '#38bdf8' : '#06b6d4';
      ctx.fillRect(bx, by, barW - 3, barHeight);
    }
    ctx.restore();

    // 6. Watermark / Whop Verified Tag
    ctx.save();
    ctx.font = `bold ${Math.round(height * 0.016)}px font-mono, monospace`;
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ AUTOCASH AI • WHOP VERIFIED ASSET', width / 2, height * 0.94);
    ctx.restore();

    // 7. Video Progress Bar at very bottom
    const progress = Math.min(1, Math.max(0, time / totalDur));
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, height - 6, width, 6);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(0, height - 6, width * progress, 6);
  };

  // Toggle Video Playback
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioEngineRef.current) audioEngineRef.current.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
      setIsPlaying(true);
      if (!isMuted && audioEngineRef.current) {
        audioEngineRef.current.start(project.audioTrack);
      }
      if (enableVoiceover && 'speechSynthesis' in window) {
        speakVoiceover();
      }
    }
  };

  const handleRestart = () => {
    currentTimeRef.current = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      handleTogglePlay();
    }
  };

  // Speak Voiceover via Web Speech API
  const speakVoiceover = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(project.voiceoverScript);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // 1-Click High-Converting Video Preset
  const applyVideoPreset = (presetKey: string) => {
    if (presetKey === 'whop_drop') {
      setVideoPrompt('VIP Whop membership drop with 50% limited fast-action discount');
      setVideoNiche('Whop Community & VIP Mastermind');
      setVideoGoal('launch_teaser');
      setVideoDiscountCode('VIP50');
      setVideoPersona('aggressive_salesman');
    } else if (presetKey === 'saas_demo') {
      setVideoPrompt('B2B SaaS lead automation tool that replaces 4 manual spreadsheets');
      setVideoNiche('SaaS & Productivity Tools');
      setVideoGoal('feature_demo');
      setVideoDiscountCode('SAVE30');
      setVideoPersona('technical_expert');
    } else if (presetKey === 'faceless_cashflow') {
      setVideoPrompt('How a 22-year-old built a recurring digital income stream with no inventory');
      setVideoNiche('Digital Products & Solopreneurship');
      setVideoGoal('faceless_hook');
      setVideoDiscountCode('STARTNOW');
      setVideoPersona('empathetic_creator');
    } else if (presetKey === 'flash_fomo') {
      setVideoPrompt('Final 24 hours to secure commercial licenses before pricing increases 3x');
      setVideoNiche('High-Ticket Commercial Licenses');
      setVideoGoal('urgency_sale');
      setVideoDiscountCode('FLASHFINAL');
      setVideoPersona('contrarian_disruptor');
    }
  };

  // Generate Video Storyboard via Server API
  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoPrompt.trim()) return;

    setIsGeneratingVideo(true);
    setVideoError(null);

    try {
      const res = await fetch('/api/media/generate-video-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          niche: videoNiche,
          platform: videoPlatform,
          businessGoal: videoGoal,
          aiPersona: videoPersona,
          callToAction: videoCta,
          whopDiscountCode: videoDiscountCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'UPGRADE_REQUIRED' && onOpenUpgrade) {
          onOpenUpgrade();
        }
        throw new Error(data.error || 'Failed to generate video storyboard');
      }

      if (data.videoProject) {
        setProject(data.videoProject);
        currentTimeRef.current = 0;
        setCurrentTime(0);
        setIsPlaying(true);
        isPlayingRef.current = true;
        if (audioEngineRef.current && !isMuted) {
          audioEngineRef.current.start(data.videoProject.audioTrack);
        }
      }
    } catch (err: any) {
      setVideoError(err.message || 'Generation failed');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Export Canvas as Real Video (.webm) using MediaRecorder
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isRecording) return;

    try {
      setIsRecording(true);
      setRecordingProgress(0);
      setIsPlaying(false);
      setCurrentTime(0);

      const stream = canvas.captureStream(30);

      // Mix in audio stream from synthesizer if available
      if (audioEngineRef.current && !isMuted) {
        const audioStream = audioEngineRef.current.getAudioStream();
        if (audioStream) {
          audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
        }
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_whop.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setIsPlaying(false);
        if (audioEngineRef.current) audioEngineRef.current.stop();
      };

      recorder.start();
      setIsPlaying(true);
      if (audioEngineRef.current && !isMuted) {
        audioEngineRef.current.start(project.audioTrack);
      }

      // Record full duration
      const totalMs = totalDuration * 1000;
      const interval = setInterval(() => {
        setRecordingProgress((prev) => {
          const next = prev + 100 / (totalDuration * 10);
          return Math.min(100, Math.round(next));
        });
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        recorder.stop();
      }, totalMs);
    } catch (err) {
      console.error('Video recording failed:', err);
      setIsRecording(false);
    }
  };

  // Download Still Frame as PNG
  const handleExportStillFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `whop_video_scene_${activeSceneIndex + 1}_poster.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Save Video Project to Vault
  const handleSaveVideoToVault = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/media/save-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoProject: project }),
      });
      const data = await res.json();
      if (res.ok && data.asset && onAssetCreated) {
        onAssetCreated(data.asset);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save project:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // 3. IMAGE CREATOR ACTIONS
  // ==========================================
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;

    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const res = await fetch('/api/media/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageRatio,
          style: imageStyle,
          purpose: imagePurpose,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'UPGRADE_REQUIRED' && onOpenUpgrade) {
          onOpenUpgrade();
        }
        throw new Error(data.error || 'Failed to generate marketing image');
      }

      if (data.image) {
        setActiveGeneratedImage(data.image);
        setRecentImages((prev) => [data.image, ...prev.slice(0, 7)]);
        if (data.asset && onAssetCreated) {
          onAssetCreated(data.asset);
        }
      }
    } catch (err: any) {
      setImageError(err.message || 'Image generation failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Enhance prompt with commercial descriptors
  const handleEnhancePrompt = () => {
    const enhancers = [
      'dramatic volumetric neon rim lighting, 4K raytraced glass textures, high contrast commercial advertising render',
      'minimalist sleek dark mode UI, glowing cyan typography, premium SaaS product photograph',
      'hyper-realistic studio depth-of-field, subtle gold foil foil accents, luxury fintech aesthetic',
    ];
    const picked = enhancers[Math.floor(Math.random() * enhancers.length)];
    setImagePrompt((prev) => `${prev.trim()}, ${picked}`);
  };

  // Use generated image inside video scene
  const handleApplyImageToScene = (imageUrl: string, sceneIdx: number) => {
    setProject((prev) => {
      const nextScenes = [...prev.scenes];
      if (nextScenes[sceneIdx]) {
        nextScenes[sceneIdx] = {
          ...nextScenes[sceneIdx],
          imageUrl,
        };
      }
      return { ...prev, scenes: nextScenes };
    });
    // Switch to video tab to preview immediately
    setActiveStudio('video');
  };

  return (
    <div className="space-y-6">
      {/* Header & Studio Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 text-sm font-bold">
              ⚡
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AI Video & Image Creation Studio
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-cyan-800 bg-cyan-950 text-cyan-400 font-semibold uppercase">
              Production Suite
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Create high-retention short marketing videos for TikTok, Reels & Whop alongside high-res commercial store mockups and banners.
          </p>
        </div>

        {/* Toggle between Video and Image Creators */}
        <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveStudio('video')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeStudio === 'video'
                ? 'bg-cyan-500 text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            Text-to-Video Creator
          </button>
          <button
            onClick={() => setActiveStudio('image')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeStudio === 'image'
                ? 'bg-cyan-500 text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Text-to-Image Creator
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TEXT-TO-VIDEO CREATOR                             */}
      {/* ======================================================== */}
      {activeStudio === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Configuration */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1-Click Launch Presets */}
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  High-Converting Video Presets
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">1-Click Setup</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyVideoPreset('whop_drop')}
                  className="p-2 text-left rounded-lg border border-neutral-800 bg-neutral-950/70 hover:border-cyan-600 transition-colors"
                >
                  <div className="text-[11px] font-bold text-white">🔥 Whop Drop Teaser</div>
                  <div className="text-[10px] text-neutral-400">50% Promo & VIP Access</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyVideoPreset('saas_demo')}
                  className="p-2 text-left rounded-lg border border-neutral-800 bg-neutral-950/70 hover:border-cyan-600 transition-colors"
                >
                  <div className="text-[11px] font-bold text-white">⚡ B2B SaaS Demo</div>
                  <div className="text-[10px] text-neutral-400">Automation Workflow</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyVideoPreset('faceless_cashflow')}
                  className="p-2 text-left rounded-lg border border-neutral-800 bg-neutral-950/70 hover:border-cyan-600 transition-colors"
                >
                  <div className="text-[11px] font-bold text-white">💸 Faceless Cashflow</div>
                  <div className="text-[10px] text-neutral-400">Organic Viral Hook</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyVideoPreset('flash_fomo')}
                  className="p-2 text-left rounded-lg border border-neutral-800 bg-neutral-950/70 hover:border-cyan-600 transition-colors"
                >
                  <div className="text-[11px] font-bold text-white">⏳ Flash FOMO Sale</div>
                  <div className="text-[10px] text-neutral-400">Price Increases Tonight</div>
                </button>
              </div>
            </div>

            {/* Video Generator Form */}
            <form onSubmit={handleGenerateVideo} className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-4">
              {/* Persona Selector */}
              <div className="pb-3 border-b border-neutral-800">
                <AIPersonaSelector
                  selectedPersona={videoPersona}
                  onSelectPersona={setVideoPersona}
                  compact={true}
                  label="Video Voice & Script Persona"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Video Marketing Topic or Concept
                </label>
                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Turnkey prompt playbook that helps freelancers land $2,000 clients"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Target Niche
                  </label>
                  <input
                    type="text"
                    value={videoNiche}
                    onChange={(e) => setVideoNiche(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Format & Aspect Ratio
                  </label>
                  <select
                    value={videoPlatform}
                    onChange={(e) => setVideoPlatform(e.target.value as '9:16' | '16:9')}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="9:16">📱 9:16 Vertical (TikTok/Reels/Shorts)</option>
                    <option value="16:9">🖥️ 16:9 Landscape (Whop Banner/YouTube)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Whop Promo Code
                  </label>
                  <input
                    type="text"
                    value={videoDiscountCode}
                    onChange={(e) => setVideoDiscountCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-neutral-950 border border-neutral-800 text-amber-400 focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. LAUNCH50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Soundtrack Style
                  </label>
                  <select
                    value={project.audioTrack}
                    onChange={(e) =>
                      setProject((prev) => ({
                        ...prev,
                        audioTrack: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="cyberpunk_synth">🎵 Cyberpunk Synth (120 BPM)</option>
                    <option value="high_energy_trap">🔥 High-Energy Trap (140 BPM)</option>
                    <option value="lofi_chill">☕ Lo-Fi Chill Hop (85 BPM)</option>
                    <option value="cinematic_epic">🎬 Cinematic Epic (100 BPM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Call to Action (CTA)
                </label>
                <input
                  type="text"
                  value={videoCta}
                  onChange={(e) => setVideoCta(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {videoError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {videoError}
                </div>
              )}

              <button
                type="submit"
                disabled={isGeneratingVideo}
                className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 disabled:opacity-50"
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Video Storyboard & Script...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Marketing Video (1 Credit)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Interactive Video Player & Scene Inspector */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-cyan-400" />
                    {project.title}
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
                    <span>{project.platform === '9:16' ? 'Vertical 9:16' : 'Landscape 16:9'}</span>
                    <span>•</span>
                    <span>{totalDuration}s Total</span>
                    <span>•</span>
                    <span className="text-cyan-400">Scene {activeSceneIndex + 1}/{project.scenes.length}</span>
                  </div>
                </div>

                {/* Video Export Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportStillFrame}
                    title="Export current frame as high-res PNG"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-200 text-xs hover:border-neutral-600 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-neutral-400" />
                    Snapshot
                  </button>

                  <button
                    onClick={handleExportVideo}
                    disabled={isRecording}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isRecording ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Recording {recordingProgress}%
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        Export Video (.webm)
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveVideoToVault}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-800 bg-cyan-950 text-cyan-300 font-semibold text-xs hover:bg-cyan-900 transition-colors"
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Saved to Vault!
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save to Vault
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Canvas Viewport Player */}
              <div className="relative mx-auto flex items-center justify-center bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-inner group">
                <canvas
                  ref={canvasRef}
                  className={`max-h-[500px] w-auto object-contain rounded-lg transition-transform ${
                    project.platform === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]'
                  }`}
                />

                {/* Big Center Play Overlay Button */}
                {!isPlaying && (
                  <button
                    onClick={handleTogglePlay}
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyan-500/90 text-neutral-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-all border-2 border-white/40"
                  >
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </button>
                )}
              </div>

              {/* Video Playback Controls Bar */}
              <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePlay}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <button
                    onClick={handleRestart}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-neutral-300 ml-1">
                    {currentTime.toFixed(1)}s / {totalDuration}s
                  </span>
                </div>

                {/* Audio & Narration Toggles */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const next = !isMuted;
                      setIsMuted(next);
                      if (next && audioEngineRef.current) audioEngineRef.current.stop();
                      if (!next && isPlaying && audioEngineRef.current) {
                        audioEngineRef.current.start(project.audioTrack);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                      isMuted
                        ? 'border-neutral-800 text-neutral-500'
                        : 'border-cyan-800 bg-cyan-950/50 text-cyan-300'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    Beat: {isMuted ? 'Muted' : 'On'}
                  </button>

                  <button
                    onClick={() => {
                      const next = !enableVoiceover;
                      setEnableVoiceover(next);
                      if (next && isPlaying) speakVoiceover();
                      if (!next && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                      enableVoiceover
                        ? 'border-amber-800 bg-amber-950/50 text-amber-300'
                        : 'border-neutral-800 text-neutral-500'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    AI Narration: {enableVoiceover ? 'Active' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Multi-Scene Inspector & Live Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Interactive Scene Timeline ({project.scenes.length} Scenes)
                  </span>
                  <span className="text-[11px] text-neutral-500">Click any scene to jump or edit</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {project.scenes.map((scene, idx) => {
                    const isCurrent = idx === activeSceneIndex;
                    return (
                      <button
                        key={scene.id || idx}
                        onClick={() => {
                          let start = 0;
                          for (let i = 0; i < idx; i++) {
                            start += project.scenes[i].durationSeconds;
                          }
                          const targetTime = start + 0.05;
                          currentTimeRef.current = targetTime;
                          setCurrentTime(targetTime);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                          isCurrent
                            ? 'border-cyan-500 bg-cyan-950/40 text-white shadow-md ring-1 ring-cyan-500/30'
                            : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">
                            Scene {idx + 1}
                          </span>
                          <span className="text-[9px] font-mono px-1 rounded bg-neutral-900 text-neutral-400">
                            {scene.durationSeconds}s
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white truncate">{scene.heading}</div>
                        <div className="text-[10px] text-neutral-400 truncate mt-0.5">{scene.badgeOverlay}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Scene Inline Quick Editor */}
                {project.scenes[activeSceneIndex] && (
                  <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-semibold text-neutral-200">
                      <span>Editing Scene {activeSceneIndex + 1} Overlay</span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        Motion: {project.scenes[activeSceneIndex].motionStyle}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-1">Headline Hook</label>
                        <input
                          type="text"
                          value={project.scenes[activeSceneIndex].heading}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProject((prev) => {
                              const next = [...prev.scenes];
                              next[activeSceneIndex].heading = val;
                              return { ...prev, scenes: next };
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-1">Badge Tag</label>
                        <input
                          type="text"
                          value={project.scenes[activeSceneIndex].badgeOverlay || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProject((prev) => {
                              const next = [...prev.scenes];
                              next[activeSceneIndex].badgeOverlay = val;
                              return { ...prev, scenes: next };
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Voiceover Subtitle</label>
                      <input
                        type="text"
                        value={project.scenes[activeSceneIndex].subtext}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProject((prev) => {
                            const next = [...prev.scenes];
                            next[activeSceneIndex].subtext = val;
                            return { ...prev, scenes: next };
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TEXT-TO-IMAGE CREATOR                             */}
      {/* ======================================================== */}
      {activeStudio === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Prompt & Settings */}
          <div className="lg:col-span-5 space-y-5">
            <form onSubmit={handleGenerateImage} className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Image Prompt & Visual Concept
                  </label>
                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Boost Prompt
                  </button>
                </div>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                  placeholder="Describe your Whop banner, 3D software box, or social creative in detail..."
                />
              </div>

              {/* Purpose Preset */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Marketing Asset Purpose
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'whop_banner', label: '🛍️ Whop Store Banner', ratio: '16:9' },
                    { id: 'product_mockup', label: '📦 3D Software Box', ratio: '4:3' },
                    { id: 'social_ad', label: '📱 Viral TikTok / Story', ratio: '9:16' },
                    { id: 'community_badge', label: '🏆 VIP Membership Pass', ratio: '1:1' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setImagePurpose(p.id as any);
                        setImageRatio(p.ratio as any);
                      }}
                      className={`p-2 rounded-lg border text-left text-xs font-medium transition-all ${
                        imagePurpose === p.id
                          ? 'border-cyan-500 bg-cyan-950/60 text-white'
                          : 'border-neutral-800 bg-neutral-950/70 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['16:9', '9:16', '1:1', '4:3'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setImageRatio(r)}
                      className={`py-1.5 text-center rounded-lg border text-xs font-mono font-bold transition-all ${
                        imageRatio === r
                          ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Art Direction Style */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Visual Art Style
                </label>
                <select
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Cyberpunk Neon & Dark Glassmorphism">🚀 Cyberpunk Neon & Dark Glassmorphism</option>
                  <option value="Sleek Minimalist Fintech & SaaS">💼 Sleek Minimalist Fintech & SaaS</option>
                  <option value="Hyper-Realistic 4K Studio Photography">📸 Hyper-Realistic 4K Studio Photography</option>
                  <option value="3D Holographic Claymorphic Render">🎨 3D Holographic Claymorphic Render</option>
                  <option value="Dark Luxury Gold & Obsidian">🏆 Dark Luxury Gold & Obsidian</option>
                </select>
              </div>

              {imageError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {imageError}
                </div>
              )}

              <button
                type="submit"
                disabled={isGeneratingImage}
                className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rendering High-Res Visual...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Commercial Image (1 Credit)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Image Preview Showcase & Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white">Generated Asset Canvas</h2>
                </div>
                {activeGeneratedImage && (
                  <span className="text-[10px] font-mono text-neutral-400">
                    {activeGeneratedImage.aspectRatio} • {activeGeneratedImage.purpose}
                  </span>
                )}
              </div>

              {/* Main Image Display Box */}
              <div className="min-h-[360px] flex items-center justify-center bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 p-2 relative group">
                {activeGeneratedImage ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                    <img
                      src={activeGeneratedImage.imageUrl}
                      alt={activeGeneratedImage.prompt}
                      referrerPolicy="no-referrer"
                      className="max-h-[440px] w-auto object-contain rounded-lg shadow-2xl"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-300">
                        No image generated in this session yet
                      </div>
                      <div className="text-xs text-neutral-500 max-w-sm mt-1">
                        Select an aspect ratio and style, then hit Generate to render your first 4K Whop marketing visual.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for Active Image */}
              {activeGeneratedImage && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={activeGeneratedImage.imageUrl}
                      download="whop_commercial_asset.png"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PNG
                    </a>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeGeneratedImage.imageUrl);
                        setCopiedImageLink(true);
                        setTimeout(() => setCopiedImageLink(false), 2500);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-200 text-xs hover:border-neutral-600 transition-colors"
                    >
                      {copiedImageLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedImageLink ? 'Copied Data!' : 'Copy Image Link'}
                    </button>
                  </div>

                  {/* Send Image to Video Studio */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-neutral-400 font-medium mr-1">Use as Video Background:</span>
                    {project.scenes.slice(0, 4).map((_, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleApplyImageToScene(activeGeneratedImage.imageUrl, sIdx)}
                        className="px-2.5 py-1 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-900 transition-colors"
                      >
                        Scene {sIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Generation Gallery */}
              {recentImages.length > 1 && (
                <div className="pt-4 border-t border-neutral-800 space-y-2">
                  <div className="text-xs font-semibold text-neutral-300">
                    Recent Image Generations ({recentImages.length})
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {recentImages.map((img, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => setActiveGeneratedImage(img)}
                        className={`h-16 w-16 shrink-0 rounded-lg overflow-hidden border transition-all ${
                          activeGeneratedImage === img
                            ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                            : 'border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <img
                          src={img.imageUrl}
                          alt={img.prompt}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
