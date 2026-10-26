import React from 'react';
import { AIPersonaId, AI_PERSONAS, AIPersonaConfig } from '../types';
import {
  Flame,
  HeartHandshake,
  Cpu,
  Zap,
  Briefcase,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface AIPersonaSelectorProps {
  selectedPersona: AIPersonaId;
  onSelectPersona: (persona: AIPersonaId) => void;
  compact?: boolean;
  label?: string;
  showSamplePreview?: boolean;
}

const PERSONA_ICONS: Record<AIPersonaId, React.ComponentType<{ className?: string }>> = {
  aggressive_salesman: Flame,
  empathetic_creator: HeartHandshake,
  technical_expert: Cpu,
  contrarian_disruptor: Zap,
  executive_strategist: Briefcase,
};

const PERSONA_COLORS: Record<AIPersonaId, { text: string; bg: string; border: string; activeBorder: string; activeBg: string }> = {
  aggressive_salesman: {
    text: 'text-amber-400',
    bg: 'bg-amber-950/30',
    border: 'border-amber-800/40',
    activeBorder: 'border-amber-500',
    activeBg: 'bg-amber-950/50',
  },
  empathetic_creator: {
    text: 'text-rose-400',
    bg: 'bg-rose-950/30',
    border: 'border-rose-800/40',
    activeBorder: 'border-rose-500',
    activeBg: 'bg-rose-950/50',
  },
  technical_expert: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-950/30',
    border: 'border-cyan-800/40',
    activeBorder: 'border-cyan-500',
    activeBg: 'bg-cyan-950/50',
  },
  contrarian_disruptor: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-950/30',
    border: 'border-yellow-800/40',
    activeBorder: 'border-yellow-500',
    activeBg: 'bg-yellow-950/50',
  },
  executive_strategist: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-800/40',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-950/50',
  },
};

export const AIPersonaSelector: React.FC<AIPersonaSelectorProps> = ({
  selectedPersona,
  onSelectPersona,
  compact = false,
  label = 'AI Writing Persona & Voice',
  showSamplePreview = true,
}) => {
  const activeConfig = AI_PERSONAS[selectedPersona] || AI_PERSONAS.aggressive_salesman;
  const ActiveIcon = PERSONA_ICONS[selectedPersona] || Flame;
  const activeColor = PERSONA_COLORS[selectedPersona] || PERSONA_COLORS.aggressive_salesman;

  const personasList = Object.values(AI_PERSONAS);

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {label}
          </label>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${activeColor.border} ${activeColor.text} ${activeColor.bg}`}>
            {activeConfig.badge}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {personasList.map((p) => {
            const isSelected = selectedPersona === p.id;
            const Icon = PERSONA_ICONS[p.id];
            const color = PERSONA_COLORS[p.id];

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPersona(p.id)}
                className={`flex items-center gap-1.5 p-2 rounded-lg text-left text-xs font-medium transition-all border ${
                  isSelected
                    ? `${color.activeBorder} ${color.activeBg} text-white shadow-sm`
                    : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? color.text : 'text-neutral-500'}`} />
                <span className="truncate">{p.name}</span>
              </button>
            );
          })}
        </div>

        {showSamplePreview && (
          <div className={`p-2.5 rounded-lg border text-xs leading-relaxed transition-all ${activeColor.border} ${activeColor.bg}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`font-semibold text-[11px] ${activeColor.text} flex items-center gap-1`}>
                <ActiveIcon className="w-3 h-3" />
                {activeConfig.name} — {activeConfig.tagline}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Sample Tone</span>
            </div>
            <p className="text-neutral-300 italic text-[11px]">
              {activeConfig.sampleQuote}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {label}
          </label>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Select the writing persona that directs the voice, psychological hooks, and sales cadence of the output.
          </p>
        </div>
        <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${activeColor.border} ${activeColor.text} ${activeColor.bg} font-medium`}>
          Active: {activeConfig.name} ({activeConfig.badge})
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {personasList.map((p) => {
          const isSelected = selectedPersona === p.id;
          const Icon = PERSONA_ICONS[p.id];
          const color = PERSONA_COLORS[p.id];

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPersona(p.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? `${color.activeBorder} ${color.activeBg} text-white shadow-md ring-1 ring-cyan-500/20`
                  : 'border-neutral-800 bg-neutral-950/70 text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? color.bg : 'bg-neutral-900'} ${color.text}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${color.text}`} />
                  ) : (
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                  {p.name}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                  {p.tagline}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-neutral-800/60 text-[10px] text-neutral-400 line-clamp-2 leading-tight">
                {p.tone}
              </div>
            </button>
          );
        })}
      </div>

      {showSamplePreview && (
        <div className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${activeColor.border} ${activeColor.bg}`}>
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-1.5">
              <ActiveIcon className={`w-3.5 h-3.5 ${activeColor.text}`} />
              <span className={`font-semibold text-xs ${activeColor.text}`}>
                Voice Preview: {activeConfig.name}
              </span>
              <span className="text-neutral-500 text-[11px]">• {activeConfig.tagline}</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono bg-neutral-900/80 px-2 py-0.5 rounded border border-neutral-800">
              Directs title, modules, hooks, and emails
            </span>
          </div>
          <p className="text-neutral-200 italic text-[11px] bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80 leading-relaxed">
            {activeConfig.sampleQuote}
          </p>
        </div>
      )}
    </div>
  );
};
