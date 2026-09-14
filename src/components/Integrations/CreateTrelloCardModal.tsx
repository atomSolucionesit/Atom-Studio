'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TrelloBoard, TrelloList, SlackChannel } from '@/lib/types';
import {
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  MessageSquare,
  Sparkles,
  Layers,
} from 'lucide-react';

export const TrelloIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="3" />
    <rect width="3.5" height="10" x="6.5" y="7" rx="1" fill="currentColor" />
    <rect width="3.5" height="6.5" x="14" y="7" rx="1" fill="currentColor" />
  </svg>
);

interface CreateTrelloCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    name?: string;
    desc?: string;
  };
  onSuccess?: (card: any) => void;
}

export const CreateTrelloCardModal: React.FC<CreateTrelloCardModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const [boards, setBoards] = useState<TrelloBoard[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [lists, setLists] = useState<TrelloList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');

  const [cardTitle, setCardTitle] = useState<string>('');
  const [cardDesc, setCardDesc] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  // Notificación opcional a Slack
  const [notifySlack, setNotifySlack] = useState<boolean>(false);
  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([]);
  const [selectedSlackChannel, setSelectedSlackChannel] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdCard, setCreatedCard] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicializar campos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCardTitle(initialData?.name || '');
      setCardDesc(initialData?.desc || '');
      setCreatedCard(null);
      setErrorMsg(null);
      loadBoardsAndChannels();
    }
  }, [isOpen, initialData]);

  const loadBoardsAndChannels = async () => {
    try {
      setIsLoading(true);
      const [boardsRes, channelsRes] = await Promise.all([
        api.getTrelloBoards().catch(() => []),
        api.getSlackChannels().catch(() => []),
      ]);

      setBoards(boardsRes);
      setSlackChannels(channelsRes);

      if (channelsRes.length > 0) {
        const defaultCh = channelsRes.find((c) => c.name.includes('dev') || c.name.includes('bugs')) || channelsRes[0];
        setSelectedSlackChannel(defaultCh.id);
      }

      if (boardsRes.length > 0) {
        const firstBoard = boardsRes[0];
        setSelectedBoardId(firstBoard.id);
        const listsRes = await api.getTrelloBoardLists(firstBoard.id).catch(() => []);
        setLists(listsRes);
        if (listsRes.length > 0) {
          setSelectedListId(listsRes[0].id);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('No se pudieron cargar tableros de Trello.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoardChange = async (boardId: string) => {
    setSelectedBoardId(boardId);
    try {
      const listsRes = await api.getTrelloBoardLists(boardId);
      setLists(listsRes);
      if (listsRes.length > 0) {
        setSelectedListId(listsRes[0].id);
      } else {
        setSelectedListId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitle.trim()) {
      alert('Por favor indica un título para la tarea.');
      return;
    }
    if (!selectedListId) {
      alert('Por favor selecciona una lista/columna de Trello.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const card = await api.createTrelloCard({
        idList: selectedListId,
        name: cardTitle.trim(),
        desc: cardDesc.trim(),
        due: dueDate ? new Date(dueDate).toISOString() : undefined,
        notifySlackChannel: notifySlack && selectedSlackChannel ? selectedSlackChannel : undefined,
      });

      setCreatedCard(card);
      if (onSuccess) onSuccess(card);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear tarjeta en Trello.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <TrelloIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Levantar Tarea en Trello</h3>
              <p className="text-xs text-zinc-400">
                Crea una tarjeta en tu tablero de gestión y notifica al equipo.
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
        {createdCard ? (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-zinc-100">¡Tarea levantada con éxito!</h4>
                <p className="text-xs text-emerald-300/80 mt-1">
                  La tarjeta <strong>"{createdCard.name}"</strong> fue creada en Trello.
                  {notifySlack && ' Se despachó el aviso automático en el canal de Slack.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={createdCard.url || createdCard.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Abrir Tarjeta en Trello</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Selectores de Tablero y Columna */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Tablero de Trello:
                </label>
                <select
                  value={selectedBoardId}
                  onChange={(e) => handleBoardChange(e.target.value)}
                  disabled={isLoading || boards.length === 0}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-hidden focus:border-indigo-500 disabled:opacity-50"
                >
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <TrelloIcon className="w-3.5 h-3.5 text-blue-400" />
                  Lista / Columna de destino:
                </label>
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  disabled={isLoading || lists.length === 0}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-hidden focus:border-indigo-500 disabled:opacity-50"
                >
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Título de la tarjeta */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">
                Título de la Tarjeta / Tarea: <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                placeholder="Ej: Fix BUG006: Sincronización MercadoLibre y Nexus"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-hidden focus:border-indigo-500"
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300">Descripción / Detalles Técnicos:</label>
              <textarea
                rows={4}
                value={cardDesc}
                onChange={(e) => setCardDesc(e.target.value)}
                placeholder="Detalla el problema, solución propuesta, repo involucrado o pasos para reproducir..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-hidden focus:border-indigo-500 font-mono resize-none leading-relaxed"
              />
            </div>

            {/* Fecha Límite */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Fecha Límite (Due Date - Opcional):
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            {/* Checkbox Notificar en Slack */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifySlack}
                  onChange={(e) => setNotifySlack(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  Notificar en Slack al crear la tarjeta
                </span>
              </label>

              {notifySlack && (
                <div className="pl-6 pt-1 flex items-center gap-2">
                  <span className="text-zinc-400 text-[11px]">Canal de Slack:</span>
                  <select
                    value={selectedSlackChannel}
                    onChange={(e) => setSelectedSlackChannel(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-mono"
                  >
                    {slackChannels.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !cardTitle.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Levantando tarjeta...</span>
                  </>
                ) : (
                  <>
                    <TrelloIcon className="w-4 h-4" />
                    <span>Crear en Trello</span>
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
