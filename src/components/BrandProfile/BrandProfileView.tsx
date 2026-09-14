'use client';

import React, { useState } from 'react';
import { BrandProfile } from '@/lib/types';
import { Palette, Type, MessageSquare, Target, Sparkles, Check, Bookmark } from 'lucide-react';

interface BrandProfileViewProps {
  brand: BrandProfile | null;
  onUpdateBrand: (data: Partial<BrandProfile>) => Promise<void>;
}

export const BrandProfileView: React.FC<BrandProfileViewProps> = ({
  brand,
  onUpdateBrand,
}) => {
  const [name, setName] = useState(brand?.name || 'Mi Empresa de Software');
  const [primaryColor, setPrimaryColor] = useState(brand?.primaryColor || '#6366f1');
  const [secondaryColor, setSecondaryColor] = useState(brand?.secondaryColor || '#0f172a');
  const [accentColor, setAccentColor] = useState(brand?.accentColor || '#10b981');
  const [toneVoice, setToneVoice] = useState(
    brand?.toneVoice ||
      'Técnico pero cercano, transparente, enfocado en aprendizajes de ingeniería y buenas prácticas.',
  );
  const [targetAudience, setTargetAudience] = useState(
    brand?.targetAudience || 'CTOs, Tech Leads, desarrolladores senior y fundadores de tecnología.',
  );
  const [visualStyle, setVisualStyle] = useState(
    brand?.visualStyle ||
      'Moderno, minimalista, modo oscuro elegante con acentos limpios, capturas de código nítidas y diagramas arquitectónicos.',
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onUpdateBrand({
        name,
        primaryColor,
        secondaryColor,
        accentColor,
        toneVoice,
        targetAudience,
        visualStyle,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-400" />
          Perfil de Marca & Consistencia Visual
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Configura la identidad de tu empresa para que la IA genere copys, carruseles e imágenes 100% alineados a tu estilo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre de la Empresa */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Nombre de la Empresa / Proyecto
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 font-semibold"
            required
          />
        </div>

        {/* Paleta de Colores */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Paleta de Colores de Marca
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Utilizada para renderizar los slides y alimentar los prompts de IA de imágenes.
              </p>
            </div>

            {/* Vista previa de paleta combinada */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: primaryColor }} />
              <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: secondaryColor }} />
              <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: accentColor }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Color Primario */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400">Color Primario</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 font-mono"
                />
              </div>
            </div>

            {/* Color Secundario (Fondos) */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400">Fondo / Secundario</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 font-mono"
                />
              </div>
            </div>

            {/* Color de Acento (Métricas / CTAs) */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400">Acento (Métricas)</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tono de Voz & Audiencia */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Tono de Voz y Audiencia Objetivo
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Tono de Voz</label>
              <textarea
                value={toneVoice}
                onChange={(e) => setToneVoice(e.target.value)}
                rows={2}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Audiencia Objetivo</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Estilo Visual para Imágenes de IA</label>
              <textarea
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                rows={2}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" />
              ¡Perfil de marca actualizado!
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando...' : 'Guardar Cambios de Marca'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
