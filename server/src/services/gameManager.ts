import { v4 as uuidv4 } from 'uuid';
import { 
  GameState, 
  Player, 
  Cities, 
  DiseaseColor,
  Diseases,
  City
} from '../types';

// In-memory storage for active games
const activeGames = new Map<string, GameState>();
const gameCities = new Map<string, Cities>();

// Initial disease states
const initialDiseases: Diseases = {
  red: { cured: false, eradicated: false, cubes: 24 },
  blue: { cured: false, eradicated: false, cubes: 24 },
  yellow: { cured: false, eradicated: false, cubes: 24 },
  black: { cured: false, eradicated: false, cubes: 24 }
};

/**
 * Create a new game
 * @param gameId Game ID
 * @param player Host player
 * @returns Game state
 */
export function createGame(gameId: string, player: Player): GameState {
  // Initialize new game state
  const newGame: GameState = {
    gameId,
    started: false,
    players: [player],
    currentPlayerIndex: 0,
    diseases: { ...initialDiseases },
    infectionRate: 2,
    infectionRateTrack: [2, 2, 2, 3, 3, 4, 4],
    infectionRateIndex: 0,
    outbreaks: 0,
    researchStations: ['Atlanta'],
    gameOver: false,
    gameWon: false,
    lastUpdateTime: Date.now()
  };

  // Store game in memory
  activeGames.set(gameId, newGame);
  
  return newGame;
}

/**
 * Get a game by ID
 * @param gameId Game ID
 * @returns Game state or undefined if not found
 */
export function getGame(gameId: string): GameState | undefined {
  return activeGames.get(gameId);
}

/**
 * Add a player to a game
 * @param gameId Game ID
 * @param player Player to add
 * @returns Updated game state or undefined if game not found
 */
export function addPlayer(gameId: string, player: Player): GameState | undefined {
  const game = activeGames.get(gameId);
  
  if (!game) {
    return undefined;
  }
  
  // Check if the game is already full
  if (game.players.length >= 4) {
    throw new Error('Game is full');
  }
  
  // Check if the game has already started
  if (game.started) {
    throw new Error('Game has already started');
  }
  
  // Add player to the game
  game.players.push(player);
  game.lastUpdateTime = Date.now();
  
  // Update game in memory
  activeGames.set(gameId, game);
  
  return game;
}

/**
 * Start a game
 * @param gameId Game ID
 * @param cities Initial city state
 * @returns Updated game state or undefined if game not found
 */
export function startGame(gameId: string, cities: Cities): GameState | undefined {
  const game = activeGames.get(gameId);
  
  if (!game) {
    return undefined;
  }
  
  // Check if there are enough players
  if (game.players.length < 2) {
    throw new Error('Need at least 2 players to start the game');
  }
  
  // Update game state
  game.started = true;
  game.lastUpdateTime = Date.now();
  
  // Store cities for this game
  gameCities.set(gameId, cities);
  
  // Update game in memory
  activeGames.set(gameId, game);
  
  return game;
}

/**
 * Move a player to a new location
 * @param gameId Game ID
 * @param playerId Player ID
 * @param location New location
 * @returns Updated game state or undefined if game not found
 */
export function movePlayer(gameId: string, playerId: string, location: string): GameState | undefined {
  const game = activeGames.get(gameId);
  
  if (!game) {
    return undefined;
  }
  
  // Find the player
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  // Check if it's the player's turn
  if (playerIndex !== game.currentPlayerIndex) {
    throw new Error('Not your turn');
  }
  
  // Check if the player has enough actions
  if (game.players[playerIndex].actions <= 0) {
    throw new Error('No actions left');
  }
  
  // Update the player's location and decrease actions
  game.players[playerIndex] = {
    ...game.players[playerIndex],
    location,
    actions: game.players[playerIndex].actions - 1
  };
  
  game.lastUpdateTime = Date.now();
  
  // Update game in memory
  activeGames.set(gameId, game);
  
  return game;
}

/**
 * Treat a disease in a city
 * @param gameId Game ID
 * @param playerId Player ID
 * @param cityName City name
 * @param color Disease color
 * @param cubes Number of cubes to remove
 * @returns Updated game state or undefined if game not found
 */
