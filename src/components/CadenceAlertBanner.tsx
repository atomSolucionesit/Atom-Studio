'use client';

import React, { useState } from 'react';
import { AlertCircle, Sparkles, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { CadenceHealth } from '@/lib/types';

interface CadenceAlertBannerProps {
  health: CadenceHealth | null;
  onAutoGenerate: () => Promise<void>;
  onNavigateToStudio: () => void;
}

export const CadenceAlertBanner: React.FC<CadenceAlertBannerProps> = ({
  health,
  onAutoGenerate,
  onNavigateToStudio,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!health || isDismissed) return null;

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await onAutoGenerate();
      onNavigateToStudio();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const isUrgent = health.daysSinceLastPost >= 4;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 md:p-5 border transition-all duration-300 shadow-sm ${
        isUrgent
          ? 'bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-zinc-900/60 border-amber-500/30 text-amber-200'
          : 'bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-900/60 border-indigo-500/30 text-indigo-200'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl mt-0.5 md:mt-0 ${
              isUrgent ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}
          >
            {isUrgent ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white">
                Cadencia Editorial
              </span>
              <span className="text-xs text-zinc-400">
                {health.daysSinceLastPost === 0
                  ? '¡Publicaste hoy!'
                  : `Hace ${health.daysSinceLastPost} días sin publicar`}
              </span>
            </div>
            <p className="text-sm font-medium text-zinc-100 mt-1">
              {health.suggestionMessage}
            </p>
            {health.unusedAssetsCount > 0 && (
              <p className="text-xs text-zinc-400 mt-0.5">
                📦 Tienes <strong className="text-zinc-200">{health.unusedAssetsCount} notas/capturas sin usar</strong> listas en el banco.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || health.unusedAssetsCount === 0}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generando Carrusel...' : '✨ Generar con contenido pendiente'}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1"
          >
            Ocultar
          </button>
        </div>
      </div>
    </div>
  );
};
