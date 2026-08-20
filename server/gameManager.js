const db = require('./db');

class GameManager {
  constructor() {
    // Map de salas ativas na memória (sincronizadas com SQLite)
    this.rooms = new Map();
  }

  // Gera uma cartela clássica de 30 números (5 linhas x 6 colunas, intervalo 1-90)
  generate30NumberCard() {
    const columns = [
      { min: 1, max: 15 },   // Coluna 1
      { min: 16, max: 30 },  // Coluna 2
      { min: 31, max: 45 },  // Coluna 3
      { min: 46, max: 60 },  // Coluna 4
      { min: 61, max: 75 },  // Coluna 5
      { min: 76, max: 90 },  // Coluna 6
    ];

    const colNumbers = [];
    const allNumbers = [];

    columns.forEach(col => {
      const pool = [];
      for (let i = col.min; i <= col.max; i++) pool.push(i);
      // Embaralhar e pegar 5 números
      const selected = [];
      for (let i = 0; i < 5; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        selected.push(pool.splice(idx, 1)[0]);
      }
      selected.sort((a, b) => a - b);
      colNumbers.push(selected);
      allNumbers.push(...selected);
    });

    // Montar matriz 5x6
    const matrix = [];
    for (let r = 0; r < 5; r++) {
      const row = [];
      for (let c = 0; c < 6; c++) {
        row.push(colNumbers[c][r]);
      }
      matrix.push(row);
    }

    const serialNumber = 'TESOURO-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

    return {
      id: 'card_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      serialNumber,
      numbers: allNumbers.sort((a, b) => a - b),
      matrix,
      createdAt: new Date().toISOString()
    };
  }