export function treatDisease(
  gameId: string, 
  playerId: string, 
  cityName: string, 
  color: DiseaseColor, 
  cubes: number
): GameState | undefined {
  const game = activeGames.get(gameId);
  const cities = gameCities.get(gameId);
  
  if (!game || !cities) {
    return undefined;
  }
  
  // Find the player
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  // Check if it's the player's turn
  if (playerIndex !== game.currentPlayerIndex) {
    throw new Error('Not your turn');
  }
  
  // Check if the player has enough actions
  if (game.players[playerIndex].actions <= 0) {
    throw new Error('No actions left');
  }
  
  // Get the city
  const city = cities[cityName];
  
  if (!city) {
    throw new Error('City not found');
  }
  
  // Check if there are disease cubes to treat
  if (city.infections[color] <= 0) {
    throw new Error('No disease cubes to treat');
  }
  
  // Treat the disease
  city.infections[color] = Math.max(0, city.infections[color] - cubes);
  
  // Update player actions
  game.players[playerIndex].actions -= 1;
  
  // Check if the disease has been eradicated
  if (game.diseases[color].cured) {
    // Check if all cubes of this color have been removed from the board
    const diseaseEradicated = Object.values(cities).every(city => city.infections[color] === 0);
    
    if (diseaseEradicated) {
      game.diseases[color].eradicated = true;
    }
  }
  
  game.lastUpdateTime = Date.now();
  
  // Update game in memory
  activeGames.set(gameId, game);
  gameCities.set(gameId, cities);
  
  return game;
}

/**
 * Build a research station in a city
 * @param gameId Game ID
 * @param playerId Player ID
 * @param cityName City name
 * @returns Updated game state or undefined if game not found
 */
export function buildResearchStation(
  gameId: string, 
  playerId: string, 
  cityName: string
): GameState | undefined {
  const game = activeGames.get(gameId);
  const cities = gameCities.get(gameId);
  
  if (!game || !cities) {
    return undefined;
  }
  
  // Find the player
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  // Check if it's the player's turn
  if (playerIndex !== game.currentPlayerIndex) {
    throw new Error('Not your turn');
  }
  
  // Check if the player has enough actions
  if (game.players[playerIndex].actions <= 0) {
    throw new Error('No actions left');
  }
  
  // Get the city
  const city = cities[cityName];
  
  if (!city) {
    throw new Error('City not found');
  }
  
  // Check if there's already a research station in the city
  if (city.researchStation) {
    throw new Error('Research station already exists in this city');
  }
  
  // Build the research station
  city.researchStation = true;
  
  // Update player actions
  game.players[playerIndex].actions -= 1;
  
  // Add the city to the list of research stations
  game.researchStations.push(cityName);
  
  game.lastUpdateTime = Date.now();
  
  // Update game in memory
  activeGames.set(gameId, game);
  gameCities.set(gameId, cities);
  
  return game;
}

/**
 * Discover a cure for a disease
 * @param gameId Game ID
 * @param playerId Player ID
 * @param color Disease color
 * @returns Updated game state or undefined if game not found
 */
export function discoverCure(
  gameId: string, 
  playerId: string, 
  color: DiseaseColor
): GameState | undefined {
  const game = activeGames.get(gameId);
  const cities = gameCities.get(gameId);
  
  if (!game || !cities) {
    return undefined;
  }
  
  // Find the player
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  // Check if it's the player's turn
  if (playerIndex !== game.currentPlayerIndex) {
    throw new Error('Not your turn');
  }
  
  // Check if the player has enough actions
  if (game.players[playerIndex].actions <= 0) {
    throw new Error('No actions left');
  }
  
  // Get the player's current location
  const playerLocation = game.players[playerIndex].location;
  const city = cities[playerLocation];
  
  if (!city) {
    throw new Error('City not found');
  }
  
  // Check if there's a research station in the player's location
  if (!city.researchStation) {
    throw new Error('Need a research station to discover a cure');
  }
  
  // Check if the disease is already cured
  if (game.diseases[color].cured) {
    throw new Error('Disease already cured');
  }
  
  // In a real game, we would check if the player has the required cards here
  
  // Cure the disease
  game.diseases[color].cured = true;
  
  // Update player actions
  game.players[playerIndex].actions -= 1;
  
  // Check if all diseases are cured (win condition)
  const allDiseasesCured = Object.values(game.diseases).every(disease => disease.cured);
  
  if (allDiseasesCured) {
    game.gameWon = true;
    game.gameOver = true;
  }
  
  game.lastUpdateTime = Date.now();
  
  // Update game in memory
  activeGames.set(gameId, game);
  
  return game;
}

