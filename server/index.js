const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { router: authRouter } = require('./auth');
const setupSockets = require('./socketHandler');
const db = require('./db');

const app = express();
const server = http.createServer(app);

// CORS liberado para o cliente Vite
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Rotas de Autenticação
app.use('/api/auth', authRouter);

// Rota de Estatísticas e Histórico do Navio
app.get('/api/history', (req, res) => {
  try {
    const history = db.prepare('SELECT * FROM game_history ORDER BY completed_at DESC LIMIT 20').all();
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar o livro de bordo.' });
  }
});

// Rota de Salas Ativas
app.get('/api/rooms', (req, res) => {
  try {
    const rooms = db.prepare('SELECT id, name, status, created_at FROM rooms ORDER BY created_at DESC LIMIT 10').all();
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar navios ativos.' });
  }
});

// Servir arquivos estáticos do cliente compilado se existirem
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Servidor do Bingo Pirata está ativo na porta 4000. Inicie o cliente Vite em http://localhost:5173');
    }
  });
});

// Inicializar sockets
setupSockets(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🏴‍☠️ Navio Pirata ancorado e ouvindo na porta ${PORT}!`);
  console.log(`🎲 Servidor de Bingo pronto para os Sete Mares.`);
});
