// Disease colors
export type DiseaseColor = 'red' | 'blue' | 'yellow' | 'black';

// City infection state
export interface Infections {
  red: number;
  blue: number;
  yellow: number;
  black: number;
}

// City data
export interface City {
  color: DiseaseColor;
  infections: Infections;
  researchStation: boolean;
}

// City positions on the map
export interface CityPosition {
  x: number;
  y: number;
}

// Cities map
export interface Cities {
  [cityName: string]: City;
}

// City positions map
export interface CityPositions {
  [cityName: string]: CityPosition;
}

// City connections (routes)
export type CityConnection = [string, string];

// Player role
export interface Role {
  name: string;
  color: string;
  ability: string;
}

// Player state
export interface Player {
  id: string;
  name: string;
  role: string;
  location: string;
  cards: string[];
  actions: number;
}

// Disease state
export interface Disease {
  cured: boolean;
  eradicated: boolean;
  cubes: number;
}

// Diseases map
export interface Diseases {
  [color: string]: Disease;
}

// Game state
export interface GameState {
  gameId: string;
  started: boolean;
  players: Player[];
  currentPlayerIndex: number;
  diseases: Diseases;
  infectionRate: number;
  infectionRateTrack: number[];
  infectionRateIndex: number;
  outbreaks: number;
  researchStations: string[];
  gameOver: boolean;
  gameWon: boolean;
}

// WebSocket message types
export type MessageType = 
  | 'CREATE_GAME'
  | 'JOIN_GAME'
  | 'START_GAME'
  | 'MOVE_PLAYER'
  | 'TREAT_DISEASE'
  | 'BUILD_RESEARCH_STATION'
  | 'DISCOVER_CURE'
  | 'END_TURN'
  | 'GAME_UPDATE'
  | 'PLAYER_JOINED'
  | 'GAME_STARTED'
  | 'GAME_OVER'
  | 'ERROR';

// WebSocket message
export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  gameId?: string;
  playerId?: string;
  timestamp?: number;
}

// Game settings
export interface GameSettings {
  MAX_PLAYERS: number;
  ACTIONS_PER_TURN: number;
  STARTING_LOCATION: string;
  MAX_OUTBREAKS: number;
  CARDS_FOR_CURE: number;
  SCIENTIST_CARDS_FOR_CURE: number;
  MAX_HAND_SIZE: number;
}
