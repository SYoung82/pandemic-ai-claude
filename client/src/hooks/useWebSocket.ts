import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageType, WebSocketMessage } from '../types';
import { io, Socket } from 'socket.io-client';

/**
 * A hook for managing WebSocket connections in the Pandemic Game
 * 
 * @param {string} gameId - The ID of the game to connect to
 * @param {boolean} isHost - Whether the current player is the host of the game
 * @param {function} onMessage - Callback function to handle incoming messages
 * @returns {Object} - WebSocket utilities
 */
export default function useWebSocket(
  gameId: string, 
  isHost: boolean, 
  onMessage: (message: WebSocketMessage) => void
) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent infinite reconnection loops
  const socketRef = useRef<Socket | null>(null);
  const gameIdRef = useRef<string>(gameId);
  const connectionAttemptedRef = useRef<boolean>(false);

  // Update the ref when gameId changes
  useEffect(() => {
    gameIdRef.current = gameId;
  }, [gameId]);

  // Connect to the game server
  const connect = useCallback(() => {
    // Don't try to connect if:
    // 1. We don't have a gameId
    // 2. We already have an active socket connection
    // 3. We've already attempted a connection for this gameId
    if (!gameIdRef.current || socketRef.current || connectionAttemptedRef.current) {
      return;
    }
    
    console.log(`Connecting to game: ${gameIdRef.current}...`);
    connectionAttemptedRef.current = true;
    
    try {
      // Connect to the Socket.IO server
      const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const newSocket = io(serverUrl);
      
      // Save to ref to prevent reconnection
      socketRef.current = newSocket;
      setSocket(newSocket);
      
      // Set up event handlers
      newSocket.on('connect', () => {
        console.log('Socket.IO connected!');
        setIsConnected(true);
        setError(null);
      });
      
      newSocket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        setIsConnected(false);
      });
      
      newSocket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err);
        setError(`Connection error: ${err.message}`);
        setIsConnected(false);
      });
      
      // Listen for messages from the server
      newSocket.on('message', (message: WebSocketMessage) => {
        onMessage(message);
      });
    } catch (err) {
      setError(`Failed to connect: ${err instanceof Error ? err.message : String(err)}`);
      setIsConnected(false);
    }
  }, [onMessage]);

  // Disconnect from the game server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("Disconnecting socket...");
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      connectionAttemptedRef.current = false;
    }
  }, []);

  // Send a message to the game server
  const sendMessage = useCallback((type: string, payload: any) => {
    if (!socketRef.current || !isConnected) {
      setError('Not connected to server');
      return;
    }

    const message: WebSocketMessage = {
      type: type as MessageType,
      payload,
      gameId: gameIdRef.current,
      timestamp: Date.now()
    };

    socketRef.current.emit('message', message);
  }, [isConnected]);

  // Connect to the server when the component mounts or gameId changes
  useEffect(() => {
    // Only attempt connection if gameId exists and is valid
    if (gameId && gameId !== '') {
      // Reset attempt flag when gameId changes
      if (gameId !== gameIdRef.current) {
        connectionAttemptedRef.current = false;
      }
      connect();
    }
    
    // Clean up on unmount or when gameId changes
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
