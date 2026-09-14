'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Monitor,
  Tag,
  Check,
  Sparkles,
  Code,
  Bug,
  Zap,
  Layers,
  Wrench,
  MessageSquare,
} from 'lucide-react';
import { AssetType, TeamMember, UserRole, SlackChannel } from '@/lib/types';
import { api } from '@/lib/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  apiUpload: (formData: FormData) => Promise<any>;
  currentMember: TeamMember | null;
}

const COMMON_TAGS_GENERAL = ['feature', 'cliente', 'hito', 'equipo', 'diseño', 'demo', 'lanzamiento'];
const COMMON_TAGS_DEV = ['bug fix', 'performance', 'postgresql', 'redis', 'arquitectura', 'api', 'refactor', 'docker'];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  apiUpload,
  currentMember,
}) => {
  const isDevRole = currentMember?.role === 'DEVELOPER';
  const [activeMode, setActiveMode] = useState<'DEV' | 'CREATIVE'>(isDevRole ? 'DEV' : 'CREATIVE');

  // Dev mode state
  const [devCategory, setDevCategory] = useState<'BUG' | 'PERF' | 'FEATURE' | 'REFACTOR'>('BUG');
  const [devProblem, setDevProblem] = useState('');
  const [devSolution, setDevSolution] = useState('');

  // Creative mode state
  const [assetType, setAssetType] = useState<AssetType>('SCREENSHOT');
  const [noteContent, setNoteContent] = useState('');

  // Shared state
  const [tags, setTags] = useState<string[]>(isDevRole ? ['bug fix', 'arquitectura'] : ['feature']);
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de notificación a Slack
  const [notifySlack, setNotifySlack] = useState<boolean>(true);
  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([]);
  const [selectedSlackChannel, setSelectedSlackChannel] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      api.getSlackChannels().then((chs) => {
        setSlackChannels(chs);
        if (chs.length > 0) {
          const defaultCh = chs.find(
            (c) =>
              c.name.toLowerCase().includes('desarrollo') ||
              c.name.toLowerCase().includes('general') ||
              c.name.toLowerCase().includes('comunicacion'),
          ) || chs[0];
          setSelectedSlackChannel(defaultCh.id);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (currentMember?.role === 'DEVELOPER') {
      setActiveMode('DEV');
      setTags(['bug fix', 'performance']);
    } else {
      setActiveMode('CREATIVE');
      setTags(['feature']);
    }
  }, [currentMember]);

  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase();
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalNote = '';
    let finalType: AssetType = assetType;

    if (activeMode === 'DEV') {
      if (!devProblem.trim()) {
        setErrorMsg('Por favor describe el desafío o bug resuelto.');
        return;
      }
      finalNote = `[${devCategory}] Desafío: ${devProblem.trim()} | Solución técnica: ${devSolution.trim() || 'Resuelto con mejores prácticas de ingeniería'}`;
      finalType = file ? 'SCREENSHOT' : 'NOTE';
    } else {
      if (!noteContent.trim() && !file) {
        setErrorMsg('Por favor escribe una nota de contexto o sube un archivo.');
        return;
      }
      finalNote = noteContent.trim();
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);
      const formData = new FormData();
      formData.append('type', finalType);
      formData.append('noteContent', finalNote);
      formData.append('tags', tags.join(','));
      if (currentMember?.id) {
        formData.append('uploadedById', currentMember.id);
      }
      if (file) {
        formData.append('file', file);
      }

      await apiUpload(formData);

      // Notificar a Slack si la opción está activa
      if (notifySlack && selectedSlackChannel) {
        try {
          const authorName = currentMember?.name || 'Colaborador Atom';
          const authorRole = currentMember?.role || 'EQUIPO';
          const authorAvatar = currentMember?.avatar || undefined;

          const slackTitle =
            activeMode === 'DEV'
              ? `[${devCategory}] ${devProblem.trim().slice(0, 100)}`
              : (noteContent.trim().slice(0, 100) || 'Nuevo contenido subido');

          const slackDetail =
            activeMode === 'DEV'
              ? (devSolution.trim() ? `💡 Solución: ${devSolution.trim()}` : undefined)
              : (noteContent.trim() || undefined);

          await api.notifySlackActivity({
            channel: selectedSlackChannel,
            eventType: 'ASSET_UPLOADED',
            title: slackTitle,
            detail: slackDetail,
            tags: tags,
            authorName,
            authorRole,
            authorAvatar,
          });
        } catch (slackErr) {
          console.warn('No se pudo enviar notificación a Slack:', slackErr);
        }
      }

      onUploadSuccess();
      onClose();
      // Reset form
      setNoteContent('');
      setDevProblem('');
      setDevSolution('');
      setFile(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el material.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                activeMode === 'DEV' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-pink-500/20 text-pink-400'
              }`}
            >
              {activeMode === 'DEV' ? <Code className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                {activeMode === 'DEV' ? 'Ingesta de Desarrollo (Dev Log)' : 'Carga de Material Creativo'}
              </h3>
              <p className="text-xs text-zinc-400">
                Subiendo como: <strong className="text-zinc-200">{currentMember?.name || 'Usuario'}</strong> ({currentMember?.role || 'DEVELOPER'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de modo para Administrador */}
        {currentMember?.role === 'ADMIN' && (
          <div className="grid grid-cols-2 gap-1 p-1 mt-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveMode('DEV')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'DEV' ? 'bg-zinc-800 text-emerald-400 shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Modo Desarrollador (Bugs/Queries)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('CREATIVE')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'CREATIVE' ? 'bg-zinc-800 text-pink-400 shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Modo Creativo / Marketing</span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* VISTA MODO DESARROLLADOR */}
          {activeMode === 'DEV' ? (
            <>
              {/* Categorías Técnicas */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Categoría Técnica del Aporte
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'BUG' as const, label: 'Bug Fix', icon: Bug, color: 'text-red-400' },
                    { key: 'PERF' as const, label: 'Optimización', icon: Zap, color: 'text-amber-400' },
                    { key: 'FEATURE' as const, label: 'Nueva Feature', icon: Layers, color: 'text-sky-400' },
                    { key: 'REFACTOR' as const, label: 'Refactor / Stack', icon: Wrench, color: 'text-emerald-400' },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = devCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => {
                          setDevCategory(cat.key);
                          if (cat.key === 'BUG' && !tags.includes('bug fix')) setTags([...tags, 'bug fix']);
                          if (cat.key === 'PERF' && !tags.includes('performance')) setTags([...tags, 'performance']);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-xs'
                            : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1 ${cat.color}`} />
                        <span className="text-[11px]">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preguntas guiadas de Dev Log */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  ¿Qué problema, error o desafío técnico enfrentaste hoy?
                </label>
                <textarea
                  value={devProblem}
                  onChange={(e) => setDevProblem(e.target.value)}
                  placeholder='Ej: "La query de reporte de facturación tardaba 14s y bloqueaba conexiones en Postgres"'
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  ¿Cómo lo resolviste o qué aprendió el equipo? (Opcional)
                </label>
                <textarea
                  value={devSolution}
                  onChange={(e) => setDevSolution(e.target.value)}
                  placeholder='Ej: "Creamos un índice compuesto por (organization_id, created_at) y bajó a 240ms"'
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </>
          ) : (
            /* VISTA MODO CREATIVO / MARKETING */
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tipo de Material
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { type: 'SCREENSHOT' as AssetType, label: 'Captura', icon: Monitor },
                    { type: 'PHOTO' as AssetType, label: 'Foto', icon: ImageIcon },
                    { type: 'VIDEO' as AssetType, label: 'Video', icon: Video },
                    { type: 'NOTE' as AssetType, label: 'Nota', icon: FileText },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = assetType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setAssetType(item.type)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-pink-500 bg-pink-500/10 text-pink-300 shadow-sm'
                            : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nota Corta de Contexto
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder='Ej: "Lanzamiento oficial del dashboard de métricas en tiempo real"'
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500 resize-none"
                  required
                />
              </div>
            </>
          )}

          {/* Subida de Archivo (Captura de código, terminal o multimedia) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {activeMode === 'DEV'
                ? 'Captura de Código / Terminal / Gráfico (Opcional)'
                : 'Archivo Multimedia (Drive Sync)'}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 rounded-xl p-3 text-center cursor-pointer transition-colors bg-zinc-950/30"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                accept="image/*,video/*"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-xs text-indigo-300 font-medium">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{file.name}</span>
                  <span className="text-zinc-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                  <p className="text-xs text-zinc-300">Haz clic o arrastra una imagen o captura</p>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Etiquetas (Tags)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(activeMode === 'DEV' ? COMMON_TAGS_DEV : COMMON_TAGS_GENERAL).map((t) => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleToggleTag(t)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? activeMode === 'DEV'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-pink-600 text-white shadow-xs'
                        : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                placeholder="Escribe otro tag y presiona Enter..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Opción de Notificar a Slack */}
          <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                Notificar subida a Slack
              </span>
              <input
                type="checkbox"
                checked={notifySlack}
                onChange={(e) => setNotifySlack(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
            </label>

            {notifySlack && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-zinc-500 whitespace-nowrap">Canal de destino:</span>
                <select
                  value={selectedSlackChannel}
                  onChange={(e) => setSelectedSlackChannel(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs focus:outline-hidden focus:border-purple-500"
                >
                  {slackChannels.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      #{ch.name} {ch.is_private ? '(Privado)' : ''}
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
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 ${
                activeMode === 'DEV'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                  : 'bg-pink-600 hover:bg-pink-500 shadow-pink-500/20'
              }`}
            >
              {isUploading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>{activeMode === 'DEV' ? 'Guardar Dev Log' : 'Guardar en Banco'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
