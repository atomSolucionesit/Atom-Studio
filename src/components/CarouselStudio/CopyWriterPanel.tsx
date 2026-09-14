'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  Calendar,
  Sparkles,
  Send,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Publication, PublicationCopy, PlatformType, PublicationStatus } from '@/lib/types';
import confetti from 'canvas-confetti';

interface CopyWriterPanelProps {
  publication: Publication;
  onUpdateCopy: (copyId: string, data: Partial<PublicationCopy>) => Promise<void>;
  onUpdateStatus: (status: PublicationStatus) => Promise<void>;
  onPublish: () => Promise<void>;
  onSchedule: (date: string) => Promise<void>;
}

export const CopyWriterPanel: React.FC<CopyWriterPanelProps> = ({
  publication,
  onUpdateCopy,
  onUpdateStatus,
  onPublish,
  onSchedule,
}) => {
  const [activePlatform, setActivePlatform] = useState<PlatformType>('LINKEDIN');
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Encontrar el copy correspondiente a la plataforma activa
  const currentCopy = publication.copies.find((c) => c.platform === activePlatform) || publication.copies[0];

  // Estado editable local
  const [hook, setHook] = useState(currentCopy?.hook || '');
  const [body, setBody] = useState(currentCopy?.body || '');
  const [cta, setCta] = useState(currentCopy?.cta || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar al cambiar de plataforma
  React.useEffect(() => {
    const copy = publication.copies.find((c) => c.platform === activePlatform);
    if (copy) {
      setHook(copy.hook);
      setBody(copy.body);
      setCta(copy.cta);
    }
  }, [activePlatform, publication.copies]);

  const handleSaveCopyChanges = async () => {
    if (!currentCopy) return;
    try {
      setIsSaving(true);
      await onUpdateCopy(currentCopy.id, { hook, body, cta });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyClipboard = async () => {
    const fullText = `${hook}\n\n${body}\n\n${cta}\n\n${currentCopy?.hashtags || ''}`.trim();
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePublishNow = async () => {
    try {
      setIsPublishing(true);
      await onPublish();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsPublishing(false);
    }
  };

  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'LINKEDIN':
        return (
          <svg className="w-4 h-4 text-sky-400 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
        );
      case 'INSTAGRAM':
        return (
          <svg className="w-4 h-4 text-pink-400 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        );
      case 'X':
        return (
          <svg className="w-3.5 h-3.5 text-zinc-200 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/70 border border-zinc-800 rounded-3xl p-5 space-y-4">
      {/* Cabecera del Panel */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" />
            Estudio Multicanal & Copys
          </h4>
          <p className="text-[11px] text-zinc-400">
            Copys optimizados por plataforma y listos para postear.
          </p>
        </div>

        {/* Estado actual de la publicación */}
        <select
          value={publication.status}
          onChange={(e) => onUpdateStatus(e.target.value as PublicationStatus)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="DRAFT">📝 Borrador</option>
          <option value="IN_REVIEW">👀 En Revisión</option>
          <option value="READY">✅ Listo para Postear</option>
          <option value="PUBLISHED">🚀 Publicado</option>
        </select>
      </div>

      {/* Tabs de Plataformas */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium">
        {(['LINKEDIN', 'INSTAGRAM', 'X'] as const).map((platform) => (
          <button
            key={platform}
            onClick={() => setActivePlatform(platform)}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              activePlatform === platform
                ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {getPlatformIcon(platform)}
            <span>{platform === 'LINKEDIN' ? 'LinkedIn' : platform === 'INSTAGRAM' ? 'Instagram' : 'X'}</span>
          </button>
        ))}
      </div>

      {/* Editor del Copy */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-xs">
        {/* Hook */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
              Hook Inicial (Primeros 3 segundos)
            </label>
            <span className="text-[10px] text-zinc-500">{hook.length} caracteres</span>
          </div>
          <textarea
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
          />
        </div>

        {/* Cuerpo del post */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Cuerpo del Post (Storytelling & Aprendizajes)
            </label>
            <span className="text-[10px] text-zinc-500">{body.length} caracteres</span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {/* CTA */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Llamado a la Acción (CTA)
          </label>
          <input
            type="text"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Hashtags */}
        {currentCopy?.hashtags && (
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-400 text-[11px]">
            <span className="text-zinc-500 mr-2 font-semibold">Hashtags:</span>
            {currentCopy.hashtags}
          </div>
        )}
      </div>

      {/* Barra de Acciones y Guardado */}
      <div className="pt-3 border-t border-zinc-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleSaveCopyChanges}
            disabled={isSaving}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            {isSaving ? 'Guardando...' : 'Guardar Copy'}
          </button>

          <button
            onClick={handleCopyClipboard}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar Texto Completo'}</span>
          </button>
        </div>

        {/* Botón de Publicación / Cierre de Ciclo */}
        {publication.status !== 'PUBLISHED' ? (
          <button
            onClick={handlePublishNow}
            disabled={isPublishing}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isPublishing ? 'Marcando...' : 'Marcar como Publicado (Archiva Assets Crudos)'}</span>
          </button>
        ) : (
          <div className="p-2 text-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            ✓ Publicación activa (Assets marcados como USADOS)
          </div>
        )}
      </div>
    </div>
  );
};
