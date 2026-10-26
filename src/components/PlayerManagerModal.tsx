import React, { useState } from 'react';
import { Check, Edit2, Plus, RotateCcw, Trash2, Users, X } from 'lucide-react';
import { DEFAULT_PLAYERS } from '../data/valorantData';
import { Player } from '../types/lineup';

interface PlayerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onUpdatePlayers: (players: Player[]) => void;
}

export const PlayerManagerModal: React.FC<PlayerManagerModalProps> = ({
  isOpen,
  onClose,
  players,
  onUpdatePlayers,
}) => {
  const [newName, setNewName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTag, setEditTag] = useState('');

  if (!isOpen) return null;

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    let formattedTag = newTag.trim() || '#BBT';
    if (!formattedTag.startsWith('#')) {
      formattedTag = `#${formattedTag}`;
    }

    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmedName,
      tag: formattedTag,
    };

    onUpdatePlayers([...players, newPlayer]);
    setNewName('');
    setNewTag('');
  };

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setEditTag(player.tag);
  };

  const saveEdit = (id: string) => {
    const trimmedName = editName.trim();
    if (!trimmedName) return;
    let formattedTag = editTag.trim() || '#BBT';
    if (!formattedTag.startsWith('#')) {
      formattedTag = `#${formattedTag}`;
    }

    onUpdatePlayers(
      players.map((p) => (p.id === id ? { ...p, name: trimmedName, tag: formattedTag } : p))
    );
    setEditingId(null);
  };

  const deletePlayer = (id: string) => {
    onUpdatePlayers(players.filter((p) => p.id !== id));
  };

  const resetToDefaultRoster = () => {
    onUpdatePlayers(DEFAULT_PLAYERS);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0F1115] border border-[#C8A273]/30 shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#9E141B] via-[#C8A273] to-[#9E141B]" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#14171D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9E141B]/20 border border-[#9E141B] flex items-center justify-center text-[#C8A273]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#C8A273]">
                BigBlackTea (BBT)
              </span>
              <h2 className="text-2xl font-display font-bold uppercase tracking-wide text-white">
                Team-Kader & Spieler verwalten
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-[#9E141B] text-[#878C8F] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Player Form */}
        <form
          onSubmit={handleAddPlayer}
          className="p-6 bg-[#0B0D10] border-b border-white/10 flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Spielername (z. B. Lunar)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#14171D] border border-white/10 text-sm text-white placeholder-[#878C8F] focus:outline-none focus:border-[#C8A273]"
          />
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Riot-Tag (z. B. #7822)"
            className="w-full sm:w-36 px-4 py-2.5 rounded-xl bg-[#14171D] border border-white/10 text-sm font-mono text-white placeholder-[#878C8F] focus:outline-none focus:border-[#C8A273]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#9E141B] hover:bg-[#C91D26] text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(158,20,27,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>Hinzufügen</span>
          </button>
        </form>

        {/* Players List */}
        <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
          {players.map((player, idx) => {
            const isEditing = editingId === player.id;
            return (
              <div
                key={player.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#14171D] border border-white/10 hover:border-white/20 transition"
              >
                {isEditing ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#090A0D] border border-[#C8A273] text-sm text-white"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editTag}
                      onChange={(e) => setEditTag(e.target.value)}
                      className="w-28 px-3 py-1.5 rounded-lg bg-[#090A0D] border border-[#C8A273] text-sm font-mono text-white"
                    />
                    <button
                      onClick={() => saveEdit(player.id)}
                      className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                      title="Speichern"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 rounded-lg bg-white/5 text-[#878C8F] hover:text-white transition"
                      title="Abbrechen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3.5">
                      <span className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 font-mono text-xs text-[#C8A273] flex items-center justify-center">
                        0{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{player.name}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/50 text-[#C8A273] border border-[#C8A273]/20">
                            {player.tag}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEdit(player)}
                        className="p-2 rounded-lg text-[#878C8F] hover:text-white hover:bg-white/5 transition"
                        title="Spieler bearbeiten"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePlayer(player.id)}
                        className="p-2 rounded-lg text-[#878C8F] hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Spieler entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#14171D] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={resetToDefaultRoster}
            className="text-xs font-medium text-[#878C8F] hover:text-[#C8A273] flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Standardkader (BBT) wiederherstellen</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
