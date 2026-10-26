import React, { useMemo, useState } from 'react';
import { Check, Search, ShieldAlert, Sparkles, X } from 'lucide-react';
import { AGENT_ROLES, VALORANT_AGENTS } from '../data/valorantData';
import { AgentInfo, AgentRole } from '../types/lineup';

interface AgentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgentId: string | null;
  usedAgentIds: string[];
  allowDuplicateAgents: boolean;
  onToggleAllowDuplicates: (allow: boolean) => void;
  onSelectAgent: (agentId: string) => void;
  slotLabel: string;
  playerName?: string;
}

export const AgentPickerModal: React.FC<AgentPickerModalProps> = ({
  isOpen,
  onClose,
  selectedAgentId,
  usedAgentIds,
  allowDuplicateAgents,
  onToggleAllowDuplicates,
  onSelectAgent,
  slotLabel,
  playerName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<AgentRole | 'ALL'>('ALL');

  const filteredAgents = useMemo(() => {
    return VALORANT_AGENTS.filter((agent) => {
      const matchesRole = selectedRole === 'ALL' || agent.role === selectedRole;
      const matchesSearch =
        !searchQuery.trim() ||
        agent.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [searchQuery, selectedRole]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0F1115] border border-[#9E141B]/40 shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#9E141B] via-[#C8A273] to-[#9E141B]" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-white/10 bg-[#14171D]/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C8A273]">
              <Sparkles className="w-3.5 h-3.5 text-[#9E141B]" />
              <span>{slotLabel}</span>
              {playerName && (
                <>
                  <span>•</span>
                  <span className="text-white font-semibold">{playerName}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-wide text-white mt-0.5">
              VALORANT Agent auswählen
            </h2>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <label className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:border-[#C8A273]/40 transition">
              <input
                type="checkbox"
                checked={allowDuplicateAgents}
                onChange={(e) => onToggleAllowDuplicates(e.target.checked)}
                className="w-4 h-4 rounded accent-[#9E141B]"
              />
              <span className="text-xs font-medium text-[#ECE8E1]">
                Doppelte Agents erlauben
              </span>
            </label>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-[#9E141B] text-[#878C8F] hover:text-white transition"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Role Filters */}
        <div className="px-6 py-4 bg-[#0B0D10] border-b border-white/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#878C8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Agent suchen (z. B. Jett, Omen, Sova)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#14171D] border border-white/10 text-sm text-white placeholder-[#878C8F] focus:outline-none focus:border-[#C8A273]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#878C8F] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedRole('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                selectedRole === 'ALL'
                  ? 'bg-[#9E141B] text-white shadow-[0_0_16px_rgba(158,20,27,0.5)]'
                  : 'bg-[#14171D] text-[#878C8F] hover:text-white border border-white/5'
              }`}
            >
              Alle ({VALORANT_AGENTS.length})
            </button>

            {AGENT_ROLES.map((role) => {
              const isActive = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#C8A273] text-[#07080A] shadow-[0_0_16px_rgba(200,162,115,0.35)]'
                      : 'bg-[#14171D] text-[#ECE8E1]/80 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Agent Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredAgents.map((agent: AgentInfo) => {
            const isSelected = selectedAgentId === agent.id;
            const isTakenByOther =
              !isSelected && !allowDuplicateAgents && usedAgentIds.includes(agent.id);

            return (
              <button
                key={agent.id}
                disabled={isTakenByOther}
                onClick={() => {
                  onSelectAgent(agent.id);
                  onClose();
                }}
                className={`group relative flex flex-col rounded-2xl overflow-hidden border text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-[#C8A273] bg-gradient-to-b from-[#9E141B]/40 to-[#14171D] ring-2 ring-[#C8A273]/50 scale-[1.01]'
                    : isTakenByOther
                    ? 'border-white/5 bg-[#0D0F13] opacity-40 cursor-not-allowed'
                    : 'border-white/10 bg-[#14171D] hover:border-[#9E141B] hover:bg-[#191D26] hover:-translate-y-0.5'
                }`}
              >
                {/* Top Role Tag */}
                <div className="flex items-center justify-between px-3 pt-2.5 z-10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C8A273] bg-black/50 px-2 py-0.5 rounded-md border border-white/10">
                    {agent.role}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#C8A273] text-black flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                  {isTakenByOther && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/70 text-[#878C8F] flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-[#9E141B]" />
                      Vergeben
                    </span>
                  )}
                </div>

                {/* Portrait Image */}
                <div className="relative h-36 w-full flex items-center justify-center overflow-hidden mt-1">
                  <div className="absolute inset-0 bg-radial from-[#9E141B]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={agent.displayIcon || agent.fullPortrait}
                    alt={agent.name}
                    className="h-28 w-28 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Bottom Name Bar */}
                <div className="px-3.5 py-2.5 bg-black/60 border-t border-white/5 flex items-center justify-between">
                  <span className="font-display font-bold uppercase tracking-wider text-base text-white group-hover:text-[#C8A273] transition-colors">
                    {agent.name}
                  </span>
                  {agent.roleIcon && (
                    <img
                      src={agent.roleIcon}
                      alt={agent.role}
                      className="w-4 h-4 opacity-60 group-hover:opacity-100"
                    />
                  )}
                </div>
              </button>
            );
          })}

          {filteredAgents.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#878C8F]">
              Keine Agents für „{searchQuery}“ gefunden.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
