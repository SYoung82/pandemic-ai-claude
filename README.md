# Pandemic Multiplayer Game

A web-based multiplayer implementation of a Pandemic-like board game built with React. This project allows multiple players to join a game online and work together to fight global disease outbreaks.

![Pandemic Game Screenshot](screenshot.png)

## Features

- **Multiplayer Support**: Create and join games with unique game IDs
- **Visual Game Board**: Interactive world map with cities across different regions
- **Player Roles**: Different roles with unique abilities (Medic, Scientist, etc.)
- **Core Game Mechanics**:
  - Movement between connected cities
  - Disease treatment
  - Research station construction
  - Cure discovery
  - Infection spreading
- **Real-time Updates**: See other players' moves and actions
- **Win/Lose Conditions**: Cure all diseases or lose to outbreaks

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

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pandemic-multiplayer-game.git
cd pandemic-multiplayer-game

# Install dependencies
npm install

# Start the development server
npm start
```

### Multiplayer Implementation Notes

The current implementation uses a mock WebSocket connection to simulate multiplayer functionality. In a production environment, you would need to:

1. Implement a backend server (Node.js, Python, etc.)
2. Set up WebSockets or another real-time communication system
3. Handle game state synchronization between players
4. Implement proper authentication and session management

## Project Structure

```
src/
├── components/
│   ├── PandemicGame.js   # Main game component
│   └── ...
├── hooks/
│   └── useWebSocket.js   # (For future real WebSocket implementation)
├── utils/
│   ├── gameLogic.js      # Game mechanics and rules
│   └── constants.js      # Game constants and data
├── App.js
└── index.js
```

## Future Enhancements

- Real WebSocket server implementation
- Player authentication
- Game persistence (save/load)
- Chat functionality
- Additional game variants and scenarios
- Mobile-responsive design improvements

## License

MIT License - See LICENSE file for details

## Acknowledgements

- Inspired by the Pandemic board game by Matt Leacock
- Built with React.js and Tailwind CSS
- Icons provided by Lucide React