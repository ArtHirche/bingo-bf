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
        bingoMode: 'line' // 'line' (linha horizontal, vertical ou diagonal)
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

  // Verifica todas as linhas (horizontais, verticais e diagonais) de uma matriz 5x6
  checkWinningLines(matrix, drawnNumbers) {
    const drawnSet = new Set(drawnNumbers);
    const rows = matrix.length; // 5 linhas
    const cols = matrix[0].length; // 6 colunas
    const allLines = [];

    // 1. Linhas Horizontais (5 linhas de 6 números)
    for (let r = 0; r < rows; r++) {
      const numbers = matrix[r];
      const drawn = numbers.filter(n => drawnSet.has(n));
      const missing = numbers.filter(n => !drawnSet.has(n));
      allLines.push({
        type: 'horizontal',
        name: `Linha Horizontal ${r + 1}`,
        numbers,
        drawnCount: drawn.length,
        totalRequired: cols,
        missingCount: missing.length,
        missingNumbers: missing,
        isComplete: missing.length === 0,
        indices: numbers.map((_, c) => ({ r, c }))
      });
    }

    // 2. Linhas Verticais / Colunas (6 colunas de 5 números)
    for (let c = 0; c < cols; c++) {
      const numbers = [];
      const indices = [];
      for (let r = 0; r < rows; r++) {
        numbers.push(matrix[r][c]);
        indices.push({ r, c });
      }
      const drawn = numbers.filter(n => drawnSet.has(n));
      const missing = numbers.filter(n => !drawnSet.has(n));
      allLines.push({
        type: 'vertical',
        name: `Coluna Vertical ${c + 1}`,
        numbers,
        drawnCount: drawn.length,
        totalRequired: rows,
        missingCount: missing.length,
        missingNumbers: missing,
        isComplete: missing.length === 0,
        indices
      });
    }

    // 3. Linhas Diagonais (4 diagonais possíveis de tamanho 5 em grade 5x6)
    // Diagonal Principal 1 (Colunas 0 a 4)
    const diag1 = [];
    const diag1Indices = [];
    for (let r = 0; r < rows; r++) {
      diag1.push(matrix[r][r]);
      diag1Indices.push({ r, c: r });
    }
    const diag1Drawn = diag1.filter(n => drawnSet.has(n));
    const diag1Missing = diag1.filter(n => !drawnSet.has(n));
    allLines.push({
      type: 'diagonal',
      name: 'Diagonal Principal (Esq ➔ Dir)',
      numbers: diag1,
      drawnCount: diag1Drawn.length,
      totalRequired: rows,
      missingCount: diag1Missing.length,
      missingNumbers: diag1Missing,
      isComplete: diag1Missing.length === 0,
      indices: diag1Indices
    });

    // Diagonal Principal 2 (Colunas 1 a 5)
    const diag2 = [];
    const diag2Indices = [];
    for (let r = 0; r < rows; r++) {
      diag2.push(matrix[r][r + 1]);
      diag2Indices.push({ r, c: r + 1 });
    }
    const diag2Drawn = diag2.filter(n => drawnSet.has(n));
    const diag2Missing = diag2.filter(n => !drawnSet.has(n));
    allLines.push({
      type: 'diagonal',
      name: 'Diagonal Secundária (Esq ➔ Dir)',
      numbers: diag2,
      drawnCount: diag2Drawn.length,
      totalRequired: rows,
      missingCount: diag2Missing.length,
      missingNumbers: diag2Missing,
      isComplete: diag2Missing.length === 0,
      indices: diag2Indices
    });

    // Diagonal Inversa 1 (Colunas 5 a 1)
    const anti1 = [];
    const anti1Indices = [];
    for (let r = 0; r < rows; r++) {
      const c = 5 - r;
      anti1.push(matrix[r][c]);
      anti1Indices.push({ r, c });
    }
    const anti1Drawn = anti1.filter(n => drawnSet.has(n));
    const anti1Missing = anti1.filter(n => !drawnSet.has(n));
    allLines.push({
      type: 'diagonal',
      name: 'Diagonal Inversa 1 (Dir ➔ Esq)',
      numbers: anti1,
      drawnCount: anti1Drawn.length,
      totalRequired: rows,
      missingCount: anti1Missing.length,
      missingNumbers: anti1Missing,
      isComplete: anti1Missing.length === 0,
      indices: anti1Indices
    });

    // Diagonal Inversa 2 (Colunas 4 a 0)
    const anti2 = [];
    const anti2Indices = [];
    for (let r = 0; r < rows; r++) {
      const c = 4 - r;
      anti2.push(matrix[r][c]);
      anti2Indices.push({ r, c });
    }
    const anti2Drawn = anti2.filter(n => drawnSet.has(n));
    const anti2Missing = anti2.filter(n => !drawnSet.has(n));
    allLines.push({
      type: 'diagonal',
      name: 'Diagonal Inversa 2 (Dir ➔ Esq)',
      numbers: anti2,
      drawnCount: anti2Drawn.length,
      totalRequired: rows,
      missingCount: anti2Missing.length,
      missingNumbers: anti2Missing,
      isComplete: anti2Missing.length === 0,
      indices: anti2Indices
    });

    const completedLines = allLines.filter(l => l.isComplete);
    // Ordenar linhas pela proximidade da conclusão (menor missingCount)
    allLines.sort((a, b) => a.missingCount - b.missingCount);
    const closestLine = allLines[0];

    return {
      hasBingo: completedLines.length > 0,
      completedLines,
      winningLine: completedLines[0] || null,
      closestLine,
      allLines
    };
  }

  // Validação de BINGO! (Regra: Completar qualquer linha horizontal, vertical ou diagonal)
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

    // Validar se há alguma linha perfeita completa (horizontal, vertical ou diagonal)
    const evaluation = this.checkWinningLines(foundCard.matrix, room.drawnNumbers);

    if (evaluation.hasBingo) {
      const winningLine = evaluation.winningLine;

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
        winningLine: winningLine.name,
        winningNumbers: winningLine.numbers,
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
        winningLine,
        matchedCount: winningLine.numbers.length,
        totalRequired: winningLine.totalRequired,
        message: `ARRR! BINGO LEGÍTIMO! ${foundPlayer.username} completou ${winningLine.name} (${winningLine.numbers.join(', ')})!`
      };
    } else {
      const best = evaluation.closestLine;
      return {
        valid: false,
        closestLine: best.name,
        missingCount: best.missingCount,
        missingNumbers: best.missingNumbers,
        matchedCount: best.drawnCount,
        totalRequired: best.totalRequired,
        message: `Alarme falso, Marujo ${foundPlayer.username}! Nenhuma linha completa. Falta(m) ${best.missingCount} pedra(s) na ${best.name}!`
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
