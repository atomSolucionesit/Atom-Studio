'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Monitor,
  Image as ImageIcon,
  Video,
  FileText,
  ExternalLink,
  Trash2,
  CheckSquare,
  Square,
  Plus,
} from 'lucide-react';
import { RawAsset, AssetStatus } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContentBankViewProps {
  assets: RawAsset[];
  tags: string[];
  selectedAssetIds: string[];
  onToggleSelectAsset: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onOpenUpload: () => void;
  onUpdateStatus: (id: string, status: AssetStatus) => Promise<void>;
  onDeleteAsset: (id: string) => Promise<void>;
  onGeneratePublication: (selectedIds: string[]) => void;
  isGenerating: boolean;
}

export const ContentBankView: React.FC<ContentBankViewProps> = ({
  assets,
  tags,
  selectedAssetIds,
  onToggleSelectAsset,
  onSelectAll,
  onClearSelection,
  onOpenUpload,
  onUpdateStatus,
  onDeleteAsset,
  onGeneratePublication,
  isGenerating,
}) => {
  const [activeStatus, setActiveStatus] = useState<'ALL' | 'UNUSED' | 'USED'>('ALL');
  const [activeTag, setActiveTag] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrado reactivo en el cliente
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (activeStatus !== 'ALL' && asset.status !== activeStatus) return false;
      if (activeTag !== 'ALL') {
        const assetTags = asset.tags.split(',').map((t) => t.trim().toLowerCase());
        if (!assetTags.includes(activeTag.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNote = asset.noteContent.toLowerCase().includes(q);
        const matchesTags = asset.tags.toLowerCase().includes(q);
        if (!matchesNote && !matchesTags) return false;
      }
      return true;
    });
  }, [assets, activeStatus, activeTag, searchQuery]);

  const allFilteredIds = useMemo(() => filteredAssets.map((a) => a.id), [filteredAssets]);
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedAssetIds.includes(id));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SCREENSHOT':
        return <Monitor className="w-3.5 h-3.5 text-sky-400" />;
      case 'PHOTO':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'VIDEO':
        return <Video className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra Superior con Controles */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            Banco de Contenido Crudo
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
              {filteredAssets.length} {filteredAssets.length === 1 ? 'elemento' : 'elementos'}
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Selecciona 1 o más elementos para transformarlos en carruseles y copys para LinkedIn e Instagram.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Material</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros & Búsqueda */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por notas de contexto o etiquetas..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950/70 border border-zinc-800 self-start md:self-auto">
            {(['ALL', 'UNUSED', 'USED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeStatus === status
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {status === 'ALL' ? 'Todos' : status === 'UNUSED' ? '⚡ Sin Usar' : '✓ Usados'}
              </button>
            ))}
          </div>
        </div>

        {/* Chips de Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          <span className="text-zinc-500 font-medium text-[11px] uppercase tracking-wider mr-1">Tags:</span>
          <button
            onClick={() => setActiveTag('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTag === 'ALL'
                ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300'
                : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            Todos
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTag === tag
                  ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Selección Masiva & Acción Flotante */}
      {selectedAssetIds.length > 0 && (
        <div className="sticky top-18 z-20 flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 backdrop-blur-md text-indigo-200 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              {selectedAssetIds.length} {selectedAssetIds.length === 1 ? 'seleccionado' : 'seleccionados'}
            </span>
            <button
              onClick={onClearSelection}
              className="text-xs text-indigo-300/80 hover:text-white underline"
            >
              Deseleccionar todos
            </button>
          </div>

          <button
            onClick={() => onGeneratePublication(selectedAssetIds)}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/30 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generando Carrusel...' : '✨ Generar Publicación con Seleccionados'}
          </button>
        </div>
      )}

      {/* Grid de Assets */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
          <Monitor className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-300">No hay material en este filtro</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Sube fotos, videos, capturas o notas sobre el desarrollo del día a día para nutrir el banco de contenido.
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Subir Primer Material</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const isSelected = selectedAssetIds.includes(asset.id);
            const isUsed = asset.status === 'USED';

            return (
              <div
                key={asset.id}
                className={`relative group rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/15 shadow-md shadow-indigo-500/10'
                    : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                {/* Cabecera de Tarjeta */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    {/* Checkbox de Selección */}
                    <button
                      type="button"
                      onClick={() => onToggleSelectAsset(asset.id)}
                      className="flex items-center gap-2 text-xs font-medium text-zinc-300"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      )}
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        {getTypeIcon(asset.type)}
                        {asset.type}
                      </span>
                    </button>

                    {/* Estado Badge */}
                    <button
                      onClick={() => onUpdateStatus(asset.id, isUsed ? 'UNUSED' : 'USED')}
                      title="Clic para alternar estado usado/sin usar"
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                        isUsed
                          ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isUsed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-zinc-400" />
                          Usado
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-emerald-400" />
                          Disponible
                        </>
                      )}
                    </button>
                  </div>

                  {/* Vista previa multimedia si existe */}
                  {(asset.localPath || asset.driveThumbnailUrl || asset.driveViewUrl) && (
                    <div className="w-full h-36 rounded-xl bg-zinc-950 border border-zinc-800/60 overflow-hidden relative">
                      {asset.type === 'VIDEO' ? (
                        <div className="w-full h-full bg-zinc-950 relative flex items-center justify-center group/video">
                          {asset.localPath ? (
                            <video
                              src={asset.localPath}
                              className="w-full h-full object-cover"
                              preload="metadata"
                              muted
                              playsInline
                            />
                          ) : (
                            <Video className="w-8 h-8 text-zinc-600" />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none group-hover/video:bg-black/20 transition-colors">
                            <Video className="w-8 h-8 text-white/80" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={asset.localPath || asset.driveThumbnailUrl || (asset.driveFileId ? `https://drive.google.com/thumbnail?id=${asset.driveFileId}&sz=w800` : '')}
                          alt={asset.originalFilename || 'Asset preview'}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            if (asset.localPath && e.currentTarget.src !== asset.localPath) {
                              e.currentTarget.src = asset.localPath;
                            }
                          }}
                        />
                      )}
                      {asset.driveFileId && (
                        <a
                          href={asset.driveViewUrl || `https://drive.google.com/file/d/${asset.driveFileId}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 p-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] flex items-center gap-1 px-2 border border-zinc-700/60 shadow-md transition-all"
                        >
                          <ExternalLink className="w-3 h-3 text-emerald-400" />
                          <span>Drive</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Nota de Contexto */}
                  <p className="text-xs font-normal text-zinc-200 line-clamp-3 leading-relaxed">
                    {asset.noteContent || '(Sin nota de contexto)'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.split(',').map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-400 border border-zinc-800/80"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pie de Tarjeta */}
                <div className="px-4 py-2.5 bg-zinc-950/40 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>
                    {format(new Date(asset.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      title="Eliminar del banco"
                      className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
