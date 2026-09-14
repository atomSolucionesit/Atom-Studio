'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SlackChannel, SlackEventType, TeamMember } from '@/lib/types';
import {
  X,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Tag,
} from 'lucide-react';

interface ShareToSlackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember: TeamMember | null;
  initialData?: {
    eventType?: SlackEventType;
    title?: string;
    detail?: string;
    link?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    preferredChannel?: string;
  };
  onSuccess?: () => void;
}

export const ShareToSlackModal: React.FC<ShareToSlackModalProps> = ({
  isOpen,
  onClose,
  currentMember,
  initialData,
  onSuccess,
}) => {
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [isLoadingChannels, setIsLoadingChannels] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDetail(initialData?.detail || '');
      setSentSuccess(false);
      setErrorMsg(null);
      loadChannels();
    }
  }, [isOpen, initialData]);

  const loadChannels = async () => {
    try {
      setIsLoadingChannels(true);
      const res = await api.getSlackChannels().catch(() => []);
      setChannels(res);

      if (res.length > 0) {
        const pref = initialData?.preferredChannel;
        const matched = res.find(
          (c) =>
            (pref && (c.id === pref || c.name === pref)) ||
            c.name.toLowerCase().includes('desarrollo') ||
            c.name.toLowerCase().includes('dev'),
        );
        setSelectedChannelId(matched ? matched.id : res[0].id);
      }
    } catch (err) {
      console.error('Error cargando canales de Slack:', err);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannelId) {
      setErrorMsg('Por favor selecciona un canal de Slack.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Por favor ingresa un título para la notificación.');
      return;
    }

    try {
      setIsSending(true);
      setErrorMsg(null);

      const authorName = currentMember?.name || 'Colaborador Atom';
      const authorRole = currentMember?.role || 'EQUIPO';
      const authorAvatar =
        currentMember?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=6366f1&color=fff`;

      await api.notifySlackActivity({
        channel: selectedChannelId,
        eventType: initialData?.eventType || 'CUSTOM_ANNOUNCEMENT',
        title: title.trim(),
        detail: detail.trim() || undefined,
        link: initialData?.link,
        tags: initialData?.tags,
        metadata: initialData?.metadata,
        authorName,
        authorRole,
        authorAvatar,
      });

      setSentSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al notificar en Slack.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 space-y-5 text-xs">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Notificar en Slack</h3>
              <p className="text-zinc-400 text-[11px]">
                Comparte este contenido con tu equipo en el canal que elijas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notificación de Éxito */}
        {sentSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-emerald-300">¡Notificación enviada a Slack!</h4>
            <p className="text-zinc-400 text-xs">
              El mensaje ha sido publicado en el canal seleccionado identificado con tu usuario.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            {/* Banner: Publicando como Usuario */}
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  {currentMember?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-zinc-400 block">Publicarás como:</span>
                  <span className="font-bold text-zinc-200 truncate block text-xs">
                    {currentMember?.name || 'Colaborador'} ({currentMember?.role || 'EQUIPO'})
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex-shrink-0">
                En Vivo
              </span>
            </div>

            {/* Selector de Canal */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                Canal de Slack de destino: <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                disabled={isLoadingChannels}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-hidden focus:border-purple-500"
              >
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    #{ch.name} {ch.is_private ? '(Privado)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Título del Mensaje */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">
                Título / Asunto: <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-hidden focus:border-purple-500"
                placeholder="Ej: Actualización de login, nuevo diseño, etc."
              />
            </div>

            {/* Detalle o Comentario Adicional */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">
                Detalle / Comentario para el equipo (opcional):
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-hidden focus:border-purple-500 resize-none font-mono"
                placeholder="Agrega contexto, menciones o instrucciones..."
              />
            </div>

            {/* Enlace adjunto si existe */}
            {initialData?.link && (
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="truncate max-w-[80%]">🔗 {initialData.link}</span>
                <a
                  href={initialData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Tags adjuntos si existen */}
            {initialData?.tags && initialData.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3 h-3 text-zinc-500" />
                {initialData.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px] font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Mensaje de Error */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Botones */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSending || !title.trim()}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publicar en Slack</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
