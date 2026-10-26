import { DEFAULT_PLAYERS } from '../data/valorantData';
import { Lineup, Player } from '../types/lineup';

const PLAYERS_STORAGE_KEY = 'bbt_lineup_builder_players_v1';
const LINEUPS_STORAGE_KEY = 'bbt_lineup_builder_lineups_v1';
const SEEDED_STORAGE_KEY = 'bbt_lineup_builder_seeded_v1';

export function loadPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(PLAYERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(DEFAULT_PLAYERS));
      return DEFAULT_PLAYERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PLAYERS;
  } catch (err) {
    console.error('Failed to load players from localStorage:', err);
    return DEFAULT_PLAYERS;
  }
}

export function savePlayers(players: Player[]): void {
  try {
    localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
  } catch (err) {
    console.error('Failed to save players to localStorage:', err);
  }
}

export function createDefaultLineup(mapId = 'ascent', players: Player[] = DEFAULT_PLAYERS): Lineup {
  const now = new Date().toISOString();
  const mapName = mapId.charAt(0).toUpperCase() + mapId.slice(1);
  return {
    id: `lineup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `${mapName} Main`,
    mapId,
    slots: [
      { slotIndex: 0, playerId: players[0]?.id || null, agentId: 'jett' },
      { slotIndex: 1, playerId: players[1]?.id || null, agentId: 'sova' },
      { slotIndex: 2, playerId: players[2]?.id || null, agentId: 'omen' },
      { slotIndex: 3, playerId: players[3]?.id || null, agentId: 'kayo' },
      { slotIndex: 4, playerId: players[4]?.id || null, agentId: 'killjoy' },
    ],
    substitute: {
      playerId: players[5]?.id || null,
      agentId: 'cypher',
    },
    allowDuplicateAgents: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function loadLineups(): Lineup[] {
  try {
    const raw = localStorage.getItem(LINEUPS_STORAGE_KEY);
    if (!raw) {
      const seeded = localStorage.getItem(SEEDED_STORAGE_KEY);
      if (!seeded) {
        const players = loadPlayers();
        const initialLineups: Lineup[] = [
          createDefaultLineup('ascent', players),
          {
            id: 'lineup-seed-lotus',
            name: 'Lotus Aggro Comp',
            mapId: 'lotus',
            slots: [
              { slotIndex: 0, playerId: players[0]?.id || null, agentId: 'raze' },
              { slotIndex: 1, playerId: players[1]?.id || null, agentId: 'fade' },
              { slotIndex: 2, playerId: players[2]?.id || null, agentId: 'omen' },
              { slotIndex: 3, playerId: players[3]?.id || null, agentId: 'viper' },
              { slotIndex: 4, playerId: players[4]?.id || null, agentId: 'killjoy' },
            ],
            substitute: {
              playerId: players[5]?.id || null,
              agentId: 'gekko',
            },
            allowDuplicateAgents: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ];
        localStorage.setItem(LINEUPS_STORAGE_KEY, JSON.stringify(initialLineups));
        localStorage.setItem(SEEDED_STORAGE_KEY, 'true');
        return initialLineups;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load lineups from localStorage:', err);
    return [];
  }
}

export function saveLineups(lineups: Lineup[]): void {
  try {
    localStorage.setItem(LINEUPS_STORAGE_KEY, JSON.stringify(lineups));
  } catch (err) {
    console.error('Failed to save lineups to localStorage:', err);
  }
}
