# Setting Up the Pandemic Multiplayer Game

Follow these instructions to get the game up and running on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:
- Node.js (version 16 or higher)
- npm (comes with Node.js) or yarn

## Installation

1. Clone the repository from GitHub:
```bash
git clone https://github.com/your-username/pandemic-multiplayer-game.git
cd pandemic-multiplayer-game
```

2. Install the dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open your browser and go to [http://localhost:3000](http://localhost:3000) to view the game.

## Playing the Game

### Creating a Game

1. Enter your name and select a role
2. Click "Create New Game"
3. Share the Game ID with friends

### Joining a Game

1. Click "Join Existing Game"
2. Enter the Game ID shared with you
3. Enter your name and select a role
4. Click "Join Game"

### Game Controls

- Click on connected cities to move your player
- Use the action buttons to treat diseases, build research stations, and discover cures
- Click "End Turn" when you've used all your actions or want to pass to the next player

### Game Objective

Work together with other players to find cures for all four diseases (red, blue, yellow, and black) before 8 outbreaks occur.

## Simulating Multiplayer Locally

Since this is a frontend-only implementation, you can simulate multiplayer by opening the game in multiple browser tabs:

1. Create a game in one tab
2. Copy the Game ID
3. Open a new browser tab and join using the same Game ID
4. Repeat for additional players (up to 4)
5. Start the game from the host's tab

## Future Implementation

To make this a fully functional multiplayer game, you would need to:

1. Implement a backend server (Node.js, Python, etc.)
2. Set up WebSockets for real-time communication
3. Store game state on the server
4. Handle authentication and session management

The frontend code is structured to make this transition easier with placeholder functions for the WebSocket communication.
