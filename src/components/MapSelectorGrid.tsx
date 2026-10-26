import React, { useState } from 'react';
import { Check, Map as MapIcon } from 'lucide-react';
import { VALORANT_MAPS } from '../data/valorantData';
import { MapInfo } from '../types/lineup';

interface MapSelectorGridProps {
  selectedMapId: string;
  onSelectMap: (mapId: string) => void;
}

export const MapSelectorGrid: React.FC<MapSelectorGridProps> = ({
  selectedMapId,
  onSelectMap,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#878C8F]">
          Map auswählen
        </h2>
        <span className="text-xs text-[#878C8F]/70">
          Aktiv: <strong className="text-[#C8A273] uppercase">{selectedMapId}</strong>
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {VALORANT_MAPS.map((map: MapInfo) => {
          const isSelected = selectedMapId === map.id;
          const imgFailed = failedImages[map.id] || !map.splash;

          return (
            <button
              key={map.id}
              onClick={() => onSelectMap(map.id)}
              className={`group relative h-20 sm:h-24 rounded-xl overflow-hidden text-left transition-all duration-200 border ${
                isSelected
                  ? 'border-[#C8A273] ring-1 ring-[#C8A273]/50 shadow-[0_0_20px_rgba(158,20,27,0.35)]'
                  : 'border-white/5 hover:border-white/20 opacity-70 hover:opacity-100'
              }`}
            >
              {!imgFailed ? (
                <img
                  src={map.splash}
                  alt={map.name}
                  onError={() => setFailedImages((prev) => ({ ...prev, [map.id]: true }))}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-[#12141A] flex items-center justify-center">
                  <MapIcon className="w-6 h-6 text-[#C8A273]/30" />
                </div>
              )}

              <div
                className={`absolute inset-0 transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-t from-black/90 via-[#9E141B]/25 to-black/20'
                    : 'bg-gradient-to-t from-black/85 via-black/40 to-transparent'
                }`}
              />

              {isSelected && (
                <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[#9E141B] text-white flex items-center justify-center shadow">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div className="absolute bottom-2 inset-x-2.5 z-10 flex items-center justify-between">
                <span
                  className={`font-display font-bold uppercase tracking-wider text-sm sm:text-base leading-none ${
                    isSelected ? 'text-white' : 'text-[#ECE8E1]'
                  }`}
                >
                  {map.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
