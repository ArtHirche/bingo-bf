const gameManager = require('./server/gameManager');
const db = require('./server/db');
const bcrypt = require('bcryptjs');

console.log('🏴‍☠️ --- INICIANDO TESTES DO BINGO PIRATA --- 🏴‍☠️\n');

// 1. Testar Geração de Cartela de 30 Números
console.log('1. Testando Cartela de 30 Números:');
const card = gameManager.generate30NumberCard();
console.log('  - Serial da Cartela:', card.serialNumber);
console.log('  - Quantidade total de números:', card.numbers.length);
console.log('  - Linhas da matriz (5x6):', card.matrix.length, 'linhas x', card.matrix[0].length, 'colunas');
console.log('  - Números gerados:', card.numbers.join(', '));

if (card.numbers.length !== 30) {
  throw new Error('Falha: Cartela não tem 30 números!');
}
if (new Set(card.numbers).size !== 30) {
  throw new Error('Falha: Números duplicados na cartela!');
}
console.log('  ✅ Validação da Cartela: OK!\n');

// 2. Testar Banco de Dados SQLite
console.log('2. Testando Usuários Pré-configurados no Banco SQLite:');
const users = db.prepare('SELECT id, username, email, role, coins FROM users').all();
console.table(users);
console.log('  ✅ Banco de Dados SQLite: OK!\n');

// 3. Testar Fluxo de Sala e Sorteio de Canhão
console.log('3. Testando Sala e Sorteio de Pedras (1 a 90):');
const mod = users.find(u => u.role === 'moderator');
const room = gameManager.getOrCreateRoom('TESTE-SALA-PIRATA', 'Navio de Teste', mod);
console.log('  - Sala criada:', room.id, '| Moderador:', room.moderatorName);

gameManager.startRoom(room.id, mod.id);
console.log('  - Status da sala após iniciar:', room.status);

// Sortear 10 pedras
for (let i = 1; i <= 10; i++) {
  const drawRes = gameManager.drawNextNumber(room.id);
  console.log(`  - Disparo ${i}: Pedra número [${drawRes.drawn}] (Total sorteadas: ${drawRes.totalDrawn})`);
}
console.log('  ✅ Sorteio de Pedras: OK!\n');

// 4. Testar Validação de BINGO por Linha (Alarme Falso vs Horizontal vs Vertical vs Diagonal)
console.log('4. Testando Validação de BINGO por Linha:');
const playerUser = users.find(u => u.role === 'player');
room.players.set('socket_fake_test', {
  socketId: 'socket_fake_test',
  userId: playerUser.id,
  username: playerUser.username,
  cards: [card]
});

// Teste 4.1: Alarme Falso (poucas pedras sorteadas, nenhuma linha completa)
room.drawnNumbers = [999]; // Apenas número inexistente
const falseClaim = gameManager.claimBingo(room.id, playerUser.id, card.id);
console.log('  - 4.1 Tentativa de Bingo prematuro (Alarme Falso):');
console.log('    * Válido?', falseClaim.valid);
console.log('    * Mensagem:', falseClaim.message);

if (falseClaim.valid === true) {
  throw new Error('Falha: Bingo falso foi aceito incorretamente!');
}
console.log('  ✅ Alarme Falso detectado com sucesso!\n');

// Teste 4.2: Bingo com Linha Horizontal 1 (6 números da linha 0 da matriz)
console.log('  - 4.2 Testando Vitória por Linha Horizontal 1:');
room.status = 'in_progress';
room.drawnNumbers = [...card.matrix[0]]; // Linha 0 completa
const horizClaim = gameManager.claimBingo(room.id, playerUser.id, card.id);
console.log('    * Válido?', horizClaim.valid);
console.log('    * Mensagem:', horizClaim.message);
console.log('    * Linha:', horizClaim.winningLine?.name);

if (horizClaim.valid !== true || horizClaim.winningLine?.type !== 'horizontal') {
  throw new Error('Falha: Linha Horizontal não validou o Bingo!');
}
console.log('  ✅ Vitória por Linha Horizontal validada com sucesso!\n');

// Teste 4.3: Bingo com Coluna Vertical 1 (5 números da coluna 0 da matriz)
console.log('  - 4.3 Testando Vitória por Coluna Vertical 1:');
room.status = 'in_progress';
room.drawnNumbers = [card.matrix[0][0], card.matrix[1][0], card.matrix[2][0], card.matrix[3][0], card.matrix[4][0]];
const vertClaim = gameManager.claimBingo(room.id, playerUser.id, card.id);
console.log('    * Válido?', vertClaim.valid);
console.log('    * Mensagem:', vertClaim.message);
console.log('    * Coluna:', vertClaim.winningLine?.name);

if (vertClaim.valid !== true || vertClaim.winningLine?.type !== 'vertical') {
  throw new Error('Falha: Coluna Vertical não validou o Bingo!');
}
console.log('  ✅ Vitória por Coluna Vertical validada com sucesso!\n');

// Teste 4.4: Bingo com Linha Diagonal Principal (5 números diagonais)
console.log('  - 4.4 Testando Vitória por Linha Diagonal:');
room.status = 'in_progress';
room.drawnNumbers = [card.matrix[0][0], card.matrix[1][1], card.matrix[2][2], card.matrix[3][3], card.matrix[4][4]];
const diagClaim = gameManager.claimBingo(room.id, playerUser.id, card.id);
console.log('    * Válido?', diagClaim.valid);
console.log('    * Mensagem:', diagClaim.message);
console.log('    * Diagonal:', diagClaim.winningLine?.name);

if (diagClaim.valid !== true || diagClaim.winningLine?.type !== 'diagonal') {
  throw new Error('Falha: Linha Diagonal não validou o Bingo!');
}
console.log('  ✅ Vitória por Linha Diagonal validada com sucesso!\n');

console.log('🎉 TODOS OS TESTES DE LINHA PASSARAM COM SUCESSO ABSOLUTO! 🎉');
