'use client';

import React, { useState } from 'react';
import { Publication, CadenceHealth, PublicationStatus } from '@/lib/types';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface EditorialCalendarViewProps {
  publications: Publication[];
  health: CadenceHealth | null;
  onSelectPublication: (id: string) => void;
  onAutoGenerateFromCadence: () => Promise<void>;
  isGenerating: boolean;
}

export const EditorialCalendarView: React.FC<EditorialCalendarViewProps> = ({
  publications,
  health,
  onSelectPublication,
  onAutoGenerateFromCadence,
  isGenerating,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredPublications = publications.filter((p) => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: PublicationStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Publicado
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Listo para Postear
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Clock className="w-3 h-3" />
            En Revisión
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
            <Clock className="w-3 h-3" />
            Borrador
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            Calendario Editorial & Frecuencia
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Planifica tus lanzamientos y mantén constancia en LinkedIn e Instagram.
          </p>
        </div>

        {/* Filtro de Estado */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-zinc-500 ml-2" />
          {['ALL', 'READY', 'DRAFT', 'PUBLISHED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === s
                  ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s === 'ALL' ? 'Todos' : s === 'READY' ? 'Listos' : s === 'DRAFT' ? 'Borradores' : 'Publicados'}
            </button>
          ))}
        </div>
      </div>

      {/* Widget de Salud de Cadencia */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Último Post Realizado
            </span>
            <div className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              {health.daysSinceLastPost === 0
                ? '¡Publicaste hoy!'
                : `Hace ${health.daysSinceLastPost} días`}
              {health.daysSinceLastPost >= 4 ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Cadencia recomendada: 3 veces por semana.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Publicaciones Listas / En Revisión
            </span>
            <div className="text-lg font-bold text-zinc-100">
              {health.readyCount} listas / {health.draftsCount} borradores
            </div>
            <p className="text-xs text-zinc-400">
              {health.readyCount > 0
                ? 'Tienes contenido listo para postear manualmente.'
                : 'Prepara tu próximo post para no perder tracción.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-zinc-900/80 border border-indigo-500/30 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                Acción Rápida de Cadencia
              </span>
              <p className="text-xs text-zinc-300 mt-0.5">
                {health.unusedAssetsCount} notas sin usar en el banco.
              </p>
            </div>
            <button
              onClick={onAutoGenerateFromCadence}
              disabled={isGenerating || health.unusedAssetsCount === 0}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Generar con pendientes</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista / Timeline de Publicaciones */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Cronograma Editorial ({filteredPublications.length})
        </h3>

        {filteredPublications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 text-xs text-zinc-500">
            No hay publicaciones en este estado.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredPublications.map((pub) => {
              const displayDate = pub.scheduledFor || pub.publishedAt || pub.createdAt;
              return (
                <div
                  key={pub.id}
                  onClick={() => onSelectPublication(pub.id)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all cursor-pointer gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
                      <CalendarIcon className="w-4 h-4" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                          {pub.title}
                        </h4>
                        {getStatusBadge(pub.status)}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {pub.concept || 'Publicación en carrusel multicanal'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-zinc-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800/60">
                    <span className="text-[11px] text-zinc-500">
                      {format(new Date(displayDate), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                      {pub.slides?.length || 0} slides
                    </span>

                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
