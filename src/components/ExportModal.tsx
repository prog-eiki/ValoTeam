import React, { useEffect, useState } from 'react';
import { Download, Image as ImageIcon, Loader2, Monitor, Smartphone, Sparkles, X } from 'lucide-react';
import { getMapById } from '../data/valorantData';
import { ExportLayout, Lineup, Player } from '../types/lineup';
import { renderLineupToCanvas, sanitizeFilename } from '../utils/exportCanvas';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineup: Lineup;
  players: Player[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  lineup,
  players,
}) => {
  const [layout, setLayout] = useState<ExportLayout>('landscape');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const mapInfo = getMapById(lineup.mapId);
  const fileName = `BBT_${sanitizeFilename(lineup.name || `${mapInfo?.name || 'Map'}_Main`)}${
    layout === 'portrait' ? '_Portrait' : ''
  }.png`;

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsGenerating(true);

    renderLineupToCanvas(lineup, players, layout)
      .then((dataUrl) => {
        if (!cancelled) {
          setPreviewUrl(dataUrl);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Export rendering failed:', err);
        if (!cancelled) setIsGenerating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, lineup, players, layout]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.download = fileName;
    link.href = previewUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-2xl bg-[#0F1115] border border-[#C8A273]/40 shadow-[0_24px_90px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#9E141B] via-[#C8A273] to-[#9E141B]" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-[#14171D]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C8A273]">
              <Sparkles className="w-3.5 h-3.5 text-[#9E141B]" />
              <span>High-Resolution PNG Generator</span>
            </div>
            <h2 className="text-2xl font-display font-bold uppercase tracking-wide text-white">
              Lineup als PNG herunterladen
            </h2>
          </div>

          {/* Layout Switcher */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex bg-[#090A0D] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setLayout('landscape')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  layout === 'landscape'
                    ? 'bg-[#9E141B] text-white shadow'
                    : 'text-[#878C8F] hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Landscape (1920×1080)</span>
              </button>
              <button
                onClick={() => setLayout('portrait')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  layout === 'portrait'
                    ? 'bg-[#9E141B] text-white shadow'
                    : 'text-[#878C8F] hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Portrait (1080×1350)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-[#9E141B] text-[#878C8F] hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#07080A] flex flex-col items-center justify-center min-h-[340px]">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 py-16 text-[#C8A273]">
              <Loader2 className="w-10 h-10 animate-spin text-[#9E141B]" />
              <span className="font-mono text-sm uppercase tracking-wider">
                Erzeuge hochauflösende E-Sports Grafik...
              </span>
            </div>
          ) : previewUrl ? (
            <div className="w-full flex flex-col items-center">
              <div className="relative rounded-xl overflow-hidden border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] bg-[#0B0D10]">
                <img
                  src={previewUrl}
                  alt="BBT Lineup Export Preview"
                  className={`object-contain ${
                    layout === 'landscape' ? 'max-h-[56vh] w-auto' : 'max-h-[58vh] w-auto'
                  }`}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-[#878C8F]">
                <ImageIcon className="w-3.5 h-3.5 text-[#C8A273]" />
                <span>
                  Vorschau: <strong className="text-white">{fileName}</strong> •{' '}
                  {layout === 'landscape'
                    ? '1920 × 1080 px (Optimal für Discord & Desktop)'
                    : '1080 × 1350 px (Optimal für Social Media)'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-red-400 text-sm">Vorschau konnte nicht geladen werden.</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#14171D] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#878C8F]">
            Exakte Bildkomposition ohne UI-Elemente – bereit zum direkten Teilen auf Discord.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-[#ECE8E1] transition"
            >
              Schließen
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating || !previewUrl}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-[#9E141B] to-[#C91D26] hover:from-[#B5171F] hover:to-[#E0242E] text-white font-display font-bold uppercase tracking-wider text-base flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(158,20,27,0.6)] transition disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>Lineup als PNG herunterladen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
