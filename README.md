# Pandemic Multiplayer Game

A web-based multiplayer implementation of a Pandemic-like board game built with React, TypeScript, Node.js, and Socket.IO. This project allows multiple players to join a game online and work together to fight global disease outbreaks.

## Project Structure

```
pandemic-multiplayer-game/
│
├── client/             # React TypeScript frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── hooks/      # Custom React hooks (useWebSocket)
│       ├── types/      # TypeScript interfaces and types
│       └── utils/      # Utility functions
│
└── server/             # Node.js TypeScript backend
    ├── src/
    │   ├── services/   # Game logic and state management
    │   └── types/      # Shared TypeScript types
    └── dist/           # Compiled JavaScript output
```

## Features

- **Multiplayer Support**: Create and join games with unique game IDs
- **Real-time Communication**: WebSocket-based communication using Socket.IO
- **Responsive UI**: Works on desktop and mobile devices
- **Role-based Gameplay**: Different player roles with unique abilities
- **Core Game Mechanics**:
  - Movement between connected cities
  - Disease treatment
  - Research station construction
  - Cure discovery
  - Infection spreading
- **Win/Lose Conditions**: Cure all diseases or lose to outbreaks

## Setup & Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### Client Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

### Server Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Start the server
npm start

# For development with auto-reload
npm run dev
```

## How to Play

1. **Create a Game**:
   - Enter your name and select a role
   - Click "Create New Game"
   - Share the Game ID with friends

2. **Join a Game**:
   - Click "Join Existing Game" 
   - Enter the Game ID shared with you
   - Enter your name and select a role
   - Click "Join Game"

3. **Game Objective**:
   - Work together to cure all four diseases (red, blue, yellow, black)
   - Prevent outbreaks from spreading around the world
   - Lose condition: 8+ outbreaks occur

## Development

### Backend Architecture

The backend is built using:
- **Node.js & Express**: For the HTTP server
- **Socket.IO**: For real-time bidirectional communication
- **TypeScript**: For type safety and better developer experience

The game state is managed in-memory on the server, and all actions are processed through the server to maintain consistency between clients.

### Frontend Architecture

The frontend is built using:
- **React 19**: For the UI components
- **TypeScript**: For type safety
- **TailwindCSS**: For styling
- **Socket.IO Client**: For real-time communication with the server

### Communication Protocol

The client and server communicate using a message-based protocol over Socket.IO. Each message has a type and payload, and the server processes these messages to update the game state.

Example message:
```typescript
{
  type: 'MOVE_PLAYER',
  payload: {
    gameId: 'ABC123',
    playerId: 'player1',
    location: 'Atlanta'
  }
}
```

## Further Enhancements

- Player authentication
- Game persistence (database storage)
- Chat functionality
- Additional game variants and scenarios
- More sophisticated AI for single-player mode
- Game logs and history
- Spectator mode

## License

MIT License - See LICENSE file for details

## Acknowledgements

- Inspired by the Pandemic board game by Matt Leacock
- Built with React.js, TypeScript, Node.js, and Socket.IO
- Icons provided by Lucide React
- 