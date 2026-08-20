const { io } = require('./client/node_modules/socket.io-client');

async function testSockets() {
  console.log('⚓ Testando regras atualizadas (Sala Única JACK-DOWN, Limite 2 Cartelas, 1 ADM)...\n');

  const serverUrl = 'http://localhost:4000';

  // 1. Conectar Capitão e Marujo
  const captainSocket = io(serverUrl, { transports: ['websocket'] });
  const sailorSocket = io(serverUrl, { transports: ['websocket'] });

  await new Promise((resolve) => {
    let connectedCount = 0;
    captainSocket.on('connect', () => {
      console.log('1. Capitão conectado ao socket:', captainSocket.id);
      connectedCount++;
      if (connectedCount === 2) resolve();
    });
    sailorSocket.on('connect', () => {
      console.log('2. Marujo conectado ao socket:', sailorSocket.id);
      connectedCount++;
      if (connectedCount === 2) resolve();
    });
  });

  // 2. Entrar na sala única JACK-DOWN
  const captainUser = { id: 1, username: 'CapitaoBarbaNegra', role: 'moderator', avatar: 'captain' };
  const sailorUser = { id: 2, username: 'MarujoJack', role: 'player', avatar: 'sailor' };

  captainSocket.emit('join_room', { roomId: 'JACK-DOWN', user: captainUser });
  sailorSocket.emit('join_room', { roomId: 'JACK-DOWN', user: sailorUser });

  let sailorCards = [];

  await new Promise((resolve) => {
    sailorSocket.on('room_joined', ({ room, myCards }) => {
      console.log('3. Marujo entrou na sala única:', room.id, '| Nome:', room.name);
      console.log('   - Quantidade inicial de cartelas:', myCards.length);
      console.log('   - Serial da 1ª cartela:', myCards[0]?.serialNumber);
      sailorCards = myCards;
      resolve();
    });
  });

  // 3. Testar solicitação da 2ª cartela (permitida)
  sailorSocket.emit('request_card');

  await new Promise((resolve) => {
    sailorSocket.once('cards_updated', (cards) => {
      console.log('4. 2ª Cartela solicitada com sucesso! Total de cartelas:', cards.length);
      sailorCards = cards;
      if (cards.length !== 2) throw new Error('Deveria ter 2 cartelas!');
      resolve();
    });
  });

  // 4. Testar solicitação da 3ª cartela (deve ser BLOQUEADA pelo servidor)
  await new Promise((resolve) => {
    sailorSocket.once('error_message', (msg) => {
      console.log('5. Tentativa de 3ª cartela bloqueada corretamente:', msg);
      resolve();
    });
    sailorSocket.emit('request_card');
  });

  // 5. Capitão inicia partida e dispara canhão
  captainSocket.emit('start_game');
  captainSocket.emit('draw_number');

  await new Promise((resolve) => {
    sailorSocket.once('number_drawn', (data) => {
      console.log('6. Marujo recebeu pedra sorteada pelo Capitão:', data.number);
      resolve();
    });
  });

  // 6. Marujo envia chat
  sailorSocket.emit('send_chat', { text: 'Tudo pronto no Jack Down, Capitão!' });

  await new Promise((resolve) => {
    captainSocket.once('chat_message', (msg) => {
      console.log('7. Chat recebido no navio:', msg.sender, '->', msg.text);
      resolve();
    });
  });

  console.log('\n🎉 TODOS OS TESTES DAS NOVAS REGRAS (SALA ÚNICA, MÁX 2 CARTELAS, 1 ADM) PASSARAM! 🎉');

  captainSocket.disconnect();
  sailorSocket.disconnect();
  process.exit(0);
}

testSockets().catch((err) => {
  console.error('Erro no teste de Socket:', err);
  process.exit(1);
});
