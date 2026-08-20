const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'pirate_secret_black_pearl_777';
const COMMANDER_KEY = process.env.COMMANDER_KEY || 'capitao123';

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Nenhum token de pirata fornecido!' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado!' });
    }
    req.user = user;
    next();
  });
}

// 1. Entrada Rápida de Marujo (Apenas Nickname + Avatar)
router.post('/guest', (req, res) => {
  try {
    let { nickname, avatar } = req.body;

    if (!nickname || typeof nickname !== 'string' || !nickname.trim()) {
      return res.status(400).json({ error: 'Informe seu apelido pirata para subir a bordo!' });
    }

    nickname = nickname.trim().substring(0, 24);
    const selectedAvatar = avatar || 'sailor';
    const title = 'Marujo Black Flags';

    // Verificar se o usuário já existe
    let user = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE').get(nickname);

    if (!user) {
      const dummyEmail = `marujo_${Date.now()}_${Math.floor(Math.random() * 1000)}@setemares.local`;
      const dummyHash = bcrypt.hashSync('pirate_guest_pass', 8);

      const insert = db.prepare(`
        INSERT INTO users (username, email, password_hash, role, avatar, title, coins)
        VALUES (?, ?, ?, 'player', ?, ?, 1000)
      `);
      const result = insert.run(nickname, dummyEmail, dummyHash, selectedAvatar, title);
      user = {
        id: result.lastInsertRowid,
        username: nickname,
        role: 'player',
        avatar: selectedAvatar,
        title,
        coins: 1000
      };
    } else {
      // Se for jogador existente, atualizar avatar se selecionado
      if (user.role === 'player' && selectedAvatar && user.avatar !== selectedAvatar) {
        db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(selectedAvatar, user.id);
        user.avatar = selectedAvatar;
      }
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, avatar: user.avatar, title: user.title },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: `Bem-vindo a bordo do Jack Down, marujo ${user.username}! 🏴‍☠️`,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        title: user.title,
        coins: user.coins || 1000
      }
    });
  } catch (err) {
    console.error('Erro na entrada do marujo:', err);
    res.status(500).json({ error: 'Erro ao embarcar no navio.' });
  }
});

// 2. Acesso da Cabine do Comandante (Chave de Acesso Exclusiva)
router.post('/commander', (req, res) => {
  try {
    const { key, nickname } = req.body;

    if (!key || key.trim() !== COMMANDER_KEY) {
      return res.status(401).json({ error: 'Chave de comando inválida! Acesso restrito ao Capitão.' });
    }

    const captainName = (nickname && nickname.trim()) ? nickname.trim().substring(0, 24) : 'Capitão Barba-Negra';
    const captainAvatar = 'captain';
    const captainTitle = 'Terror dos Sete Mares';

    // Buscar ou criar o usuário Capitão
    let captain = db.prepare("SELECT * FROM users WHERE role = 'moderator' LIMIT 1").get();

    if (!captain) {
      const dummyEmail = 'capitao@pirata.com';
      const dummyHash = bcrypt.hashSync('capitao123', 8);

      const insert = db.prepare(`
        INSERT INTO users (username, email, password_hash, role, avatar, title, coins)
        VALUES (?, ?, ?, 'moderator', ?, ?, 5000)
      `);
      const result = insert.run(captainName, dummyEmail, dummyHash, captainAvatar, captainTitle);
      captain = {
        id: result.lastInsertRowid,
        username: captainName,
        role: 'moderator',
        avatar: captainAvatar,
        title: captainTitle,
        coins: 5000
      };
    } else if (nickname && nickname.trim() && captain.username !== captainName) {
      db.prepare('UPDATE users SET username = ? WHERE id = ?').run(captainName, captain.id);
      captain.username = captainName;
    }

    const token = jwt.sign(
      { id: captain.id, username: captain.username, role: 'moderator', avatar: captain.avatar, title: captain.title },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: `Saudações, Capitão ${captain.username}! A cabine de comando está sob seu controle. 👑`,
      token,
      user: {
        id: captain.id,
        username: captain.username,
        role: 'moderator',
        avatar: captain.avatar,
        title: captain.title,
        coins: captain.coins || 5000
      }
    });
  } catch (err) {
    console.error('Erro no acesso do comandante:', err);
    res.status(500).json({ error: 'Erro ao acessar a cabine de comando.' });
  }
});

// 3. Obter perfil atual através do token
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, role, avatar, title, coins, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Pirata não encontrado.' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar tripulante.' });
  }
});

// Compatibilidade legada (Login/Register opcionais)
router.post('/login', (req, res) => {
  const { login, password } = req.body;
  if (!login) return res.status(400).json({ error: 'Informe seu apelido.' });

  // Redireciona logicamente para guest login se não enviou senha complexa
  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(login, login);
  if (!user) {
    return res.status(401).json({ error: 'Pirata não encontrado.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, avatar: user.avatar, title: user.title },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    message: 'Acesso concedido!',
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      title: user.title,
      coins: user.coins
    }
  });
});

module.exports = {
  router,
  authenticateToken,
  JWT_SECRET,
  COMMANDER_KEY
};
