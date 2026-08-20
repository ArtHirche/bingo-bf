const gameManager = require('./gameManager');
const db = require('./db');

function setupSockets(io) {
  io.on('connection', (socket) => {
    let currentRoomId = null;
    let currentUser = null;

    const SINGLE_ROOM_ID = 'JACK-DOWN';

    // Entrar na sala única do Jack Down
    socket.on('join_room', ({ roomId, user }) => {
      if (!user) return;

      // Forçar sempre a sala única oficial do navio
      currentRoomId = SINGLE_ROOM_ID;
      currentUser = user;
      socket.join(`room_${SINGLE_ROOM_ID}`);

      let room;
      if (user.role === 'moderator') {
        room = gameManager.getOrCreateRoom(SINGLE_ROOM_ID, 'Navio Jack Down - Black Flags', user);
      } else {
        // Obter ou criar sala oficial gerenciada pelo Capitão
        room = gameManager.getOrCreateRoom(SINGLE_ROOM_ID, 'Navio Jack Down - Black Flags', {
          id: 1,
          username: 'Capitão Barba-Negra',
          avatar: 'captain'
        });
      }

      // Se for jogador, registrar e garantir 1ª cartela
      let playerCards = [];
      if (user.role === 'player') {
        let player = room.players.get(socket.id);
        if (!player) {
          // Gerar primeira cartela de 30 números
          const initialCard = gameManager.generate30NumberCard();
          player = {
            socketId: socket.id,
            userId: user.id,
            username: user.username,
            avatar: user.avatar,
            title: user.title,
            coins: user.coins || 1000,
            cards: [initialCard]
          };
          room.players.set(socket.id, player);
        }
        playerCards = player.cards;
      }

      // Enviar confirmação de entrada e estado inicial
      socket.emit('room_joined', {
        room: gameManager.serializeRoom(SINGLE_ROOM_ID),
        myCards: playerCards
      });

      // Notificar todos na sala única
      io.to(`room_${SINGLE_ROOM_ID}`).emit('room_updated', gameManager.serializeRoom(SINGLE_ROOM_ID));
    });

    // Marujo solicita 2ª cartela de 30 números (Máximo 2 cartelas por jogador)
    socket.on('request_card', () => {
      if (!currentRoomId || !currentUser) return;
      const room = gameManager.getRoom(currentRoomId);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (player) {
        if (player.cards.length >= 2) {
          socket.emit('error_message', 'Limite atingido! Cada marujo pode ter no máximo 2 cartelas no Jack Down.');
          return;
        }
        const newCard = gameManager.generate30NumberCard();
        player.cards.push(newCard);

        socket.emit('cards_updated', player.cards);
        io.to(`room_${currentRoomId}`).emit('room_updated', gameManager.serializeRoom(currentRoomId));
      }
    });

    // Capitão inicia partida
    socket.on('start_game', () => {
      if (!currentRoomId || !currentUser || currentUser.role !== 'moderator') return;
      const result = gameManager.startRoom(currentRoomId, currentUser.id);
      if (result.success) {
        io.to(`room_${currentRoomId}`).emit('game_started', {
          room: gameManager.serializeRoom(currentRoomId),
          message: '⚓ O Capitão deu o sinal! A rodada de Bingo começou!'
        });
      }
    });

    // Capitão pausa partida
    socket.on('pause_game', () => {
      if (!currentRoomId || !currentUser || currentUser.role !== 'moderator') return;
      const result = gameManager.pauseRoom(currentRoomId, currentUser.id);
      if (result.success) {
        io.to(`room_${currentRoomId}`).emit('game_paused', {
          room: gameManager.serializeRoom(currentRoomId),
          message: '⏸️ Partida pausada pelo Capitão!'
        });
      }
    });

    // Capitão reinicia partida (Nova Rodada)
    socket.on('reset_game', () => {
      if (!currentRoomId || !currentUser || currentUser.role !== 'moderator') return;
      const result = gameManager.resetRoom(currentRoomId, currentUser.id);
      if (result.success) {
        // Enviar novas cartelas para cada jogador
        const room = gameManager.getRoom(currentRoomId);
        for (const [socketId, player] of room.players.entries()) {
          io.to(socketId).emit('cards_updated', player.cards);
        }

        io.to(`room_${currentRoomId}`).emit('game_reset', {
          room: gameManager.serializeRoom(currentRoomId),
          message: '🔄 Um novo mapa do tesouro foi traçado! Nova rodada pronta!'
        });
      }
    });

    // Capitão sorteia número manual
    socket.on('draw_number', () => {
      if (!currentRoomId || !currentUser || currentUser.role !== 'moderator') return;
      const result = gameManager.drawNextNumber(currentRoomId);
      if (result.success) {
        io.to(`room_${currentRoomId}`).emit('number_drawn', {
          number: result.drawn,
          totalDrawn: result.totalDrawn,
          drawnNumbers: result.room.drawnNumbers,
          room: gameManager.serializeRoom(currentRoomId)
        });
      } else if (result.error) {
        socket.emit('error_message', result.error);
      }
    });

    // Capitão configura sorteio automático
    socket.on('set_auto_draw', ({ intervalSeconds }) => {
      if (!currentRoomId || !currentUser || currentUser.role !== 'moderator') return;
      const room = gameManager.getRoom(currentRoomId);
      if (!room) return;

      // Limpar timer anterior
      if (room.timer) {
        clearInterval(room.timer);
        room.timer = null;
      }

      room.autoDrawInterval = intervalSeconds;

      if (intervalSeconds > 0) {
        if (room.status === 'waiting') {
          gameManager.startRoom(currentRoomId, currentUser.id);
        }

        room.timer = setInterval(() => {
          const result = gameManager.drawNextNumber(currentRoomId);
          if (result.success) {
            io.to(`room_${currentRoomId}`).emit('number_drawn', {
              number: result.drawn,
              totalDrawn: result.totalDrawn,
              drawnNumbers: result.room.drawnNumbers,
              room: gameManager.serializeRoom(currentRoomId)
            });
          } else {
            // Parar se terminou os 90 números
            clearInterval(room.timer);
            room.timer = null;
            room.autoDrawInterval = 0;
            io.to(`room_${currentRoomId}`).emit('room_updated', gameManager.serializeRoom(currentRoomId));
          }
        }, intervalSeconds * 1000);
      }

      io.to(`room_${currentRoomId}`).emit('auto_draw_changed', {
        intervalSeconds,
        room: gameManager.serializeRoom(currentRoomId)
      });
    });

    // Jogador GRITA BINGO! 🏴‍☠️
    socket.on('claim_bingo', ({ cardId }) => {
      if (!currentRoomId || !currentUser) return;
      const room = gameManager.getRoom(currentRoomId);
      if (!room) return;

      const result = gameManager.claimBingo(currentRoomId, currentUser.id, cardId);

      if (result.valid) {
        // BINGO REAL! Anunciar vitória épica para toda a sala
        io.to(`room_${currentRoomId}`).emit('bingo_winner', {
          winner: result.winner,
          message: result.message,
          room: gameManager.serializeRoom(currentRoomId)
        });
      } else {
        // Alarme falso! Notificar o jogador e enviar mensagem divertida no chat
        socket.emit('bingo_false_alarm', {
          matchedCount: result.matchedCount,
          totalRequired: result.totalRequired,
          missingCount: result.missingCount,
          missingNumbers: result.missingNumbers,
          message: result.message
        });

        // Broadcast de alarme falso no navio
        io.to(`room_${currentRoomId}`).emit('chat_message', {
          id: 'sys_' + Date.now(),
          sender: 'Papagaio de Vigia',
          avatar: 'parrot',
          text: `🦜 ALARME FALSO! O marujo ${currentUser.username} gritou bingo antes da hora! Restam pedras no mapa!`,
          isSystem: true,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    });

    // Chat Pirata da Sala
    socket.on('send_chat', ({ text }) => {
      if (!currentRoomId || !currentUser || !text) return;
      const room = gameManager.getRoom(currentRoomId);
      if (!room) return;

      const chatMsg = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        sender: currentUser.username,
        avatar: currentUser.avatar,
        role: currentUser.role,
        text: text.trim().substring(0, 150),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      room.chat.push(chatMsg);
      if (room.chat.length > 50) room.chat.shift();

      io.to(`room_${currentRoomId}`).emit('chat_message', chatMsg);
    });

    // Desconexão
    socket.on('disconnect', () => {
      if (currentRoomId) {
        const room = gameManager.getRoom(currentRoomId);
        if (room) {
          room.players.delete(socket.id);
          io.to(`room_${currentRoomId}`).emit('room_updated', gameManager.serializeRoom(currentRoomId));
        }
      }
    });
  });
}

module.exports = setupSockets;
