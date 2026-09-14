'use client';

import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Smartphone,
  Square as SquareIcon,
  Edit3,
  Layers,
  Check,
} from 'lucide-react';
import { Slide, BrandProfile } from '@/lib/types';
import { toPng } from 'html-to-image';

interface SlideCanvasProps {
  slide: Slide;
  totalSlides: number;
  brand: BrandProfile | null;
  onUpdateSlide: (slideId: string, data: Partial<Slide>) => Promise<void>;
  onRegenerateImage: (slideId: string) => Promise<void>;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  totalSlides,
  brand,
  onUpdateSlide,
  onRegenerateImage,
  onNextSlide,
  onPrevSlide,
  hasNext,
  hasPrev,
}) => {
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1'>('4:5');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Estados locales editables
  const [headerText, setHeaderText] = useState(slide.headerText);
  const [bodyText, setBodyText] = useState(slide.bodyText);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Sincronizar cuando cambia de slide
  React.useEffect(() => {
    setHeaderText(slide.headerText);
    setBodyText(slide.bodyText);
    setIsEditing(false);
  }, [slide.id, slide.headerText, slide.bodyText]);

  const handleSaveTextChanges = async () => {
    try {
      await onUpdateSlide(slide.id, {
        headerText,
        bodyText,
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      await onRegenerateImage(slide.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!canvasRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `slide_${slide.orderIndex}_${slide.slideType.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exportando slide:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const primaryColor = brand?.primaryColor || '#6366f1';
  const secondaryColor = brand?.secondaryColor || '#0f172a';
  const accentColor = brand?.accentColor || '#10b981';

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Barra de herramientas superior del Canvas */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-lg gap-2 text-xs text-zinc-300">
        {/* Selector de relación de aspecto */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setAspectRatio('4:5')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              aspectRatio === '4:5'
                ? 'bg-zinc-800 text-white font-medium shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>4:5 (Instagram)</span>
          </button>
          <button
            onClick={() => setAspectRatio('1:1')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              aspectRatio === '1:1'
                ? 'bg-zinc-800 text-white font-medium shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SquareIcon className="w-3.5 h-3.5" />
            <span>1:1 (LinkedIn)</span>
          </button>
        </div>

        {/* Acciones de Edición & Exportación */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-colors ${
              isEditing
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-medium'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Ocultar Edición' : 'Editar Texto'}</span>
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 text-xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exportando...' : 'Descargar PNG'}</span>
          </button>
        </div>
      </div>

      {/* Editor Inline si está activado */}
      {isEditing && (
        <div className="w-full max-w-lg p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 text-xs animate-in fade-in">
          <div>
            <label className="text-[11px] font-semibold text-zinc-400">Titular de la Slide:</label>
            <input
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-zinc-400">Cuerpo del texto:</label>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={2}
              className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-500">
              Tipo: <strong className="text-zinc-300">{slide.slideType}</strong>
            </span>
            <button
              onClick={handleSaveTextChanges}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saveSuccess ? 'Guardado' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>
      )}

      {/* CANVAS PRINCIPAL DE LA SLIDE */}
      <div className="relative group">
        <div
          ref={canvasRef}
          style={{
            background: `radial-gradient(circle at top right, ${primaryColor}22, #07090e 70%)`,
          }}
          className={`relative overflow-hidden rounded-3xl border border-zinc-800 shadow-2xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-8 select-none ${
            aspectRatio === '4:5'
              ? 'w-[340px] sm:w-[390px] h-[425px] sm:h-[488px]'
              : 'w-[340px] sm:w-[390px] h-[340px] sm:h-[390px]'
          }`}
        >
          {/* Fondo sutil con grid tecnológico */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Cabecera de la Slide */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {brand?.name ? brand.name.slice(0, 2).toUpperCase() : 'VL'}
              </div>
              <span className="text-xs font-bold text-zinc-200 tracking-wide">
                {brand?.name || 'Dev Team'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 bg-zinc-900/60 px-2.5 py-0.5 rounded-full border border-zinc-800">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>
                {slide.orderIndex.toString().padStart(2, '0')} / {totalSlides.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Contenido Central: Titular + Imagen / Visual + Texto */}
          <div className="relative z-10 flex-1 flex flex-col justify-center space-y-3.5 my-2">
            {/* Titular */}
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
              {headerText}
            </h3>

            {/* Visual (Imagen cruda o Arte IA) */}
            {slide.imageUrl && (
              <div className="w-full max-h-40 sm:max-h-44 rounded-2xl overflow-hidden border border-zinc-700/60 bg-zinc-950/80 shadow-md relative group/img">
                <img
                  src={slide.imageUrl}
                  alt={slide.headerText}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            {/* Texto del Slide */}
            <p className="text-xs sm:text-[13px] text-zinc-300 font-normal leading-relaxed">
              {bodyText}
            </p>
          </div>

          {/* Pie de Slide: Indicador de Swipe y Tono */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              {slide.slideType}
            </span>

            <div className="flex items-center gap-1 text-zinc-400 font-medium">
              <span>Desliza</span>
              <ChevronRight className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Botón Flotante para Regenerar Arte IA */}
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          title="Regenerar visual de IA para esta diapositiva"
          className="absolute top-3 right-3 p-2 rounded-xl bg-zinc-900/90 hover:bg-indigo-600 text-zinc-300 hover:text-white border border-zinc-700/80 shadow-lg backdrop-blur-xs transition-all duration-200 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Navegación entre diapositivas */}
      <div className="flex items-center justify-between w-full max-w-lg pt-1">
        <button
          onClick={onPrevSlide}
          disabled={!hasPrev}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <span className="text-xs text-zinc-400 font-medium">
          Slide {slide.orderIndex} de {totalSlides}
        </span>

        <button
          onClick={onNextSlide}
          disabled={!hasNext}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <span>Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
