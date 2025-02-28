import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  User,
  Zap,
  RotateCcw,
  Layers,
  AlertCircle,
  X,
  Menu,
  Users,
  Check,
  Copy,
} from "lucide-react";
import useWebSocket from "../hooks/useWebSocket";
import {
  GameState,
  Cities,
  CityPositions,
  CityConnection,
  Player,
  DiseaseColor,
  WebSocketMessage
} from "../types";
import { generateGameId, generatePlayerId, areCitiesConnected } from "../utils/gameLogic";
import { getColorClass, getTextColorClass, INITIAL_GAME_STATE, PLAYER_ROLES } from "../utils/constants";

export default function PandemicGame() {
  // Define refs
  const mapRef = useRef<HTMLDivElement>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    gameId: "",
    started: false,
    players: [],
    currentPlayerIndex: 0,
    diseases: {
      red: { cured: false, eradicated: false, cubes: 24 },
      blue: { cured: false, eradicated: false, cubes: 24 },
      yellow: { cured: false, eradicated: false, cubes: 24 },
      black: { cured: false, eradicated: false, cubes: 24 },
    },
    infectionRate: 2,
    infectionRateTrack: [2, 2, 2, 3, 3, 4, 4],
    infectionRateIndex: 0,
    outbreaks: 0,
    researchStations: ["Atlanta"],
    gameOver: false,
    gameWon: false,
  });

  // UI state
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("Medic");
  const [joinGameId, setJoinGameId] = useState<string>("");
  const [showJoinGame, setShowJoinGame] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string>("");
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  // Map configuration
  const [cities, setCities] = useState<Cities>({});
  const [cityPositions, setCityPositions] = useState<CityPositions>({});
  const [connections, setConnections] = useState<CityConnection[]>([]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);

    switch (message.type) {
      case 'GAME_UPDATE':
        // Update game state from server
        if (message.payload.gameState) {
          setGameState(message.payload.gameState);
        }
        break;

      case 'PLAYER_JOINED':
        // Add new player to the game
        if (message.payload.player) {
          setGameState(prev => ({
            ...prev,
            players: [...prev.players, message.payload.player]
          }));
        }
        break;

      case 'GAME_STARTED':
        // Update game state when game starts
        if (message.payload.gameState) {
          setGameState(message.payload.gameState);
          setCities(message.payload.cities);
        }
        break;

      case 'ERROR':
        // Handle errors
        alert(message.payload.message);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  // Initialize WebSocket with memoized handler
  const { isConnected, error, sendMessage } = useWebSocket(
    gameState.gameId,
    isHost,
    handleWebSocketMessage
  );

  // Initialize map data
  useEffect(() => {
    // City data with relative positions
    const initialCityPositions: CityPositions = {
      // North America
      Atlanta: { x: 25, y: 35 },
      Chicago: { x: 22, y: 30 },
      "New York": { x: 30, y: 30 },
      Washington: { x: 28, y: 35 },
      "San Francisco": { x: 15, y: 35 },
      "Los Angeles": { x: 15, y: 40 },
      "Mexico City": { x: 20, y: 45 },
      Miami: { x: 25, y: 45 },

      // Europe
      London: { x: 40, y: 25 },
      Madrid: { x: 40, y: 35 },
      Paris: { x: 45, y: 30 },
      Milan: { x: 50, y: 30 },
      "St. Petersburg": { x: 55, y: 25 },

      // Asia
      Moscow: { x: 60, y: 25 },
      Tehran: { x: 60, y: 35 },
      Delhi: { x: 65, y: 40 },
      Karachi: { x: 60, y: 40 },
      Mumbai: { x: 62, y: 45 },
      Chennai: { x: 65, y: 50 },
      Kolkata: { x: 70, y: 40 },
      Beijing: { x: 75, y: 30 },
      Seoul: { x: 80, y: 30 },
      Tokyo: { x: 85, y: 35 },
      Shanghai: { x: 75, y: 40 },
      "Hong Kong": { x: 75, y: 45 },
      Taipei: { x: 80, y: 42 },
      "Ho Chi Minh City": { x: 75, y: 50 },
      Bangkok: { x: 70, y: 48 },
      Jakarta: { x: 72, y: 55 },
      Manila: { x: 80, y: 50 },
      Sydney: { x: 85, y: 65 },

      // Africa & Middle East
      Cairo: { x: 50, y: 40 },
      Istanbul: { x: 55, y: 35 },
      Algiers: { x: 45, y: 40 },
      Baghdad: { x: 55, y: 40 },
      Riyadh: { x: 55, y: 45 },
      Khartoum: { x: 50, y: 48 },
      Lagos: { x: 45, y: 50 },
      Kinshasa: { x: 48, y: 55 },
      Johannesburg: { x: 50, y: 60 },

      // South America
      Bogota: { x: 28, y: 50 },
      Lima: { x: 25, y: 55 },
      Santiago: { x: 25, y: 65 },
      "Buenos Aires": { x: 30, y: 65 },
      "Sao Paulo": { x: 35, y: 60 },
    };

    setCityPositions(initialCityPositions);

    // City data with disease color associations
    const initialCities: Cities = {
      // Blue cities (North America & Europe)
      Atlanta: {
        color: "blue",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: true,
      },
      Chicago: {
        color: "blue",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      "New York": {
        color: "blue",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Washington: {
        color: "blue",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      "San Francisco": {
        color: "blue",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      London: {
        color: "blue",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Madrid: {
        color: "blue",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Paris: {
        color: "blue",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Milan: {
        color: "blue",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      "St. Petersburg": {
        color: "blue",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },

      // Yellow cities (South America & Africa)
      "Los Angeles": {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      "Mexico City": {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Miami: {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Bogota: {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Lima: {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Santiago: {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      "Buenos Aires": {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      "Sao Paulo": {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Lagos: {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Kinshasa: {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Khartoum: {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Johannesburg: {
        color: "yellow",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },

      // Black cities (Middle East & Central Asia)
      Algiers: {
        color: "black",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Istanbul: {
        color: "black",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Cairo: {
        color: "black",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Moscow: {
        color: "black",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Baghdad: {
        color: "black",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Riyadh: {
        color: "black",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Tehran: {
        color: "black",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Karachi: {
        color: "black",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Delhi: {
        color: "black",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },

      // Red cities (East Asia & Oceania)
      Mumbai: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Chennai: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Kolkata: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Beijing: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Seoul: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Tokyo: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Shanghai: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      "Hong Kong": {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Taipei: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      "Ho Chi Minh City": {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Bangkok: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Jakarta: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Manila: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
      Sydney: {
        color: "red",
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: false,
      },
    };

    setCities(initialCities);

    // City connections (routes between cities)
    const cityConnections: CityConnection[] = [
      // North America connections
      ["San Francisco", "Chicago"],
      ["San Francisco", "Los Angeles"],
      ["Chicago", "Los Angeles"],
      ["Chicago", "Mexico City"],
      ["Chicago", "Atlanta"],
      ["Chicago", "New York"],
      ["New York", "Washington"],
      ["New York", "London"],
      ["New York", "Madrid"],
      ["Washington", "Atlanta"],
      ["Washington", "Miami"],
      ["Atlanta", "Miami"],
      ["Los Angeles", "Mexico City"],
      ["Miami", "Mexico City"],
      ["Miami", "Bogota"],

      // South America connections
      ["Mexico City", "Bogota"],
      ["Bogota", "Lima"],
      ["Bogota", "Sao Paulo"],
      ["Lima", "Santiago"],
      ["Lima", "Sao Paulo"],
      ["Santiago", "Buenos Aires"],
      ["Buenos Aires", "Sao Paulo"],

      // Europe connections
      ["London", "Paris"],
      ["London", "Madrid"],
      ["Madrid", "Paris"],
      ["Madrid", "Algiers"],
      ["Paris", "Milan"],
      ["Paris", "Algiers"],
      ["Milan", "St. Petersburg"],
      ["Milan", "Istanbul"],
      ["St. Petersburg", "Moscow"],
      ["St. Petersburg", "Istanbul"],

      // Africa & Middle East connections
      ["Algiers", "Istanbul"],
      ["Algiers", "Cairo"],
      ["Istanbul", "Cairo"],
      ["Istanbul", "Baghdad"],
      ["Istanbul", "Moscow"],
      ["Moscow", "Tehran"],
      ["Cairo", "Baghdad"],
      ["Cairo", "Riyadh"],
      ["Cairo", "Khartoum"],
      ["Baghdad", "Riyadh"],
      ["Baghdad", "Tehran"],
      ["Baghdad", "Karachi"],
      ["Riyadh", "Karachi"],
      ["Khartoum", "Lagos"],
      ["Khartoum", "Kinshasa"],
      ["Lagos", "Kinshasa"],
      ["Kinshasa", "Johannesburg"],

      // Asia connections
      ["Tehran", "Karachi"],
      ["Tehran", "Delhi"],
      ["Karachi", "Delhi"],
      ["Karachi", "Mumbai"],
      ["Delhi", "Mumbai"],
      ["Delhi", "Kolkata"],
      ["Mumbai", "Chennai"],
      ["Chennai", "Kolkata"],
      ["Chennai", "Bangkok"],
      ["Chennai", "Jakarta"],
      ["Kolkata", "Bangkok"],
      ["Kolkata", "Hong Kong"],
      ["Beijing", "Seoul"],
      ["Beijing", "Shanghai"],
      ["Seoul", "Tokyo"],
      ["Seoul", "Shanghai"],
      ["Tokyo", "Shanghai"],
      ["Tokyo", "San Francisco"],
      ["Shanghai", "Hong Kong"],
      ["Shanghai", "Taipei"],
      ["Hong Kong", "Taipei"],
      ["Hong Kong", "Bangkok"],
      ["Hong Kong", "Ho Chi Minh City"],
      ["Hong Kong", "Manila"],
      ["Taipei", "Manila"],
      ["Bangkok", "Ho Chi Minh City"],
      ["Bangkok", "Jakarta"],
      ["Ho Chi Minh City", "Jakarta"],
      ["Ho Chi Minh City", "Manila"],
      ["Jakarta", "Sydney"],
      ["Manila", "Sydney"],
    ];

    setConnections(cityConnections);
  }, []);

  // Create a new game
  const createGame = useCallback(() => {
    if (playerName.trim() === "") {
      alert("Please enter your name");
      return;
    }

    const gameId = generateGameId();
    const pid = generatePlayerId();

    const newPlayer: Player = {
      id: pid,
      name: playerName,
      role: selectedRole,
      location: "Atlanta",
      cards: [],
      actions: 4,
    };

    // Set up new game state
    setGameState(prev => ({
      ...prev,
      gameId,
      players: [newPlayer],
    }));

    setIsHost(true);
    setPlayerId(pid);

    // In a real implementation with the backend, we'd send a create game request
    sendMessage("CREATE_GAME", {
      gameId,
      player: newPlayer
    });
  }, [playerName, selectedRole, sendMessage])

  // Join an existing game
  const joinGame = useCallback(() => {
    console.log({ playerName, joinGameId })
    if (playerName.trim() === "" || joinGameId.trim() === "") {
      alert("Please enter your name and game ID");
      return;
    }

    if (!isConnected) {

    }

    const pid = generatePlayerId();

    const newPlayer: Player = {
      id: pid,
      name: playerName,
      role: selectedRole,
      location: "Atlanta",
      cards: [],
      actions: 4,
    };

    setPlayerId(pid);
    setIsHost(false);

    // Then update game state with the joinGameId
    setGameState(prev => ({
      ...prev,
      gameId: joinGameId,
    }));

    // Send join game message after state update
    // This will happen on the next render when sendMessage has the updated gameId
    setTimeout(() => {
      sendMessage("JOIN_GAME", {
        gameId: joinGameId,
        player: newPlayer
      });
    }, 0);
  }, [playerName, joinGameId, selectedRole, sendMessage])

  // Copy game link to clipboard
  function copyGameLink() {
    // In a real implementation, this would be a shareable link
    const gameLink = `https://pandemic-game.example.com/join/${gameState.gameId}`;
    navigator.clipboard.writeText(gameLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    });
  }

  // Start the game
  function startGame() {
    if (gameState.players.length < 2) {
      alert("You need at least 2 players to start the game");
      return;
    }

    // Initialize the game by infecting initial cities
    const updatedCities = { ...cities };
    const cityNames = Object.keys(updatedCities);

    // Infect 3 cities with 3 cubes
    for (let i = 0; i < 3; i++) {
      const randomCity = cityNames[Math.floor(Math.random() * cityNames.length)];
      const cityColor = updatedCities[randomCity].color as DiseaseColor;
      updatedCities[randomCity].infections[cityColor] += 3;
    }

    // Infect 3 different cities with 2 cubes
    for (let i = 0; i < 3; i++) {
      const randomCity = cityNames[Math.floor(Math.random() * cityNames.length)];
      const cityColor = updatedCities[randomCity].color as DiseaseColor;
      updatedCities[randomCity].infections[cityColor] += 2;
    }

    // Infect 3 more different cities with 1 cube
    for (let i = 0; i < 3; i++) {
      const randomCity = cityNames[Math.floor(Math.random() * cityNames.length)];
      const cityColor = updatedCities[randomCity].color as DiseaseColor;
      updatedCities[randomCity].infections[cityColor] += 1;
    }

    setCities(updatedCities);

    // In a real implementation with the backend, we'd send a start game request
    sendMessage("START_GAME", {
      gameId: gameState.gameId,
      cities: updatedCities
    });

    setGameState(prev => ({
      ...prev,
      started: true,
    }));
  }

  // Handle player movement
  function movePlayer(cityName: string) {
    if (!gameState.started || gameState.gameOver) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Can only move your own player
    if (currentPlayer.id !== playerId) return;

    // Check if move is valid (cities must be connected)
    if (!areCitiesConnected(currentPlayer.location, cityName, connections) &&
      currentPlayer.location !== cityName) {
      alert(`Cannot move directly from ${currentPlayer.location} to ${cityName}. Cities must be connected.`);
      return;
    }

    if (currentPlayer.actions > 0) {
      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayerIndex] = {
        ...currentPlayer,
        location: cityName,
        actions: currentPlayer.actions - 1,
      };

      // In a real implementation with the backend, we'd send a move player request
      sendMessage("MOVE_PLAYER", {
        gameId: gameState.gameId,
        playerId: playerId,
        location: cityName
      });

      // Update game state
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
      }));
    }
  }

  // Treat disease in current city
  function treatDisease(color: DiseaseColor) {
    if (!gameState.started || gameState.gameOver) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Can only treat disease if it's your turn
    if (currentPlayer.id !== playerId) return;

    const currentCity = currentPlayer.location;
    const city = cities[currentCity];

    if (city && city.infections[color] > 0 && currentPlayer.actions > 0) {
      const updatedCities = { ...cities };
      const isCured = gameState.diseases[color].cured;

      // If the disease is cured or the player is a Medic, remove all cubes
      const cubesToRemove =
        isCured || currentPlayer.role === "Medic"
          ? updatedCities[currentCity].infections[color]
          : 1;

      updatedCities[currentCity] = {
        ...updatedCities[currentCity],
        infections: {
          ...updatedCities[currentCity].infections,
          [color]: updatedCities[currentCity].infections[color] - cubesToRemove,
        },
      };

      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayerIndex] = {
        ...currentPlayer,
        actions: currentPlayer.actions - 1,
      };

      // In a real implementation with the backend, we'd send a treat disease request
      sendMessage("TREAT_DISEASE", {
        gameId: gameState.gameId,
        playerId: playerId,
        city: currentCity,
        color: color,
        cubes: cubesToRemove
      });

      // Update game state
      setCities(updatedCities);
      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
      }));
    }
  }

  // Build a research station
  function buildResearchStation() {
    if (!gameState.started || gameState.gameOver) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Can only build if it's your turn
    if (currentPlayer.id !== playerId) return;

    const currentCity = currentPlayer.location;
    const city = cities[currentCity];

    if (city && !city.researchStation && currentPlayer.actions > 0) {
      // In a full game, we would check if the player has the city card
      // For the Operations Expert, no city card is needed
      const canBuild =
        currentPlayer.role === "Operations Expert" ||
        currentPlayer.cards.includes(currentCity);

      if (canBuild) {
        const updatedCities = { ...cities };
        updatedCities[currentCity] = {
          ...updatedCities[currentCity],
          researchStation: true,
        };

        const updatedPlayers = [...gameState.players];
        updatedPlayers[gameState.currentPlayerIndex] = {
          ...currentPlayer,
          actions: currentPlayer.actions - 1,
        };

        // In a real implementation with the backend, we'd send a build research station request
        sendMessage("BUILD_RESEARCH_STATION", {
          gameId: gameState.gameId,
          playerId: playerId,
          city: currentCity
        });

        // Update game state
        setCities(updatedCities);
        setGameState(prev => ({
          ...prev,
          players: updatedPlayers,
          researchStations: [...prev.researchStations, currentCity],
        }));
      }
    }
  }

  // Discover a cure
  function discoverCure(color: DiseaseColor) {
    if (!gameState.started || gameState.gameOver) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Can only discover a cure if it's your turn
    if (currentPlayer.id !== playerId) return;

    const currentCity = currentPlayer.location;
    const city = cities[currentCity];

    // Check if there's a research station in the current city
    if (city && city.researchStation && currentPlayer.actions > 0) {
      // In a full game, we would check if the player has the required cards
      // Scientist needs 4 cards, others need 5
      const requiredCards = currentPlayer.role === "Scientist" ? 4 : 5;

      // For demo purposes, we'll just cure without checking cards
      const updatedDiseases = { ...gameState.diseases };
      updatedDiseases[color] = {
        ...updatedDiseases[color],
        cured: true,
      };

      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayerIndex] = {
        ...currentPlayer,
        actions: currentPlayer.actions - 1,
      };

      // Check if all diseases are cured (win condition)
      const allCured = Object.values(updatedDiseases).every(disease => disease.cured);

      // In a real implementation with the backend, we'd send a discover cure request
      sendMessage("DISCOVER_CURE", {
        gameId: gameState.gameId,
        playerId: playerId,
        color: color
      });

      // Update game state
      setGameState(prev => ({
        ...prev,
        diseases: updatedDiseases,
        players: updatedPlayers,
        gameWon: allCured,
        gameOver: allCured,
      }));
    }
  }

  // End current player's turn
  function endTurn() {
    if (!gameState.started || gameState.gameOver) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Can only end your own turn
    if (currentPlayer.id !== playerId) return;

    // In a real implementation with the backend, we'd send an end turn request
    sendMessage("END_TURN", {
      gameId: gameState.gameId,
      playerId: playerId
    });

    // Reset actions for current player
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex] = {
      ...updatedPlayers[gameState.currentPlayerIndex],
      actions: 4,
    };

    // Move to next player
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;

    // Infect cities based on infection rate
    const updatedCities = { ...cities };
    const cityNames = Object.keys(updatedCities);

    let outbreakCount = gameState.outbreaks;

    for (let i = 0; i < gameState.infectionRate; i++) {
      const randomCity = cityNames[Math.floor(Math.random() * cityNames.length)];
      const cityColor = updatedCities[randomCity].color as DiseaseColor;

      // Add infection cube
      updatedCities[randomCity].infections[cityColor] += 1;

      // Check for outbreak (more than 3 cubes)
      if (updatedCities[randomCity].infections[cityColor] > 3) {
        updatedCities[randomCity].infections[cityColor] = 3; // Cap at 3
        outbreakCount += 1;

        // In a full game, outbreaks would chain to neighboring cities
      }
    }

    // Check for game over (8 outbreaks)
    const isGameOver = outbreakCount >= 8;

    // Update cities
    setCities(updatedCities);

    // Update game state
    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
      outbreaks: outbreakCount,
      gameOver: isGameOver || prev.gameOver,
    }));
  }

  // Reset the game
  function resetGame() {
    // In a real implementation, this would send a reset game message to the server
    if (gameState.gameId) {
      sendMessage("RESET_GAME", {
        gameId: gameState.gameId
      });
    }

    setGameState({
      gameId: "",
      started: false,
      players: [],
      currentPlayerIndex: 0,
      diseases: {
        red: { cured: false, eradicated: false, cubes: 24 },
        blue: { cured: false, eradicated: false, cubes: 24 },
        yellow: { cured: false, eradicated: false, cubes: 24 },
        black: { cured: false, eradicated: false, cubes: 24 },
      },
      infectionRate: 2,
      infectionRateTrack: [2, 2, 2, 3, 3, 4, 4],
      infectionRateIndex: 0,
      outbreaks: 0,
      researchStations: ["Atlanta"],
      gameOver: false,
      gameWon: false,
    });

    // Reset UI state
    setIsHost(false);
    setPlayerId("");
    setShowJoinGame(false);

    // Reinitialize city data with clean infection counts
    const cleanCities = Object.entries(cities).reduce((acc, [cityName, cityData]) => {
      acc[cityName] = {
        ...cityData,
        infections: { red: 0, blue: 0, yellow: 0, black: 0 },
        researchStation: cityName === "Atlanta",
      };
      return acc;
    }, {} as Cities);

    setCities(cleanCities);
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex] || {};
  const isCurrentPlayersTurn = currentPlayer.id === playerId;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Zap size={24} className="mr-2" />
          <h1 className="text-xl font-bold">Pandemic Game</h1>
          {gameState.gameId && (
            <div className="ml-4 flex items-center">
              <span className="mr-2">Game ID: {gameState.gameId}</span>
              <button
                onClick={copyGameLink}
                className="p-1 rounded hover:bg-blue-700 flex items-center"
                title="Copy join link"
              >
                {linkCopied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="md:hidden p-2 rounded hover:bg-blue-700"
        >
          {showSidebar ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${showSidebar ? "block" : "hidden"
            } md:block bg-white w-full md:w-64 shadow-lg p-4 overflow-y-auto z-10`}
        >
          {!gameState.gameId ? (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">
                Join or Create Game
              </h2>

              {showJoinGame ? (
                <>
                  <h3 className="font-medium mb-2">Join Existing Game</h3>
                  <input
                    type="text"
                    placeholder="Game ID"
                    value={joinGameId}
                    onChange={(e) =>
                      setJoinGameId(e.target.value.toUpperCase())
                    }
                    className="w-full p-2 border rounded mb-2"
                    maxLength={6}
                  />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  >
                    {PLAYER_ROLES.map((role) => (
                      <option key={role.name} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={joinGame}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2"
                  >
                    Join Game
                  </button>
                  <button
                    onClick={() => setShowJoinGame(false)}
                    className="w-full border border-gray-300 py-2 rounded hover:bg-gray-100"
                  >
                    Back
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  >
                    {PLAYER_ROLES.map((role) => (
                      <option key={role.name} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={createGame}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mb-2"
                  >
                    Create New Game
                  </button>
                  <button
                    onClick={() => setShowJoinGame(true)}
                    className="w-full border border-gray-300 py-2 rounded hover:bg-gray-100"
                  >
                    Join Existing Game
                  </button>
                </>
              )}
            </div>
          ) : !gameState.started ? (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">
                Players ({gameState.players.length}/4)
              </h2>
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className="p-2 mb-2 rounded bg-gray-100 flex items-center"
                >
                  <User size={18} className="mr-2" />
                  <div className="font-medium">
                    {player.name} ({player.role})
                  </div>
                </div>
              ))}

              {isHost && (
                <div className="mt-4">
                  <button
                    onClick={startGame}
                    disabled={gameState.players.length < 2}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Start Game
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {gameState.players.length < 2
                      ? "Need at least 2 players"
                      : "Ready to start!"}
                  </p>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                <p className="font-medium mb-1">
                  Waiting for players to join...
                </p>
                <p>
                  Share your Game ID ({gameState.gameId}) with friends to let
                  them join.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-1">Game Status</h2>
                <div className="flex justify-between mb-1">
                  <span>Outbreaks:</span>
                  <span
                    className={
                      gameState.outbreaks >= 5
                        ? "text-red-600 font-semibold"
                        : ""
                    }
                  >
                    {gameState.outbreaks}/8
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Infection Rate:</span>
                  <span>{gameState.infectionRate}</span>
                </div>
                <div className="mb-2">
                  <span className="block mb-1">Diseases:</span>
                  <div className="flex space-x-2">
                    {Object.entries(gameState.diseases).map(
                      ([color, status]) => (
                        <div
                          key={color}
                          className={`w-6 h-6 rounded-full ${getColorClass(
                            color
                          )} ${status.cured ? "border-2 border-green-500" : ""
                            }`}
                          title={status.cured ? "Cured" : "Active"}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Players</h2>
                {gameState.players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-2 mb-2 rounded flex items-center ${index === gameState.currentPlayerIndex
                      ? "bg-yellow-100 border-l-4 border-yellow-500"
                      : "bg-gray-100"
                      }`}
                  >
                    <User size={18} className="mr-2" />
                    <div>
                      <div className="font-medium">
                        {player.name} ({player.role})
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>Location: {player.location}</span>
                        {index === gameState.currentPlayerIndex && (
                          <span className="ml-2">
                            Actions: {player.actions}/4
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {gameState.gameOver && (
                <div
                  className={`p-3 rounded mb-4 ${gameState.gameWon
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}
                >
                  <p className="font-bold">
                    {gameState.gameWon ? "You Won!" : "Game Over!"}
                  </p>
                  <p>
                    {gameState.gameWon
                      ? "All diseases have been cured."
                      : "Too many outbreaks have occurred."}
                  </p>
                </div>
              )}

              <button
                onClick={resetGame}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                <RotateCcw size={16} className="inline mr-1" />
                Reset Game
              </button>
            </div>
          )}
        </div>

        {/* Main Game Board */}
        <div className="flex-1 p-4 overflow-auto">
          {gameState.started ? (
            <div className="h-full flex flex-col">
              {/* Current Player Actions */}
              {isCurrentPlayersTurn && (
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                  <h2 className="text-lg font-semibold mb-2">
                    Your Turn ({currentPlayer.role})
                  </h2>
                  <p className="mb-2">
                    Location: {currentPlayer.location} - Actions left:{" "}
                    {currentPlayer.actions}/4
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={buildResearchStation}
                      disabled={currentPlayer.actions <= 0}
                      className="bg-indigo-600 text-white py-1 px-2 rounded text-sm hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                      Build Research Station
                    </button>

                    {(["red", "blue", "yellow", "black"] as DiseaseColor[]).map((color) => (
                      <button
                        key={color}
                        onClick={() => treatDisease(color)}
                        disabled={currentPlayer.actions <= 0}
                        className={`${getColorClass(
                          color
                        )} text-white py-1 px-2 rounded text-sm hover:opacity-90 disabled:bg-gray-400`}
                      >
                        Treat {color}
                      </button>
                    ))}

                    {(["red", "blue", "yellow", "black"] as DiseaseColor[]).map((color) => (
                      <button
                        key={`cure-${color}`}
                        onClick={() => discoverCure(color)}
                        disabled={
                          currentPlayer.actions <= 0 ||
                          gameState.diseases[color].cured
                        }
                        className={`border ${getColorClass(
                          color
                        )} text-white py-1 px-2 rounded text-sm hover:opacity-90 disabled:bg-gray-400`}
                      >
                        Cure {color}
                      </button>
                    ))}

                    <button
                      onClick={endTurn}
                      className="bg-gray-700 text-white py-1 px-2 rounded text-sm hover:bg-gray-800 col-span-2"
                    >
                      End Turn
                    </button>
                  </div>
                </div>
              )}

              {!isCurrentPlayersTurn && gameState.started && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="font-medium">
                    Waiting for {currentPlayer.name}'s turn to complete...
                  </p>
                </div>
              )}

              {/* Game Map */}
              <div className="bg-white rounded-lg shadow flex-1 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-semibold">World Map</h2>
                  <p className="text-sm text-gray-600">
                    Click on a connected city to move there
                  </p>
                </div>

                <div
                  className="relative w-full h-full p-4"
                  ref={mapRef}
                  style={{ minHeight: "400px" }}
                >
                  {/* Game board background */}
                  <div className="absolute inset-0 bg-blue-50 m-4 rounded-lg"></div>

                  {/* City connections */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    style={{ zIndex: 1 }}
                  >
                    {connections.map((conn, index) => {
                      const city1 = cityPositions[conn[0]];
                      const city2 = cityPositions[conn[1]];

                      if (!city1 || !city2) return null;

                      return (
                        <line
                          key={`${conn[0]}-${conn[1]}`}
                          x1={`${city1.x}%`}
                          y1={`${city1.y}%`}
                          x2={`${city2.x}%`}
                          y2={`${city2.y}%`}
                          stroke="#999"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>

                  {/* Cities */}
                  {Object.entries(cities).map(([cityName, cityData]) => {
                    const position = cityPositions[cityName];
                    if (!position) return null;

                    const cityColor = getColorClass(cityData.color);
                    const hasResearchStation = cityData.researchStation;
                    const playersInCity = gameState.players.filter(
                      (p) => p.location === cityName
                    );
                    const hasInfection = Object.values(
                      cityData.infections
                    ).some((count) => count > 0);

                    // Check if current player can move to this city
                    const canMove =
                      isCurrentPlayersTurn &&
                      currentPlayer.actions > 0 &&
                      areCitiesConnected(currentPlayer.location, cityName, connections);

                    return (
                      <div
                        key={cityName}
                        className={`absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 ${canMove ? "cursor-pointer" : ""
                          }`}
                        style={{
                          left: `${position.x}%`,
                          top: `${position.y}%`,
                          zIndex: 2,
                        }}
                        onClick={() => canMove && movePlayer(cityName)}
                      >
                        <div
                          className={`w-5 h-5 mx-auto rounded-full ${cityColor} ${canMove
                            ? "ring-2 ring-offset-2 ring-white animate-pulse"
                            : ""
                            }`}
                        >
                          {hasInfection && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                          )}
                        </div>

                        {/* City name */}
                        <div
                          className="text-xs font-medium text-center mt-1"
                          style={{
                            textShadow:
                              "0 0 2px white, 0 0 2px white, 0 0 2px white, 0 0 2px white",
                          }}
                        >
                          {cityName}
                        </div>

                        {/* Research station indicator */}
                        {hasResearchStation && (
                          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                            <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                          </div>
                        )}

                        {/* Players in this city */}
                        {playersInCity.length > 0 && (
                          <div className="absolute -left-3 top-0 flex flex-col space-y-1">
                            {playersInCity.map((player) => (
                              <div
                                key={player.id}
                                className="w-3 h-3 rounded-full bg-green-500 border border-white"
                                title={`${player.name} (${player.role})`}
                              ></div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : gameState.gameId ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                <h2 className="text-2xl font-bold mb-4">Waiting for Players</h2>
                <p className="mb-6">
                  Share your Game ID with friends to let them join your game.
                </p>

                <div className="bg-gray-100 p-4 rounded-lg mb-6 flex items-center justify-between">
                  <span className="font-mono font-bold text-xl">
                    {gameState.gameId}
                  </span>
                  <button
                    onClick={copyGameLink}
                    className="ml-4 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {linkCopied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Current Players:</h3>
                  <ul className="space-y-2">
                    {gameState.players.map((player) => (
                      <li key={player.id} className="flex items-center">
                        <User size={16} className="mr-2" />
                        {player.name} ({player.role})
                      </li>
                    ))}
                  </ul>
                </div>

                {isHost && (
                  <button
                    onClick={startGame}
                    disabled={gameState.players.length < 2}
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Start Game with {gameState.players.length} Players
                  </button>
                )}

                {!isHost && (
                  <div className="p-3 bg-blue-50 rounded">
                    <p>Waiting for host to start the game...</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                <h2 className="text-2xl font-bold mb-4">
                  Welcome to the Pandemic Game
                </h2>
                <p className="mb-6">
                  Work together to fight deadly diseases around the world before
                  they spread too far.
                </p>

                <ol className="text-left mb-6 space-y-2">
                  <li>
                    <span className="font-semibold">1.</span> Create a game or
                    join an existing one
                  </li>
                  <li>
                    <span className="font-semibold">2.</span> Each player gets a
                    unique role with special abilities
                  </li>
                  <li>
                    <span className="font-semibold">3.</span> Work together to
                    treat infections and discover cures
                  </li>
                  <li>
                    <span className="font-semibold">4.</span> Win by curing all
                    four diseases
                  </li>
                  <li>
                    <span className="font-semibold">5.</span> Lose if too many
                    outbreaks occur (8+)
                  </li>
                </ol>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={createGame}
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    Create Game
                  </button>
                  <button
                    onClick={() => setShowJoinGame(true)}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Join Game
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
