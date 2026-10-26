import React, { useState } from 'react';
import {
  Check,
  Download,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Shuffle,
  UserCheck,
  X,
} from 'lucide-react';
import { getAgentById, getMapById, VALORANT_AGENTS, VALORANT_MAPS } from '../data/valorantData';
import { Lineup, Player } from '../types/lineup';

interface LineupEditorSectionProps {
  lineup: Lineup;
  players: Player[];
  onChangeLineup: (updated: Lineup) => void;
  onSaveLineup: () => void;
  onOpenExportModal: () => void;
  onOpenAgentPicker: (slotIndex: number | 'sub') => void;
  saveFeedback: boolean;
}

export const LineupEditorSection: React.FC<LineupEditorSectionProps> = ({
  lineup,
  players,
  onChangeLineup,
  onSaveLineup,
  onOpenExportModal,
  onOpenAgentPicker,
  saveFeedback,
}) => {
  const [showSubSlot, setShowSubSlot] = useState<boolean>(
    Boolean(lineup.substitute?.playerId || lineup.substitute?.agentId)
  );

  const currentMap = getMapById(lineup.mapId) || VALORANT_MAPS[0];

  const handleNameChange = (newName: string) => {
    onChangeLineup({
      ...lineup,
      name: newName,
      updatedAt: new Date().toISOString(),
    });
  };

  const handlePlayerChange = (slotIndex: number, newPlayerId: string) => {
    const targetId = newPlayerId || null;
    const updatedSlots = [...lineup.slots];

    const existingSlotIdx = updatedSlots.findIndex(
      (s, idx) => idx !== slotIndex && s.playerId === targetId && targetId !== null
    );

    if (existingSlotIdx !== -1) {
      const previousPlayerId = updatedSlots[slotIndex].playerId;
      updatedSlots[existingSlotIdx] = {
        ...updatedSlots[existingSlotIdx],
        playerId: previousPlayerId,
      };
    }

    updatedSlots[slotIndex] = {
      ...updatedSlots[slotIndex],
      playerId: targetId,
    };

    onChangeLineup({
      ...lineup,
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSubPlayerChange = (newPlayerId: string) => {
    onChangeLineup({
      ...lineup,
      substitute: {
        playerId: newPlayerId || null,
        agentId: lineup.substitute?.agentId || null,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleClearSub = () => {
    setShowSubSlot(false);
    onChangeLineup({
      ...lineup,
      substitute: { playerId: null, agentId: null },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRandomizeAgents = () => {
    const rolesOrder = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
    const used = new Set<string>();
    const newSlots = lineup.slots.map((slot, idx) => {
      const targetRole = rolesOrder[idx] || null;
      const pool = VALORANT_AGENTS.filter(
        (a) => (!targetRole || a.role === targetRole) && !used.has(a.id)
      );
      const fallbackPool = VALORANT_AGENTS.filter((a) => !used.has(a.id));
      const finalPool = pool.length > 0 ? pool : fallbackPool;
      const chosen = finalPool[Math.floor(Math.random() * finalPool.length)];
      if (chosen) used.add(chosen.id);
      return {
        ...slot,
        agentId: chosen ? chosen.id : slot.agentId,
      };
    });

    onChangeLineup({
      ...lineup,
      slots: newSlots,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <section id="lineup-editor" className="space-y-5">
      {/* Clean Minimalist Header Bar with Subtle Map Background */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0D0F13]">
        {currentMap?.splash && (
          <img
            src={currentMap.splash}
            alt={currentMap.name}
            className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080A] via-[#07080A]/85 to-transparent pointer-events-none" />

        <div className="relative z-10 p-5 sm:px-7 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Map Badge + Editable Lineup Name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <span className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#9E141B] text-white text-xs font-display font-bold uppercase tracking-wider">
              {currentMap?.name || lineup.mapId}
            </span>

            <input
              type="text"
              value={lineup.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={`${currentMap?.name || 'Ascent'} Main`}
              aria-label="Lineup Name"
              className="flex-1 max-w-md bg-transparent border-b border-white/15 focus:border-[#C8A273] py-1 text-2xl sm:text-3xl font-display font-bold uppercase tracking-wide text-white focus:outline-none transition"
            />
          </div>

          {/* Right: Streamlined Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRandomizeAgents}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#ECE8E1] border border-white/10 flex items-center gap-2 transition"
              title="Zufällige Agents zuweisen"
            >
              <Shuffle className="w-4 h-4 text-[#C8A273]" />
              <span>Zufall</span>
            </button>

            <button
              onClick={onSaveLineup}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border transition ${
                saveFeedback
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              {saveFeedback ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Gespeichert</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#C8A273]" />
                  <span>Speichern</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenExportModal}
              className="px-5 py-2.5 rounded-xl bg-[#9E141B] hover:bg-[#B81720] text-white font-display font-bold uppercase tracking-wider text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(158,20,27,0.45)] transition"
            >
              <Download className="w-4 h-4" />
              <span>Lineup als PNG herunterladen</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Minimalist Player & Agent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {lineup.slots.slice(0, 5).map((slot, index) => {
          const agent = getAgentById(slot.agentId);

          return (
            <div
              key={slot.slotIndex ?? index}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#0E1015] border border-white/10 hover:border-[#C8A273]/50 transition-all duration-200"
            >
              {/* Agent Portrait (Main Visual Focus) */}
              <div
                onClick={() => onOpenAgentPicker(index)}
                className="relative h-72 w-full flex items-center justify-center overflow-hidden cursor-pointer bg-gradient-to-b from-[#151821] to-[#0E1015]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(158,20,27,0.22)_0%,transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity" />

                {/* Subtle Role Pill Top Right */}
                {agent && (
                  <span className="absolute top-3 right-3 z-20 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-mono uppercase tracking-wider text-[#C8A273] border border-white/10">
                    {agent.role}
                  </span>
                )}

                {agent ? (
                  <img
                    src={agent.fullPortrait || agent.displayIcon}
                    alt={agent.name}
                    className="relative z-10 h-[105%] w-auto object-contain object-top drop-shadow-[0_12px_20px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="relative z-10 flex flex-col items-center gap-2 text-[#878C8F] group-hover:text-white transition">
                    <Shield className="w-10 h-10 opacity-30" />
                    <span className="text-xs uppercase tracking-wider">Agent wählen</span>
                  </div>
                )}

                {/* Hover Hint Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0E1015] via-[#0E1015]/80 to-transparent z-10 pointer-events-none" />
              </div>

              {/* Clean Footer: Agent Name, Player Select directly below, and Change button */}
              <div className="relative z-20 px-4 pb-4 pt-1 flex flex-col gap-3 bg-[#0E1015]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-display font-bold uppercase tracking-wider text-white leading-none">
                      {agent ? agent.name : 'Kein Agent'}
                    </div>
                    <div className="text-[11px] text-[#878C8F] mt-1">
                      {agent ? agent.role : 'Nicht zugewiesen'}
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAgentPicker(index)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#9E141B] text-[11px] font-medium text-[#ECE8E1] hover:text-white flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ändern</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="h-[1px] w-full bg-white/10" />

                {/* Single Clean Player Dropdown (No duplicate text below) */}
                <div>
                  <select
                    value={slot.playerId || ''}
                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                    aria-label={`Spieler Slot ${index + 1}`}
                    className="w-full px-3 py-2 rounded-xl bg-[#151820] hover:bg-[#1B1F2A] border border-white/10 focus:border-[#C8A273] text-sm font-semibold text-white focus:outline-none transition cursor-pointer"
                  >
                    <option value="">Spieler wählen...</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.tag})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Minimalist 6th Player / Substitute Bar */}
      <div>
        {!showSubSlot ? (
          <button
            onClick={() => setShowSubSlot(true)}
            className="text-xs font-medium text-[#878C8F] hover:text-[#C8A273] flex items-center gap-1.5 transition py-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ersatzspieler (6. Spieler) hinzufügen</span>
          </button>
        ) : (
          <div className="rounded-xl bg-[#0E1015] border border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#151820] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                {lineup.substitute?.agentId ? (
                  <img
                    src={getAgentById(lineup.substitute.agentId)?.displayIcon}
                    alt="Sub"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCheck className="w-4 h-4 text-[#C8A273]" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C8A273] block">
                  Ersatzspieler (Sub)
                </span>
                <span className="text-xs text-[#878C8F]">
                  Optionaler 6. Spieler für das Lineup
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={lineup.substitute?.playerId || ''}
                onChange={(e) => handleSubPlayerChange(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#151820] border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-[#C8A273]"
              >
                <option value="">Kein Ersatzspieler</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.tag})
                  </option>
                ))}
              </select>

              <button
                onClick={() => onOpenAgentPicker('sub')}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white border border-white/10 transition"
              >
                {lineup.substitute?.agentId
                  ? `Agent: ${getAgentById(lineup.substitute.agentId)?.name}`
                  : 'Agent wählen'}
              </button>

              <button
                onClick={handleClearSub}
                className="p-2 rounded-lg text-[#878C8F] hover:text-red-400 transition"
                title="Ersatzspieler entfernen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
