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

// 4. Testar Validação de BINGO! (Alarme Falso vs Bingo Real)
console.log('4. Testando Validação de BINGO:');
const playerUser = users.find(u => u.role === 'player');
// Adicionar jogador à sala com a cartela de teste
room.players.set('socket_fake_123', {
  socketId: 'socket_fake_123',
  userId: playerUser.id,
  username: playerUser.username,
  cards: [card]
});

// Teste 4.1: Alarme Falso (apenas 10 pedras foram sorteadas)
const falseClaim = gameManager.claimBingo(room.id, playerUser.id, card.id);
console.log('  - Tentativa de Bingo prematuro (Alarme Falso):');
console.log('    * Válido?', falseClaim.valid);
console.log('    * Mensagem:', falseClaim.message);
console.log('    * Pedras acertadas:', falseClaim.matchedCount, '/ 30');

if (falseClaim.valid === true) {
  throw new Error('Falha: Bingo falso foi aceito incorretamente!');
}
console.log('  ✅ Alarme Falso detectado com sucesso!\n');

// Teste 4.2: Bingo Real (simular que todos os 30 números da cartela foram sorteados)
console.log('  - Simulando sorteio de todas as pedras da cartela...');
card.numbers.forEach(num => {
  if (!room.drawnNumbers.includes(num)) {
    room.drawnNumbers.push(num);
  }
});
const realClaim = gameManager.claimBingo(room.id, playerUser.id, card.id);
console.log('  - Tentativa de Bingo com 30 pedras completas:');
console.log('    * Válido?', realClaim.valid);
console.log('    * Mensagem:', realClaim.message);
console.log('    * Vencedor registrado:', realClaim.winner?.username);

if (realClaim.valid !== true) {
  throw new Error('Falha: Bingo legítimo não foi validado!');
}
console.log('  ✅ Bingo Legítimo validado com glória pirata!\n');

console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO ABSOLUTO! 🎉');
