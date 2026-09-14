'use client';

import React from 'react';
import { Slide } from '@/lib/types';
import { Layers, Image as ImageIcon, Sparkles } from 'lucide-react';

interface SlideThumbnailsProps {
  slides: Slide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
}

export const SlideThumbnails: React.FC<SlideThumbnailsProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
}) => {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto p-2 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 max-w-full">
      {slides.map((slide, idx) => {
        const isActive = idx === activeSlideIndex;
        return (
          <button
            key={slide.id}
            onClick={() => onSelectSlide(idx)}
            className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl border text-left transition-all w-24 sm:w-28 ${
              isActive
                ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900'
            }`}
          >
            {/* Mini preview */}
            <div className="w-full h-14 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden relative mb-1.5 flex items-center justify-center">
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.headerText}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-[10px] text-zinc-500 font-mono">Slide {slide.orderIndex}</div>
              )}
              <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 rounded bg-black/70 text-white">
                #{slide.orderIndex}
              </span>
            </div>

            <div className="w-full text-center">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider truncate block ${
                  isActive ? 'text-indigo-300' : 'text-zinc-400'
                }`}
              >
                {slide.slideType}
              </span>
              <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                {slide.headerText}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
