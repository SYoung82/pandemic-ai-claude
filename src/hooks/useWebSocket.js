import { useState, useEffect, useCallback } from 'react';
import { createMockWebSocket } from '../utils/constants';

/**
 * A hook for managing WebSocket connections in the Pandemic Game
 * For now, this is a mock implementation that simulates WebSocket functionality
 * In a real implementation, this would connect to an actual WebSocket server
 * 
 * @param {string} gameId - The ID of the game to connect to
 * @param {boolean} isHost - Whether the current player is the host of the game
 * @param {function} onMessage - Callback function to handle incoming messages
 * @returns {Object} - WebSocket utilities
 */
export default function useWebSocket(gameId, isHost, onMessage) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Connect to the game server
  const connect = useCallback(() => {
    if (!gameId) return;
    
    console.log(`Connecting to game: ${gameId}...`);
    
    // In a real implementation, this would establish a WebSocket connection
    // For now, we'll use a mock implementation
    const mockSocket = createMockWebSocket();
    
    setSocket(mockSocket);
    setIsConnected(true);
    setError(null);
    
    // Simulate connection success
    setTimeout(() => {
      onMessage({
        type: 'CONNECTION_SUCCESS',
        payload: { gameId, isHost }
      });
    }, 500);
    
  }, [gameId, isHost, onMessage]);

  // Disconnect from the game server
  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Send a message to the game server
  const sendMessage = useCallback((type, payload) => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }

    const message = JSON.stringify({
      type,
      payload,
      gameId,
      timestamp: Date.now()
    });

    socket.send(message);
    
    // For mock implementation, simulate receiving a response
    if (type === 'GAME_ACTION') {
      setTimeout(() => {
        onMessage({
          type: 'GAME_ACTION_ACK',
          payload: {
            action: payload.action,
            success: true
          }
        });
      }, 200);
    }
    
  }, [socket, isConnected, gameId, onMessage]);

  // Connect to the server when the component mounts
  useEffect(() => {
    if (gameId) {
      connect();
    }
    
    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [gameId, connect, disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage
  };
}