/**
 * End a player's turn and handle infections
 * @param gameId Game ID
 * @param playerId Player ID
 * @returns Updated game state or undefined if game not found
 */
export function endTurn(
  gameId: string, 
  playerId: string
): GameState | undefined {
  const game = activeGames.get(gameId);
  const cities = gameCities.get(gameId);
  
  if (!game || !cities) {
    return undefined;
  }
  
  // Find the player
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  // Check if it's the player's turn
  if (playerIndex !== game.currentPlayerIndex) {
    throw new Error('Not your turn');
  }
  
  // Reset player actions
  game.players[playerIndex].actions = 4;
  
  // Move to the next player
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
  
  // Infect cities based on the current infection rate
  const cityNames = Object.keys(cities);
  let outbreakCount = game.outbreaks;
  
  for (let i = 0; i < game.infectionRate; i++) {
    const randomCity = cityNames[Math.floor(Math.random() * cityNames.length)];
    const cityColor = cities[randomCity].color as DiseaseColor;
    
    // Skip infection if the disease is eradicated
    if (game.diseases[cityColor].eradicated) {
      continue;
    }
    
    // Add infection cube
    cities[randomCity].infections[cityColor] += 1;
    
    // Check for outbreak (more than 3 cubes)
    if (cities[randomCity].infections[cityColor] > 3) {
      cities[randomCity].infections[cityColor] = 3; // Cap at 3
      outbreakCount += 1;
      
      // In a full game, outbreaks would chain to neighboring cities
      // This is simplified for demo purposes
    }
  }
  
  // Check for game over (8 outbreaks)
  const isGameOver = outbreakCount >= 8;
  
  if (isGameOver) {
    game.gameOver = true;
    game.gameWon = false;
  }
  
  // Update infection count
  game.outbreaks = outbreakCount;
  
  game.lastUpdateTime = Date.now();
  
  // Update game in memory
  activeGames.set(gameId, game);
  gameCities.set(gameId, cities);
  
  return game;
}

/**
 * Reset a game
 * @param gameId Game ID
 * @returns True if the game was reset, false otherwise
 */
export function resetGame(gameId: string): boolean {
  // Remove the game from memory
  const gameRemoved = activeGames.delete(gameId);
  const citiesRemoved = gameCities.delete(gameId);
  
  return gameRemoved && citiesRemoved;
}

/**
 * Get the cities for a game
 * @param gameId Game ID
 * @returns Cities or undefined if game not found
 */
export function getCities(gameId: string): Cities | undefined {
  return gameCities.get(gameId);
}

/**
 * Update a player's socket ID
 * @param gameId Game ID
 * @param playerId Player ID
 * @param socketId Socket ID
 * @returns Updated game state or undefined if game not found
 */
export function updatePlayerSocket(
  gameId: string,
  playerId: string,
  socketId: string
): GameState | undefined {
  const game = activeGames.get(gameId);
  
  if (!game) {
    return undefined;
  }
  
  // Find the player
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    return undefined;
  }
  
  // Update the player's socket ID
  game.players[playerIndex].socketId = socketId;
  
  // Update game in memory
  activeGames.set(gameId, game);
  
  return game;
}

/**
 * Get the full game state including cities
 * @param gameId Game ID
 * @returns Full game state or undefined if game not found
 */
export function getFullGameState(gameId: string): GameState | undefined {
  const game = activeGames.get(gameId);
  const cities = gameCities.get(gameId);
  
  if (!game) {
    return undefined;
  }
  
  return {
    ...game,
    cities: cities
  };
}

/**
 * Clean up inactive games (for maintenance)
 * @param maxAgeMs Maximum age in milliseconds
 * @returns Number of games cleaned up
 */
export function cleanupInactiveGames(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [gameId, game] of activeGames.entries()) {
    if (game.lastUpdateTime && now - game.lastUpdateTime > maxAgeMs) {
      activeGames.delete(gameId);
      gameCities.delete(gameId);
      cleanedCount++;
    }
  }
  
  return cleanedCount;
}
