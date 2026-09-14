'use client';

import React, { useState } from 'react';
import { Publication, Slide, PublicationCopy, BrandProfile, PublicationStatus, TeamMember } from '@/lib/types';
import { SlideCanvas } from './SlideCanvas';
import { SlideThumbnails } from './SlideThumbnails';
import { CopyWriterPanel } from './CopyWriterPanel';
import { ShareToSlackModal } from '../Integrations/ShareToSlackModal';
import { Sparkles, Plus, Layers, ArrowLeft, Trash2, Calendar, FileText, MessageSquare } from 'lucide-react';

interface CarouselStudioViewProps {
  publications: Publication[];
  selectedPublicationId: string | null;
  brand: BrandProfile | null;
  currentMember?: TeamMember | null;
  onSelectPublication: (id: string) => void;
  onUpdateSlide: (pubId: string, slideId: string, data: Partial<Slide>) => Promise<void>;
  onRegenerateSlideImage: (pubId: string, slideId: string) => Promise<void>;
  onUpdateCopy: (pubId: string, copyId: string, data: Partial<PublicationCopy>) => Promise<void>;
  onUpdateStatus: (pubId: string, status: PublicationStatus) => Promise<void>;
  onPublishPublication: (pubId: string) => Promise<void>;
  onDeletePublication: (pubId: string) => Promise<void>;
  onQuickGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

export const CarouselStudioView: React.FC<CarouselStudioViewProps> = ({
  publications,
  selectedPublicationId,
  brand,
  currentMember,
  onSelectPublication,
  onUpdateSlide,
  onRegenerateSlideImage,
  onUpdateCopy,
  onUpdateStatus,
  onPublishPublication,
  onDeletePublication,
  onQuickGenerate,
  isGenerating,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSlackModal, setShowSlackModal] = useState(false);

  const selectedPublication =
    publications.find((p) => p.id === selectedPublicationId) || publications[0] || null;

  const slides = selectedPublication?.slides || [];
  const currentSlide = slides[activeSlideIndex] || slides[0] || null;

  const handleNextSlide = () => {
    if (activeSlideIndex < slides.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    await onQuickGenerate(quickPrompt);
    setQuickPrompt('');
    setShowNewModal(false);
    setActiveSlideIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Título & Selector de Publicaciones */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            Estudio Visual de Carruseles & Copywriting
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              {publications.length} {publications.length === 1 ? 'publicación' : 'publicaciones'}
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Genera, afina diapositivas con IA y exporta copys para tus redes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de Publicación Activa */}
          {publications.length > 0 && (
            <select
              value={selectedPublication?.id || ''}
              onChange={(e) => {
                onSelectPublication(e.target.value);
                setActiveSlideIndex(0);
              }}
              className="text-xs font-medium px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-indigo-500 max-w-xs truncate"
            >
              {publications.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.status})
                </option>
              ))}
            </select>
          )}

          {selectedPublication && (
            <button
              onClick={() => setShowSlackModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 hover:border-purple-700 text-purple-300 text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
              title="Notificar carrusel a Slack para revisión"
            >
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Notificar en Slack</span>
            </button>
          )}

          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Generar desde Idea</span>
          </button>
        </div>
      </div>

      {/* Modal de Generación Rápida desde Idea */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Generar Carrusel desde una Idea
            </h3>
            <p className="text-xs text-zinc-400">
              Escribe brevemente qué hito técnico o aprendizaje quieres comunicar y la IA estructurará el carrusel y los copys.
            </p>
            <form onSubmit={handleQuickSubmit} className="space-y-4">
              <textarea
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder='Ej: "Hoy migramos nuestra base de datos sin downtime usando replicación lógica en PostgreSQL y aprendimos 3 lecciones clave"'
                rows={4}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generando...' : 'Generar Carrusel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Estado si no hay publicaciones creadas */}
      {!selectedPublication ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-zinc-200">No hay carruseles creados todavía</h3>
            <p className="text-xs text-zinc-400">
              Ve al <strong>Banco de Contenido</strong> para seleccionar notas y fotos crudas, o genera un carrusel inmediatamente desde una idea técnica libre.
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generar Primer Carrusel</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tira de Navegación de Miniaturas */}
          <SlideThumbnails
            slides={slides}
            activeSlideIndex={activeSlideIndex}
            onSelectSlide={(idx) => setActiveSlideIndex(idx)}
          />

          {/* Grid Principal: Canvas (Izquierda) + CopyWriter (Derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Lienzo de Slide */}
            <div className="lg:col-span-7 flex flex-col items-center bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8">
              {currentSlide && (
                <SlideCanvas
                  slide={currentSlide}
                  totalSlides={slides.length}
                  brand={brand}
                  onUpdateSlide={(slideId, data) =>
                    onUpdateSlide(selectedPublication.id, slideId, data)
                  }
                  onRegenerateImage={(slideId) =>
                    onRegenerateSlideImage(selectedPublication.id, slideId)
                  }
                  onNextSlide={handleNextSlide}
                  onPrevSlide={handlePrevSlide}
                  hasNext={activeSlideIndex < slides.length - 1}
                  hasPrev={activeSlideIndex > 0}
                />
              )}
            </div>

            {/* Columna Derecha: Panel de Copys Multicanal */}
            <div className="lg:col-span-5 h-[620px]">
              <CopyWriterPanel
                publication={selectedPublication}
                onUpdateCopy={(copyId, data) =>
                  onUpdateCopy(selectedPublication.id, copyId, data)
                }
                onUpdateStatus={(status) =>
                  onUpdateStatus(selectedPublication.id, status)
                }
                onPublish={() => onPublishPublication(selectedPublication.id)}
                onSchedule={async (date) => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Notificar a Slack */}
      {showSlackModal && selectedPublication && (
        <ShareToSlackModal
          isOpen={showSlackModal}
          onClose={() => setShowSlackModal(false)}
          currentMember={currentMember || null}
          initialData={{
            eventType: 'PUBLICATION_READY',
            title: `🎨 Carrusel: ${selectedPublication.title}`,
            detail: `Contenido listo para revisión en Atom Social Studio.\n• Total de slides: ${slides.length}\n• Estado actual: ${selectedPublication.status}\n\n¿Le damos el visto bueno para publicación?`,
            preferredChannel: 'comunicacion',
          }}
        />
      )}
    </div>
  );
};
