const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'bingo.db');
const db = new Database(dbPath);

// Ativar chaves estrangeiras e WAL mode para alta performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  // Tabela de Usuários
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('moderator', 'player')),
      avatar TEXT NOT NULL DEFAULT 'captain_1',
      title TEXT NOT NULL DEFAULT 'Grumete',
      coins INTEGER NOT NULL DEFAULT 1000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabela de Partidas/Salas
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      moderator_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting', 'in_progress', 'paused', 'finished')),
      drawn_numbers TEXT NOT NULL DEFAULT '[]',
      auto_draw_interval INTEGER NOT NULL DEFAULT 0,
      winner_id INTEGER,
      winner_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (moderator_id) REFERENCES users(id)
    );
  `);

  // Tabela de Cartelas de Jogadores
  db.exec(`
    CREATE TABLE IF NOT EXISTS player_cards (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      numbers_json TEXT NOT NULL,
      serial_number TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Tabela de Histórico de Vencedores
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id TEXT NOT NULL,
      room_name TEXT NOT NULL,
      moderator_name TEXT NOT NULL,
      winner_name TEXT NOT NULL,
      winner_avatar TEXT NOT NULL,
      total_numbers_drawn INTEGER NOT NULL,
      winning_card_serial TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Criar contas padrão para teste rápido se o banco estiver vazio
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const defaultPassword = bcrypt.hashSync('senha123', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password_hash, role, avatar, title, coins)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Moderador / Capitão
    insertUser.run(
      'CapitaoBarbaNegra',
      'capitao@pirata.com',
      defaultPassword,
      'moderator',
      'captain',
      'Terror dos Sete Mares',
      5000
    );

    // Jogadores / Marujos
    insertUser.run(
      'MarujoJack',
      'marujo@pirata.com',
      defaultPassword,
      'player',
      'sailor',
      'Lobo do Mar',
      1200
    );

    insertUser.run(
      'AnneBonny',
      'anne@pirata.com',
      defaultPassword,
      'player',
      'pirate_queen',
      'Rainha dos Corsários',
      2500
    );

    console.log('⚓ Banco de dados inicializado com piratas lendários!');
  }
}

initDb();

module.exports = db;
