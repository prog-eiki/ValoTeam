import React, { useEffect, useState } from 'react';
import { Download, Plus, Users } from 'lucide-react';
import { AgentPickerModal } from './components/AgentPickerModal';
import { ExportModal } from './components/ExportModal';
import { LineupEditorSection } from './components/LineupEditorSection';
import { MapSelectorGrid } from './components/MapSelectorGrid';
import { PlayerManagerModal } from './components/PlayerManagerModal';
import { SavedLineupsSection } from './components/SavedLineupsSection';
import { getMapById, TEAM_INFO } from './data/valorantData';
import { Lineup, Player } from './types/lineup';
import {
  createDefaultLineup,
  loadLineups,
  loadPlayers,
  saveLineups,
  savePlayers,
} from './utils/storage';

export function App() {
  const [players, setPlayers] = useState<Player[]>(() => loadPlayers());
  const [savedLineups, setSavedLineups] = useState<Lineup[]>(() => loadLineups());
  const [currentLineup, setCurrentLineup] = useState<Lineup>(() => {
    const initialLineups = loadLineups();
    if (initialLineups.length > 0) {
      return initialLineups[0];
    }
    return createDefaultLineup('ascent', loadPlayers());
  });

  const [pickerTargetSlot, setPickerTargetSlot] = useState<number | 'sub' | null>(null);
  const [isPlayerManagerOpen, setIsPlayerManagerOpen] = useState(false);
  const [exportTargetLineup, setExportTargetLineup] = useState<Lineup | null>(null);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleUpdatePlayers = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    savePlayers(updatedPlayers);
  };

  useEffect(() => {
    saveLineups(savedLineups);
  }, [savedLineups]);

  const handleUpdateCurrentLineup = (updated: Lineup) => {
    setCurrentLineup(updated);
    setSavedLineups((prev) => {
      const exists = prev.some((l) => l.id === updated.id);
      if (!exists) return prev;
      return prev.map((l) => (l.id === updated.id ? updated : l));
    });
  };

  const handleSaveLineup = () => {
    const now = new Date().toISOString();
    const updated: Lineup = { ...currentLineup, updatedAt: now };
    setCurrentLineup(updated);

    setSavedLineups((prev) => {
      const exists = prev.some((l) => l.id === updated.id);
      if (exists) {
        return prev.map((l) => (l.id === updated.id ? updated : l));
      }
      return [updated, ...prev];
    });

    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleCreateNewLineup = (mapId?: string) => {
    const chosenMap = mapId || currentLineup.mapId || 'ascent';
    const fresh = createDefaultLineup(chosenMap, players);
    setSavedLineups((prev) => [fresh, ...prev]);
    setCurrentLineup(fresh);
  };

  const handleSelectMap = (mapId: string) => {
    const mapObj = getMapById(mapId);
    const oldMapObj = getMapById(currentLineup.mapId);
    let nextName = currentLineup.name;

    if (
      !nextName.trim() ||
      (oldMapObj && nextName.toLowerCase() === `${oldMapObj.name.toLowerCase()} main`)
    ) {
      nextName = `${mapObj?.name || mapId} Main`;
    }

    const updated: Lineup = {
      ...currentLineup,
      mapId,
      name: nextName,
      updatedAt: new Date().toISOString(),
    };
    handleUpdateCurrentLineup(updated);
  };

  const handleSelectAgentForSlot = (agentId: string) => {
    if (pickerTargetSlot === null) return;

    if (pickerTargetSlot === 'sub') {
      handleUpdateCurrentLineup({
        ...currentLineup,
        substitute: {
          playerId: currentLineup.substitute?.playerId || players[5]?.id || null,
          agentId,
        },
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    const updatedSlots = currentLineup.slots.map((slot, idx) =>
      idx === pickerTargetSlot ? { ...slot, agentId } : slot
    );

    handleUpdateCurrentLineup({
      ...currentLineup,
      slots: updatedSlots,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDuplicateLineup = (source: Lineup) => {
    const now = new Date().toISOString();
    const copy: Lineup = {
      ...source,
      id: `lineup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `${source.name} (Kopie)`,
      slots: source.slots.map((s) => ({ ...s })),
      substitute: source.substitute ? { ...source.substitute } : undefined,
      createdAt: now,
      updatedAt: now,
    };
    setSavedLineups((prev) => [copy, ...prev]);
    setCurrentLineup(copy);
  };

  const handleRenameLineup = (id: string, newName: string) => {
    const now = new Date().toISOString();
    setSavedLineups((prev) =>
      prev.map((l) => (l.id === id ? { ...l, name: newName, updatedAt: now } : l))
    );
    if (currentLineup.id === id) {
      setCurrentLineup((prev) => ({ ...prev, name: newName, updatedAt: now }));
    }
  };

  const handleDeleteLineup = (id: string) => {
    setSavedLineups((prev) => {
      const remaining = prev.filter((l) => l.id !== id);
      if (currentLineup.id === id) {
        if (remaining.length > 0) {
          setCurrentLineup(remaining[0]);
        } else {
          const fallback = createDefaultLineup('ascent', players);
          setCurrentLineup(fallback);
          return [fallback];
        }
      }
      return remaining;
    });
  };

  const usedAgentIds = currentLineup.slots
    .map((s) => s.agentId)
    .filter((id): id is string => Boolean(id));

  const activePickerSelectedAgent =
    pickerTargetSlot === 'sub'
      ? currentLineup.substitute?.agentId || null
      : typeof pickerTargetSlot === 'number'
      ? currentLineup.slots[pickerTargetSlot]?.agentId || null
      : null;

  const activePickerPlayerName =
    pickerTargetSlot === 'sub'
      ? players.find((p) => p.id === currentLineup.substitute?.playerId)?.name
      : typeof pickerTargetSlot === 'number'
      ? players.find((p) => p.id === currentLineup.slots[pickerTargetSlot]?.playerId)?.name
      : undefined;

  return (
    <div className="min-h-screen bg-[#07080A] text-[#ECE8E1] flex flex-col">
      {/* Clean Minimalist Header */}
      <header className="border-b border-white/10 bg-[#07080A]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={TEAM_INFO.logoUrl}
              alt="BigBlackTea Logo"
              className="w-11 h-11 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl tracking-wider uppercase text-[#C8A273]">
                  {TEAM_INFO.name}
                </span>
                <span className="text-xs font-mono text-[#878C8F]">({TEAM_INFO.shortName})</span>
                <span className="text-white/20 hidden sm:inline">•</span>
                <h1 className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white hidden sm:inline">
                  VALORANT Lineup Builder
                </h1>
              </div>
              <p className="text-xs text-[#878C8F]">{TEAM_INFO.motto}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPlayerManagerOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#ECE8E1] border border-white/10 flex items-center gap-2 transition"
            >
              <Users className="w-4 h-4 text-[#C8A273]" />
              <span>Spieler ({players.length})</span>
            </button>

            <button
              onClick={() => handleCreateNewLineup()}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white border border-white/10 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4 text-[#C8A273]" />
              <span>Neues Lineup</span>
            </button>

            <button
              onClick={() => setExportTargetLineup(currentLineup)}
              className="px-4 py-2 rounded-xl bg-[#9E141B] hover:bg-[#B81720] text-white font-display font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PNG herunterladen</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Generous Breathing Room */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* 1. Compact Map Strip */}
        <MapSelectorGrid
          selectedMapId={currentLineup.mapId}
          onSelectMap={handleSelectMap}
        />

        {/* 2. Central 5-Card Lineup Editor */}
        <LineupEditorSection
          lineup={currentLineup}
          players={players}
          onChangeLineup={handleUpdateCurrentLineup}
          onSaveLineup={handleSaveLineup}
          onOpenExportModal={() => setExportTargetLineup(currentLineup)}
          onOpenAgentPicker={(slotIdx) => setPickerTargetSlot(slotIdx)}
          saveFeedback={saveFeedback}
        />

        {/* 3. Clean Saved Lineups List */}
        <SavedLineupsSection
          lineups={savedLineups}
          activeLineupId={currentLineup.id}
          players={players}
          onLoadLineup={(selected) => setCurrentLineup(selected)}
          onDuplicateLineup={handleDuplicateLineup}
          onRenameLineup={handleRenameLineup}
          onDeleteLineup={handleDeleteLineup}
          onExportLineup={(target) => setExportTargetLineup(target)}
          onCreateNewLineup={() => handleCreateNewLineup()}
        />
      </main>

      {/* Modals */}
      <AgentPickerModal
        isOpen={pickerTargetSlot !== null}
        onClose={() => setPickerTargetSlot(null)}
        selectedAgentId={activePickerSelectedAgent}
        usedAgentIds={usedAgentIds}
        allowDuplicateAgents={Boolean(currentLineup.allowDuplicateAgents)}
        onToggleAllowDuplicates={(allow) =>
          handleUpdateCurrentLineup({
            ...currentLineup,
            allowDuplicateAgents: allow,
            updatedAt: new Date().toISOString(),
          })
        }
        onSelectAgent={handleSelectAgentForSlot}
        slotLabel={
          pickerTargetSlot === 'sub'
            ? 'Ersatzspieler'
            : typeof pickerTargetSlot === 'number'
            ? `Slot ${pickerTargetSlot + 1}`
            : ''
        }
        playerName={activePickerPlayerName}
      />

      <PlayerManagerModal
        isOpen={isPlayerManagerOpen}
        onClose={() => setIsPlayerManagerOpen(false)}
        players={players}
        onUpdatePlayers={handleUpdatePlayers}
      />

      {exportTargetLineup && (
        <ExportModal
          isOpen={Boolean(exportTargetLineup)}
          onClose={() => setExportTargetLineup(null)}
          lineup={exportTargetLineup}
          players={players}
        />
      )}
    </div>
  );
}

export default App;
