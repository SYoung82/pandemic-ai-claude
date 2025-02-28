import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  GameState,
  SocketMessage,
  SocketData,
  Player,
  Cities,
  DiseaseColor
} from './types';
import * as GameManager from './services/gameManager';

// Load environment variables
dotenv.config();

// Configure server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle client messages
  socket.on('message', (message: SocketMessage) => {
    try {
      handleClientMessage(socket, message);
    } catch (error) {
      console.error('Error handling client message:', error);
      
      // Send error message back to client
      socket.emit('message', {
        type: 'ERROR',
        payload: {
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    // In a full implementation, we would handle player disconnection here
  });
});

/**
 * Handle client messages
 * @param socket Client socket
 * @param message Client message
 */
function handleClientMessage(socket: any, message: SocketMessage): void {
  console.log(`Received message (${message.type}):`, message);

  switch (message.type) {
    case 'CREATE_GAME':
      handleCreateGame(socket, message);
      break;
      
    case 'JOIN_GAME':
      handleJoinGame(socket, message);
      break;
      
    case 'START_GAME':
      handleStartGame(socket, message);
      break;
      
    case 'MOVE_PLAYER':
      handleMovePlayer(socket, message);
      break;
      
    case 'TREAT_DISEASE':
      handleTreatDisease(socket, message);
      break;
      
    case 'BUILD_RESEARCH_STATION':
      handleBuildResearchStation(socket, message);
      break;
      
    case 'DISCOVER_CURE':
      handleDiscoverCure(socket, message);
      break;
      
    case 'END_TURN':
      handleEndTurn(socket, message);
      break;
      
    case 'RESET_GAME':
      handleResetGame(socket, message);
      break;
      
    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

/**
 * Handle CREATE_GAME message
 * @param socket Client socket
 * @param message Client message
 */
function handleCreateGame(socket: any, message: SocketMessage): void {
  const { gameId, player } = message.payload;
  
  if (!gameId || !player) {
    throw new Error('Missing required fields');
  }
  
  // Create the game
  const game = GameManager.createGame(gameId, player);
  
  // Associate socket with the game and player
  socket.data = {
    gameId,
    playerId: player.id
  } as SocketData;
  
  // Join the socket to the game room
  socket.join(gameId);
  
  // Update player's socket ID
  GameManager.updatePlayerSocket(gameId, player.id, socket.id);
  
  // Send confirmation back to client
  socket.emit('message', {
    type: 'GAME_UPDATE',
    payload: {
      gameState: game
    }
  });
  
  console.log(`Game created: ${gameId}`);
}

/**
 * Handle JOIN_GAME message
 * @param socket Client socket
 * @param message Client message
 */
function handleJoinGame(socket: any, message: SocketMessage): void {
  const { gameId, player } = message.payload;
  
  if (!gameId || !player) {
    throw new Error('Missing required fields');
  }
  
  // Get the game
  const game = GameManager.getGame(gameId);
  
  if (!game) {
    throw new Error('Game not found');
  }
  
  // Add the player to the game
  const updatedGame = GameManager.addPlayer(gameId, player);
  
  if (!updatedGame) {
    throw new Error('Failed to add player to game');
  }
  
  // Associate socket with the game and player
  socket.data = {
    gameId,
    playerId: player.id
  } as SocketData;
  
  // Join the socket to the game room
  socket.join(gameId);
  
  // Update player's socket ID
  GameManager.updatePlayerSocket(gameId, player.id, socket.id);
  
  // Send update to all clients in the game
  io.to(gameId).emit('message', {
    type: 'GAME_UPDATE',
    payload: {
      gameState: updatedGame
    }
  });
  
  // Send player joined notification to all other clients
  socket.to(gameId).emit('message', {
    type: 'PLAYER_JOINED',
    payload: {
      player
    }
  });
  
  console.log(`Player ${player.name} joined game: ${gameId}`);
}

/**
 * Handle START_GAME message
 * @param socket Client socket
 * @param message Client message
 */
function handleStartGame(socket: any, message: SocketMessage): void {
  const { gameId, cities } = message.payload;
  
  if (!gameId || !cities) {
    throw new Error('Missing required fields');
  }
  
  // Start the game
  const game = GameManager.startGame(gameId, cities);
  
  if (!game) {
    throw new Error('Failed to start game');
  }
  
  // Get full game state including cities
  const fullGame = GameManager.getFullGameState(gameId);
  
  // Send update to all clients in the game
  io.to(gameId).emit('message', {
    type: 'GAME_STARTED',
    payload: {
      gameState: fullGame
    }
  });
  
  console.log(`Game started: ${gameId}`);
}

/**
 * Handle MOVE_PLAYER message
 * @param socket Client socket
 * @param message Client message
 */
function handleMovePlayer(socket: any, message: SocketMessage): void {
  const { gameId, playerId, location } = message.payload;
  
  if (!gameId || !playerId || !location) {
    throw new Error('Missing required fields');
  }
  
  // Move the player
  const game = GameManager.movePlayer(gameId, playerId, location);
  
  if (!game) {
    throw new Error('Failed to move player');
  }
  
  // Get full game state including cities
  const fullGame = GameManager.getFullGameState(gameId);
  
  // Send update to all clients in the game
  io.to(gameId).emit('message', {
    type: 'GAME_UPDATE',
    payload: {
      gameState: fullGame,
      action: 'MOVE_PLAYER',
      player: playerId,
      location
    }
  });
}

/**
 * Handle TREAT_DISEASE message
 * @param socket Client socket
 * @param message Client message
 */
function handleTreatDisease(socket: any, message: SocketMessage): void {
  const { gameId, playerId, city, color, cubes } = message.payload;
  
  if (!gameId || !playerId || !city || !color) {
    throw new Error('Missing required fields');
  }
  
  // Treat the disease
  const game = GameManager.treatDisease(gameId, playerId, city, color as DiseaseColor, cubes || 1);
  
  if (!game) {
    throw new Error('Failed to treat disease');
  }
  
  // Get full game state including cities
  const fullGame = GameManager.getFullGameState(gameId);
  
  // Send update to all clients in the game
  io.to(gameId).emit('message', {
    type: 'GAME_UPDATE',
    payload: {
      gameState: fullGame,
      action: 'TREAT_DISEASE',
      player: playerId,
      city,
      color,
      cubes
    }
  });
}

/**
 * Handle BUILD_RESEARCH_STATION message
 * @param socket Client socket
 * @param message Client message
 */
function handleBuildResearchStation(socket: any, message: SocketMessage): void {
  const { gameId, playerId, city } = message.payload;
  
  if (!gameId || !playerId || !city) {
    throw new Error('Missing required fields');
  }
  
  // Build the research station
  const game = GameManager.buildResearchStation(gameId, playerId, city);
  
  if (!game) {
    throw new Error('Failed to build research station');
  }
  
  // Get full game state including cities
  const fullGame = GameManager.getFullGameState(gameId);
  
  // Send update to all clients in the game
  io.to(gameId).emit('message', {
    type: 'GAME_UPDATE',
    payload: {
      gameState: fullGame,
      action: 'BUILD_RESEARCH_STATION',
      player: playerId,
      city
    }
  });
}

/**
 * Handle DISCOVER_CURE message
 * @param socket Client socket
 * @param message Client message
 */
function handleDiscoverCure(socket: any, message: SocketMessage): void {
  const { gameId, playerId, color } = message.payload;
  
  if (!gameId || !playerId || !color) {
    throw new Error('Missing required fields');
  }
  
  // Discover the cure
  const game = GameManager.discoverCure(gameId, playerId, color as DiseaseColor);
  
  if (!game) {
    throw new Error('Failed to discover cure');
  }
  
  // Get full game state including cities
  const fullGame = GameManager.getFullGameState(gameId);
  
  // Send update to all clients in the game
  io.to(gameId).emit('message', {
    type: 'GAME_UPDATE',
    payload: {
      gameState: fullGame,
      action: 'DISCOVER_CURE',
      player: playerId,
      color
    }
  });
  
  // Check if the game is over (all diseases cured)
  if (game.gameWon) {
    io.to(gameId).emit('message', {
      type: 'GAME_OVER',
      payload: {
        gameState: fullGame,
        won: true
      }
    });
  }
}

/**
 * Handle END_TURN message
 * @param socket Client socket
 * @param message Client message
 */
function handleEndTurn(socket: any, message: SocketMessage): void {
  const { gameId, playerId } = message.payload;
  
  if (!gameId || !playerId) {
    throw new Error('Missing required fields');
  }
  
  // End the turn
  const game = GameManager.endTurn(gameId, playerId);
  
  if (!game) {
    throw new Error('Failed to end turn');
  }
  
  // Get full game state including cities
  const fullGame = GameManager.getFullGameState(gameId);
  
  // Send update to all clients in the game
  io.to(gameId).emit('message', {
    type: 'GAME_UPDATE',
    payload: {
      gameState: fullGame,
      action: 'END_TURN',
      player: playerId
    }
  });
  
  // Check if the game is over (too many outbreaks)
  if (game.gameOver && !game.gameWon) {
    io.to(gameId).emit('message', {
      type: 'GAME_OVER',
      payload: {
        gameState: fullGame,
        won: false
      }
    });
  }
}

/**
 * Handle RESET_GAME message
 * @param socket Client socket
 * @param message Client message
 */
function handleResetGame(socket: any, message: SocketMessage): void {
  const { gameId } = message.payload;
  
  if (!gameId) {
    throw new Error('Missing required fields');
  }
  
  // Reset the game
  const success = GameManager.resetGame(gameId);
  
  if (!success) {
    throw new Error('Failed to reset game');
  }
  
  // Send update to all clients in the game
  io.to(gameId).emit('message', {
    type: 'GAME_UPDATE',
    payload: {
      reset: true,
      gameId
    }
  });
  
  // Disconnect all sockets from the game room
  io.in(gameId).socketsLeave(gameId);
  
  console.log(`Game reset: ${gameId}`);
}

// Schedule cleanup of inactive games
setInterval(() => {
  const cleanedCount = GameManager.cleanupInactiveGames();
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} inactive games`);
  }
}, 6 * 60 * 60 * 1000); // Run every 6 hours

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
