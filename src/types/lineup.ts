export type AgentRole = 'Duelist' | 'Initiator' | 'Controller' | 'Sentinel';

export interface AgentInfo {
  id: string;
  name: string;
  role: AgentRole;
  roleIcon: string;
  displayIcon: string;
  fullPortrait: string;
  bustPortrait: string;
  background: string;
  colors: string[];
  localIcon?: string;
  localPortrait?: string;
  localRoleIcon?: string;
}

export interface MapInfo {
  id: string;
  name: string;
  coordinates: string;
  sites: string;
  splash: string;
  stylizedBackground: string;
  listViewIcon: string;
  localSplash?: string;
  localList?: string;
}

export interface Player {
  id: string;
  name: string;
  tag: string;
  isDefault?: boolean;
}

export interface LineupSlot {
  slotIndex: number; // 0 to 4 for active players
  playerId: string | null;
  agentId: string | null;
}

export interface SubstituteSlot {
  playerId: string | null;
  agentId: string | null;
}

export interface Lineup {
  id: string;
  name: string;
  mapId: string;
  slots: LineupSlot[]; // Always 5 slots
  substitute?: SubstituteSlot;
  allowDuplicateAgents?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExportLayout = 'landscape' | 'portrait';
