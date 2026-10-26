import rawAssets from './raw_assets.json';
import { AgentInfo, AgentRole, MapInfo, Player } from '../types/lineup';

export const TEAM_INFO = {
  name: 'BigBlackTea',
  shortName: 'BBT',
  motto: 'Create your lineup. Own the map.',
  logoUrl: '/bbt-logo.png',
  bannerUrl: '/bbt-original.png',
};

export const AGENT_ROLES: { id: AgentRole; label: string; description: string; color: string }[] = [
  {
    id: 'Duelist',
    label: 'Duelist',
    description: 'Entry & First Contact',
    color: '#FF4655',
  },
  {
    id: 'Initiator',
    label: 'Initiator',
    description: 'Info & Winkel-Clear',
    color: '#73FBD3',
  },
  {
    id: 'Controller',
    label: 'Controller',
    description: 'Smokes & Map-Control',
    color: '#C8A273',
  },
  {
    id: 'Sentinel',
    label: 'Sentinel',
    description: 'Anchor & Flank-Watch',
    color: '#60A5FA',
  },
];

export const VALORANT_AGENTS: AgentInfo[] = (rawAssets.agents as AgentInfo[]).map((agent) => ({
  ...agent,
  displayIcon: agent.displayIcon,
  fullPortrait: agent.fullPortrait || agent.displayIcon,
  bustPortrait: agent.bustPortrait || agent.fullPortrait || agent.displayIcon,
  roleIcon: agent.roleIcon,
}));

export const VALORANT_MAPS: MapInfo[] = (rawAssets.maps as MapInfo[]).map((map) => ({
  ...map,
  splash: map.splash,
  listViewIcon: map.listViewIcon,
}));

export const DEFAULT_PLAYERS: Player[] = [
  { id: 'p-lunar', name: 'Lunar', tag: '#7822', isDefault: true },
  { id: 'p-kuronami', name: 'Kuronami 雨雲', tag: '#RED', isDefault: true },
  { id: 'p-fydi', name: 'fydi', tag: '#9522', isDefault: true },
  { id: 'p-xjoshhd', name: 'XJoshHD', tag: '#9317', isDefault: true },
  { id: 'p-xxsensenmanx', name: 'XxSensenmanX', tag: '#7267', isDefault: true },
  { id: 'p-shadowlina', name: 'ShadowLina', tag: '#6700', isDefault: true },
];

export function getAgentById(id: string | null | undefined): AgentInfo | undefined {
  if (!id) return undefined;
  return VALORANT_AGENTS.find((a) => a.id === id || a.name.toLowerCase() === id.toLowerCase());
}

export function getMapById(id: string | null | undefined): MapInfo | undefined {
  if (!id) return undefined;
  return VALORANT_MAPS.find((m) => m.id === id || m.name.toLowerCase() === id.toLowerCase());
}
