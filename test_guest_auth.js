const http = require('http');

function postJson(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method: 'POST',
      headers
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => { resBody += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, data: resBody });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path,
      method: 'GET',
      headers
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => { resBody += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, data: resBody });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🏴‍☠️ --- TESTANDO NOVO SISTEMA DE AUTENTICAÇÃO SIMPLIFICADA --- 🏴‍☠️\n');

  // 1. Testar entrada de marujo com Nickname
  console.log('1. Testando entrada rápida de Marujo por Nickname:');
  const guestRes = await postJson('/api/auth/guest', {
    nickname: 'Jack Olho de Vidro',
    avatar: 'parrot'
  });

  console.log('  Status:', guestRes.status);
  console.log('  Mensagem:', guestRes.data.message);
  console.log('  Usuário:', guestRes.data.user);
  if (guestRes.status === 200 && guestRes.data.user.role === 'player' && guestRes.data.token) {
    console.log('  ✅ Entrada de Marujo por Nickname: SUCESSO!\n');
  } else {
    throw new Error('Falha no teste de Marujo!');
  }

  // 2. Testar acesso do Comandante com Chave Incorreta
  console.log('2. Testando Comandante com Chave Incorreta:');
  const wrongKeyRes = await postJson('/api/auth/commander', {
    key: 'chave_errada',
    nickname: 'Falso Capitão'
  });
  console.log('  Status:', wrongKeyRes.status);
  console.log('  Erro recebido:', wrongKeyRes.data.error);
  if (wrongKeyRes.status === 401) {
    console.log('  ✅ Bloqueio de chave incorreta: SUCESSO!\n');
  } else {
    throw new Error('Falha no teste de bloqueio do comandante!');
  }

  // 3. Testar acesso do Comandante com Chave Correta
  console.log('3. Testando Comandante com Chave Correta (capitao123):');
  const captainRes = await postJson('/api/auth/commander', {
    key: 'capitao123',
    nickname: 'Capitão Barba-Negra'
  });
  console.log('  Status:', captainRes.status);
  console.log('  Mensagem:', captainRes.data.message);
  console.log('  Usuário:', captainRes.data.user);
  if (captainRes.status === 200 && captainRes.data.user.role === 'moderator' && captainRes.data.token) {
    console.log('  ✅ Acesso do Comandante: SUCESSO!\n');
  } else {
    throw new Error('Falha no acesso do comandante!');
  }

  // 4. Testar validação de token /api/auth/me
  console.log('4. Testando validação de token /api/auth/me:');
  const meMarujo = await getJson('/api/auth/me', guestRes.data.token);
  console.log('  Marujo /me:', meMarujo.data.user.username, `(${meMarujo.data.user.role})`);

  const meCaptain = await getJson('/api/auth/me', captainRes.data.token);
  console.log('  Comandante /me:', meCaptain.data.user.username, `(${meCaptain.data.user.role})`);

  if (meMarujo.status === 200 && meCaptain.status === 200) {
    console.log('  ✅ Validação de Tokens: SUCESSO!\n');
  }

  console.log('🎉 TODOS OS TESTES DE AUTENTICAÇÃO SIMPLIFICADA PASSARAM! 🎉');
}

runTests().catch(err => {
  console.error('❌ Erro durante os testes:', err);
  process.exit(1);
});
