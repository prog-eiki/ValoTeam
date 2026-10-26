import React, { useState } from 'react';
import { Check, Copy, Download, Edit3, Plus, Trash2, X } from 'lucide-react';
import { getAgentById, getMapById } from '../data/valorantData';
import { Lineup, Player } from '../types/lineup';

interface SavedLineupsSectionProps {
  lineups: Lineup[];
  activeLineupId: string;
  players: Player[];
  onLoadLineup: (lineup: Lineup) => void;
  onDuplicateLineup: (lineup: Lineup) => void;
  onRenameLineup: (id: string, newName: string) => void;
  onDeleteLineup: (id: string) => void;
  onExportLineup: (lineup: Lineup) => void;
  onCreateNewLineup: () => void;
}

export const SavedLineupsSection: React.FC<SavedLineupsSectionProps> = ({
  lineups,
  activeLineupId,
  players,
  onLoadLineup,
  onDuplicateLineup,
  onRenameLineup,
  onDeleteLineup,
  onExportLineup,
  onCreateNewLineup,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const startRename = (lineup: Lineup, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(lineup.id);
    setRenameValue(lineup.name);
  };

  const submitRename = (id: string, e: React.FormEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (renameValue.trim()) {
      onRenameLineup(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#878C8F]">
          Meine Lineups ({lineups.length})
        </h2>

        <button
          onClick={onCreateNewLineup}
          className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#9E141B] text-xs font-semibold text-white flex items-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Neues Lineup</span>
        </button>
      </div>

      {lineups.length === 0 ? (
        <div className="rounded-2xl bg-[#0E1015] border border-white/10 p-8 text-center">
          <p className="text-[#878C8F] text-sm">Noch keine gespeicherten Lineups vorhanden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {lineups.map((item) => {
            const map = getMapById(item.mapId);
            const isActive = item.id === activeLineupId;
            const isRenaming = renamingId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onLoadLineup(item)}
                className={`group rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isActive
                    ? 'bg-[#13161E] border-[#C8A273]/70'
                    : 'bg-[#0E1015] border-white/10 hover:border-white/25'
                }`}
              >
                {/* Header Row: Name + Map Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {isRenaming ? (
                      <form
                        onSubmit={(e) => submitRename(item.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5"
                      >
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="flex-1 px-2.5 py-1 rounded bg-black border border-[#C8A273] text-sm font-bold text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="p-1 rounded bg-emerald-600 text-white"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenamingId(null);
                          }}
                          className="p-1 rounded bg-white/10 text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <h3 className="text-lg font-display font-bold uppercase tracking-wide text-white truncate">
                        {item.name}
                      </h3>
                    )}
                    <span className="text-xs text-[#C8A273] uppercase font-medium">
                      {map?.name || item.mapId}
                    </span>
                  </div>

                  {isActive && (
                    <span className="px-2 py-0.5 rounded bg-[#9E141B]/30 border border-[#9E141B] text-[10px] font-semibold uppercase text-white shrink-0">
                      Aktiv
                    </span>
                  )}
                </div>

                {/* 5 Compact Agent Avatars */}
                <div className="grid grid-cols-5 gap-1.5">
                  {item.slots.slice(0, 5).map((slot, idx) => {
                    const agent = getAgentById(slot.agentId);
                    const player = players.find((p) => p.id === slot.playerId);
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-lg bg-[#161922] border border-white/10 overflow-hidden flex items-center justify-center">
                          {agent ? (
                            <img
                              src={agent.displayIcon}
                              alt={agent.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-[#878C8F]">—</span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#ECE8E1] truncate w-full text-center mt-1">
                          {player ? player.name : 'Offen'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Minimal Action Bar */}
                <div
                  className="flex items-center justify-between pt-2 border-t border-white/5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] text-[#878C8F]">
                    {new Date(item.updatedAt).toLocaleDateString('de-DE')}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onExportLineup(item)}
                      className="p-1.5 rounded-lg text-[#C8A273] hover:bg-[#C8A273]/15 transition"
                      title="PNG herunterladen"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => startRename(item, e)}
                      className="p-1.5 rounded-lg text-[#878C8F] hover:text-white hover:bg-white/5 transition"
                      title="Umbenennen"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateLineup(item)}
                      className="p-1.5 rounded-lg text-[#878C8F] hover:text-white hover:bg-white/5 transition"
                      title="Duplizieren"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteLineup(item.id)}
                      className="p-1.5 rounded-lg text-[#878C8F] hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-[#878C8F]/70 text-center pt-2">
        Gespeicherte Lineups werden lokal in diesem Browser (LocalStorage) gesichert und nicht automatisch zwischen Geräten synchronisiert.
      </p>
    </section>
  );
};
