/**
 * Constants and initial data for the Pandemic Game
 */
import { Role, GameState, GameSettings, DiseaseColor } from '../types';

// Player roles with their abilities
export const PLAYER_ROLES: Role[] = [
  { 
    name: 'Medic', 
    color: 'orange', 
    ability: 'Automatically removes all cubes of one color when treating a disease'
  },
  { 
    name: 'Scientist', 
    color: 'white', 
    ability: 'Only needs 4 cards to discover a cure' 
  },
  { 
    name: 'Researcher', 
    color: 'brown', 
    ability: 'Can share knowledge more easily' 
  },
  { 
    name: 'Operations Expert', 
    color: 'green', 
    ability: 'Can build research stations without city cards' 
  },
  { 
    name: 'Dispatcher', 
    color: 'pink', 
    ability: 'Can move other players' 
  },
  { 
    name: 'Contingency Planner', 
    color: 'lightblue', 
    ability: 'Can reuse event cards' 
  },
  { 
    name: 'Quarantine Specialist', 
    color: 'darkgreen', 
    ability: 'Prevents outbreaks in their location and adjacent cities' 
  },
];

// Initial game state
export const INITIAL_GAME_STATE: GameState = {
  gameId: '',
  started: false,
  players: [],
  currentPlayerIndex: 0,
  diseases: {
    red: { cured: false, eradicated: false, cubes: 24 },
    blue: { cured: false, eradicated: false, cubes: 24 },
    yellow: { cured: false, eradicated: false, cubes: 24 },
    black: { cured: false, eradicated: false, cubes: 24 }
  },
  infectionRate: 2,
  infectionRateTrack: [2, 2, 2, 3, 3, 4, 4],
  infectionRateIndex: 0,
  outbreaks: 0,
  researchStations: ['Atlanta'],
  gameOver: false,
  gameWon: false,
};

// Game settings
export const GAME_SETTINGS: GameSettings = {
  MAX_PLAYERS: 4,
  ACTIONS_PER_TURN: 4,
  STARTING_LOCATION: 'Atlanta',
  MAX_OUTBREAKS: 8,
  CARDS_FOR_CURE: 5,
  SCIENTIST_CARDS_FOR_CURE: 4,
  MAX_HAND_SIZE: 7
};

// Color utilities
export function getColorClass(color: DiseaseColor | string): string {
  switch (color) {
    case 'red': return 'bg-red-500';
    case 'blue': return 'bg-blue-500';
    case 'yellow': return 'bg-yellow-500';
    case 'black': return 'bg-gray-800';
    default: return '';
  }
}

export function getTextColorClass(color: DiseaseColor | string): string {
  switch (color) {
    case 'red': return 'text-red-500';
    case 'blue': return 'text-blue-500';
    case 'yellow': return 'text-yellow-500';
    case 'black': return 'text-gray-800';
    default: return '';
  }
}

// Mock WebSocket for development
export const createMockWebSocket = () => ({
  send: function(message: string) { 
    console.log('Sending message:', message);
  },
  close: function() {
    console.log('WebSocket closed');
  }
});
