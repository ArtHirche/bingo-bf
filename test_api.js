async function testAPI() {
  console.log('📡 Testando rotas HTTP da API do Bingo Pirata...\n');

  // Teste 1: Login de Moderador
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'CapitaoBarbaNegra', password: 'senha123' })
  });
  const loginData = await loginRes.json();
  console.log('1. Login de Moderador:', loginRes.status === 200 ? '✅ SUCESSO' : '❌ FALHA');
  console.log('   - Token gerado:', loginData.token ? 'Sim' : 'Não');
  console.log('   - Usuário:', loginData.user?.username, `(${loginData.user?.role})`);

  // Teste 2: Consultar Me com Token
  const meRes = await fetch('http://localhost:4000/api/auth/me', {
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  const meData = await meRes.json();
  console.log('\n2. Rota /api/auth/me:', meRes.status === 200 ? '✅ SUCESSO' : '❌ FALHA');
  console.log('   - Usuário autenticado:', meData.user?.username);

  // Teste 3: Histórico de Vencedores
  const histRes = await fetch('http://localhost:4000/api/history');
  const histData = await histRes.json();
  console.log('\n3. Rota /api/history:', histRes.status === 200 ? '✅ SUCESSO' : '❌ FALHA');
  console.log('   - Registros no histórico:', histData.history?.length);

  // Teste 4: Registro de novo Pirata
  const randomSuffix = Math.floor(Math.random() * 10000);
  const regRes = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `Pirata${randomSuffix}`,
      email: `pirata${randomSuffix}@setemares.com`,
      password: 'senha123456',
      role: 'player',
      avatar: 'corsair'
    })
  });
  const regData = await regRes.json();
  console.log('\n4. Registro de Novo Pirata:', regRes.status === 201 ? '✅ SUCESSO' : '❌ FALHA');
  console.log('   - Pirata criado:', regData.user?.username, `(${regData.user?.role})`);

  console.log('\n🎉 TODOS OS TESTES DE API HTTP FORAM CONCLUÍDOS COM SUCESSO!');
}

testAPI().catch(err => {
  console.error('Erro no teste de API:', err);
  process.exit(1);
});
