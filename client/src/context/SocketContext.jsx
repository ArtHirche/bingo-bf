import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [markedNumbers, setMarkedNumbers] = useState({}); // cardId -> Set/Array of marked numbers
  const [victoryData, setVictoryData] = useState(null);
  const [alarmMessage, setAlarmMessage] = useState(null);
  const [lastDrawnNumber, setLastDrawnNumber] = useState(null);
  const [isCannonFiring, setIsCannonFiring] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Inicializar conexão de Socket.io
    const newSocket = io({
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('⚓ Conectado à taverna de WebSockets!');
    });

    newSocket.on('room_joined', ({ room, myCards }) => {
      setCurrentRoom(room);
      if (myCards && myCards.length > 0) {
        setMyCards(myCards);
      }
    });

    newSocket.on('room_updated', (room) => {
      setCurrentRoom(room);
    });

    newSocket.on('cards_updated', (cards) => {
      setMyCards(cards);
    });

    newSocket.on('number_drawn', ({ number, drawnNumbers, room }) => {
      setCurrentRoom(room);
      setLastDrawnNumber(number);
      setIsCannonFiring(true);
      setTimeout(() => setIsCannonFiring(false), 700);

      // Tocar som de canhão e falar número
      soundEffects.playCannon();
      setTimeout(() => {
        soundEffects.speakNumber(number);
      }, 300);
    });

    newSocket.on('bingo_winner', ({ winner, message, room }) => {
      setCurrentRoom(room);
      setVictoryData(winner);
      soundEffects.playBingoFanfare();

      // Chuva épica de moedas de ouro e confetes
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
          });
        }

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
          colors: ['#f59e0b', '#fbbf24', '#ffffff']
        });
        fire(0.2, {
          spread: 60,
          colors: ['#ef4444', '#dc2626', '#b91c1c']
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 1.2,
          colors: ['#f59e0b', '#d97706', '#78350f']
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.4
        });
      } catch (e) {}
    });

    newSocket.on('bingo_false_alarm', (data) => {
      soundEffects.playFalseAlarm();
      setAlarmMessage(data.message);
      setTimeout(() => setAlarmMessage(null), 6000);
    });

    newSocket.on('chat_message', (chatMsg) => {
      setCurrentRoom((prev) => {
        if (!prev) return prev;
        const currentChat = prev.chat || [];
        if (currentChat.some((m) => m.id === chatMsg.id)) return prev;
        return {
          ...prev,
          chat: [...currentChat, chatMsg]
        };
      });
      soundEffects.playChatPop();
    });

    newSocket.on('game_started', ({ room, message }) => {
      setCurrentRoom(room);
      if (message) {
        setToastMessage({ type: 'info', text: message });
        setTimeout(() => setToastMessage(null), 4000);
      }
    });

    newSocket.on('game_paused', ({ room, message }) => {
      setCurrentRoom(room);
      if (message) {
        setToastMessage({ type: 'info', text: message });
        setTimeout(() => setToastMessage(null), 4000);
      }
    });

    newSocket.on('game_reset', ({ room, message }) => {
      setCurrentRoom(room);
      setLastDrawnNumber(null);
      setVictoryData(null);
      setAlarmMessage(null);
      setMarkedNumbers({});
      if (message) {
        setToastMessage({ type: 'info', text: message });
        setTimeout(() => setToastMessage(null), 4000);
      }
    });

    newSocket.on('auto_draw_changed', ({ intervalSeconds, room }) => {
      setCurrentRoom(room);
    });

    newSocket.on('error_message', (msg) => {
      setToastMessage({ type: 'error', text: msg });
      setTimeout(() => setToastMessage(null), 4000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Entrar em uma sala
  const joinRoom = (roomId) => {
    if (socket && user) {
      socket.emit('join_room', { roomId, user });
    }
  };

  // Solicitar nova cartela de 30 números
  const requestCard = () => {
    if (socket) {
      socket.emit('request_card');
      soundEffects.playCoin();
    }
  };

  // Controles do Moderador
  const startGame = () => {
    if (socket) socket.emit('start_game');
  };

  const pauseGame = () => {
    if (socket) socket.emit('pause_game');
  };

  const resetGame = () => {
    if (socket) socket.emit('reset_game');
  };

  const drawNumber = () => {
    if (socket) socket.emit('draw_number');
  };

  const setAutoDraw = (intervalSeconds) => {
    if (socket) socket.emit('set_auto_draw', { intervalSeconds });
  };

  // Ação de GRITAR BINGO! 🏴‍☠️
  const claimBingo = (cardId) => {
    if (socket) {
      socket.emit('claim_bingo', { cardId });
    }
  };

  // Chat
  const sendChat = (text) => {
    if (socket && text) {
      socket.emit('send_chat', { text });
    }
  };

  // Toggle marcação manual de número na cartela
  const toggleMarkNumber = (cardId, number) => {
    soundEffects.playStamp();
    setMarkedNumbers(prev => {
      const cardMarks = new Set(prev[cardId] || []);
      if (cardMarks.has(number)) {
        cardMarks.delete(number);
      } else {
        cardMarks.add(number);
      }
      return {
        ...prev,
        [cardId]: Array.from(cardMarks)
      };
    });
  };

  // Auto-marcar números sorteados
  const autoMarkDrawn = (cardId, cardNumbers, drawnNumbers) => {
    const drawnSet = new Set(drawnNumbers || []);
    const autoMatches = cardNumbers.filter(n => drawnSet.has(n));
    setMarkedNumbers(prev => ({
      ...prev,
      [cardId]: autoMatches
    }));
    soundEffects.playCoin();
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        currentRoom,
        myCards,
        markedNumbers,
        victoryData,
        alarmMessage,
        lastDrawnNumber,
        isCannonFiring,
        toastMessage,
        setVictoryData,
        setAlarmMessage,
        joinRoom,
        requestCard,
        startGame,
        pauseGame,
        resetGame,
        drawNumber,
        setAutoDraw,
        claimBingo,
        sendChat,
        toggleMarkNumber,
        autoMarkDrawn
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