  // Cria ou recupera uma sala
  getOrCreateRoom(roomId, roomName, moderator) {
    if (!this.rooms.has(roomId)) {
      // Verificar se já existe no SQLite
      const existing = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
      
      let drawnNumbers = [];
      let status = 'waiting';
      let autoDrawInterval = 0;
      let winnerName = null;

      if (existing) {
        try {
          drawnNumbers = JSON.parse(existing.drawn_numbers || '[]');
        } catch (e) {
          drawnNumbers = [];
        }
        status = existing.status;
        autoDrawInterval = existing.auto_draw_interval || 0;
        winnerName = existing.winner_name;
      } else {
        const insert = db.prepare(`
          INSERT INTO rooms (id, name, moderator_id, status, drawn_numbers, auto_draw_interval)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        insert.run(roomId, roomName || `Navio Jack Down ${roomId}`, moderator.id, 'waiting', '[]', 0);
      }

      this.rooms.set(roomId, {
        id: roomId,
        name: roomName || existing?.name || `Navio Jack Down ${roomId}`,
        moderatorId: moderator.id,
        moderatorName: moderator.username,
        moderatorAvatar: moderator.avatar,
        status,
        drawnNumbers,
        currentNumber: drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1] : null,
        autoDrawInterval,
        timer: null,
        players: new Map(), // socketId -> playerData
        chat: [],
        winner: winnerName ? { winnerName } : null,
        bingoMode: 'full_card' // 'full_card' (30 números) ou 'line' (linha completa)
      });
    }

    return this.rooms.get(roomId);
  }

  // Obter sala
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  // Iniciar partida
  startRoom(roomId, moderatorId) {
    const room = this.getRoom(roomId);
    if (!room || room.moderatorId !== moderatorId) return { error: 'Permissão negada ou sala inexistente.' };

    room.status = 'in_progress';
    room.winner = null;

    db.prepare('UPDATE rooms SET status = ?, winner_id = NULL, winner_name = NULL WHERE id = ?')
      .run('in_progress', roomId);

    return { success: true, room };
  }

  // Pausar partida
  pauseRoom(roomId, moderatorId) {
    const room = this.getRoom(roomId);
    if (!room || room.moderatorId !== moderatorId) return { error: 'Permissão negada.' };

    room.status = 'paused';
    if (room.timer) {
      clearInterval(room.timer);
      room.timer = null;
    }

    db.prepare('UPDATE rooms SET status = ? WHERE id = ?').run('paused', roomId);
    return { success: true, room };
  }

  // Resetar partida (nova rodada)
  resetRoom(roomId, moderatorId) {
    const room = this.getRoom(roomId);
    if (!room || room.moderatorId !== moderatorId) return { error: 'Permissão negada.' };

    if (room.timer) {
      clearInterval(room.timer);
      room.timer = null;
    }

    room.status = 'waiting';
    room.drawnNumbers = [];
    room.currentNumber = null;
    room.winner = null;

    // Resetar cartelas dos jogadores para novas cartelas
    for (const [socketId, player] of room.players.entries()) {
      if (player.cards && player.cards.length > 0) {
        player.cards = [this.generate30NumberCard()];
      }
    }

    db.prepare('UPDATE rooms SET status = ?, drawn_numbers = ?, winner_id = NULL, winner_name = NULL WHERE id = ?')
      .run('waiting', '[]', roomId);

    return { success: true, room };
  }

  // Sortear próximo número (1 a 90)
  drawNextNumber(roomId) {
    const room = this.getRoom(roomId);
    if (!room || (room.status !== 'in_progress' && room.status !== 'waiting')) {
      return { error: 'Partida não está ativa.' };
    }

    if (room.status === 'waiting') {
      room.status = 'in_progress';
      db.prepare('UPDATE rooms SET status = ? WHERE id = ?').run('in_progress', roomId);
    }

    if (room.drawnNumbers.length >= 90) {
      return { error: 'Todas as 90 pedras de canhão já foram sorteadas!' };
    }

    // Gerar lista de números disponíveis
    const drawnSet = new Set(room.drawnNumbers);
    const available = [];
    for (let i = 1; i <= 90; i++) {
      if (!drawnSet.has(i)) available.push(i);
    }

    const drawn = available[Math.floor(Math.random() * available.length)];
    room.drawnNumbers.push(drawn);
    room.currentNumber = drawn;

    // Salvar no SQLite
    db.prepare('UPDATE rooms SET drawn_numbers = ? WHERE id = ?')
      .run(JSON.stringify(room.drawnNumbers), roomId);

    return { success: true, drawn, totalDrawn: room.drawnNumbers.length, room };
  }

  // Validação de BINGO!
  claimBingo(roomId, userId, cardId) {
    const room = this.getRoom(roomId);
    if (!room) return { valid: false, message: 'Sala não encontrada!' };

    if (room.status === 'finished') {
      return { valid: false, message: 'Esta rodada já foi conquistada por outro capitão!' };
    }

    // Localizar jogador e cartela
    let foundCard = null;
    let foundPlayer = null;

    for (const [sId, player] of room.players.entries()) {
      if (player.userId === userId) {
        foundPlayer = player;
        foundCard = player.cards?.find(c => c.id === cardId || !cardId);
        break;
      }
    }

    if (!foundPlayer || !foundCard) {
      return { valid: false, message: 'Cartela do marujo não encontrada!' };
    }

    const drawnSet = new Set(room.drawnNumbers);
    const cardNumbers = foundCard.numbers; // Array de 30 números

    // Conferir quantos números da cartela foram sorteados
    const markedDrawnNumbers = cardNumbers.filter(n => drawnSet.has(n));
    const missingNumbers = cardNumbers.filter(n => !drawnSet.has(n));

    // Regra: Cartela Cheia (todos os 30 números sorteados)
    const isFullBingo = markedDrawnNumbers.length === 30;

    if (isFullBingo) {
      // Parar sorteio automático se houver
      if (room.timer) {
        clearInterval(room.timer);
        room.timer = null;
      }

      room.status = 'finished';
      const winnerAvatar = foundPlayer.avatar || 'sailor';
      const winnerData = {
        userId: foundPlayer.userId,
        username: foundPlayer.username,
        avatar: winnerAvatar,
        title: foundPlayer.title || 'Mestre dos Mares',
        cardSerial: foundCard.serialNumber,
        totalDrawn: room.drawnNumbers.length,
        timestamp: new Date().toISOString()
      };
      room.winner = winnerData;

      // Salvar no banco SQLite
      db.prepare('UPDATE rooms SET status = ?, winner_id = ?, winner_name = ? WHERE id = ?')
        .run('finished', foundPlayer.userId, foundPlayer.username, roomId);

      db.prepare(`
        INSERT INTO game_history (room_id, room_name, moderator_name, winner_name, winner_avatar, total_numbers_drawn, winning_card_serial)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        roomId,
        room.name,
        room.moderatorName,
        foundPlayer.username,
        winnerAvatar,
        room.drawnNumbers.length,
        foundCard.serialNumber
      );

      // Conceder 500 moedas de ouro ao vencedor
      try {
        db.prepare('UPDATE users SET coins = coins + 500 WHERE id = ?').run(foundPlayer.userId);
      } catch (e) {}

      return {
        valid: true,
        winner: winnerData,
        matchedCount: 30,
        totalRequired: 30,
        message: `ARRR! BINGO LEGÍTIMO! ${foundPlayer.username} conquistou o baú do tesouro!`
      };
    } else {
      return {
        valid: false,
        matchedCount: markedDrawnNumbers.length,
        totalRequired: 30,
        missingCount: missingNumbers.length,
        missingNumbers: missingNumbers.slice(0, 5), // Primeiros 5 que faltaram para dar feedback
        message: `Alarme falso, Marujo ${foundPlayer.username}! Faltam ${missingNumbers.length} pedras para o tesouro completo!`
      };
    }
  }

  // Serializa estado da sala para envio aos clientes
  serializeRoom(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const playersList = [];
    for (const [socketId, p] of room.players.entries()) {
      playersList.push({
        socketId,
        userId: p.userId,
        username: p.username,
        avatar: p.avatar,
        title: p.title,
        cardCount: p.cards ? p.cards.length : 0,
        coins: p.coins || 1000
      });
    }

    return {
      id: room.id,
      name: room.name,
      moderatorId: room.moderatorId,
      moderatorName: room.moderatorName,
      moderatorAvatar: room.moderatorAvatar,
      status: room.status,
      drawnNumbers: room.drawnNumbers,
      currentNumber: room.currentNumber,
      autoDrawInterval: room.autoDrawInterval,
      players: playersList,
      playerCount: playersList.length,
      winner: room.winner,
      chat: room.chat.slice(-30)
    };
  }
}

module.exports = new GameManager();
