const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        telegram_id TEXT UNIQUE,
        email       TEXT UNIQUE,
        name        TEXT NOT NULL DEFAULT 'Пользователь',
        avatar      TEXT NOT NULL DEFAULT '🧘',
        theme       TEXT NOT NULL DEFAULT 'light',
        color_theme TEXT NOT NULL DEFAULT 'pink',
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS yoga_sessions (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date       TEXT    NOT NULL,
        difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 4),
        note       TEXT    NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, date)
      );

      CREATE TABLE IF NOT EXISTS notes (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content    TEXT    NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS otps (
        id         SERIAL PRIMARY KEY,
        email      TEXT        NOT NULL,
        code       TEXT        NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used       BOOLEAN     NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('PostgreSQL tables ready');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
