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
        id           SERIAL PRIMARY KEY,
        telegram_id  TEXT UNIQUE,
        email        TEXT UNIQUE,
        phone        TEXT UNIQUE,
        name         TEXT NOT NULL DEFAULT 'Пользователь',
        avatar       TEXT NOT NULL DEFAULT '🧘',
        theme        TEXT NOT NULL DEFAULT 'light',
        color_theme  TEXT NOT NULL DEFAULT 'pink',
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone        TEXT UNIQUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reminder_time TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reminder_on   BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_id       TEXT;

      CREATE TABLE IF NOT EXISTS yoga_sessions (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date       TEXT    NOT NULL,
        difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 4),
        note       TEXT    NOT NULL DEFAULT '',
        type       TEXT    NOT NULL DEFAULT 'general',
        duration   INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, date)
      );
      ALTER TABLE yoga_sessions ADD COLUMN IF NOT EXISTS type     TEXT    NOT NULL DEFAULT 'general';
      ALTER TABLE yoga_sessions ADD COLUMN IF NOT EXISTS duration INTEGER NOT NULL DEFAULT 0;

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

      CREATE TABLE IF NOT EXISTS user_progress (
        user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        xp         INTEGER NOT NULL DEFAULT 0,
        level      INTEGER NOT NULL DEFAULT 1,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code        TEXT    NOT NULL,
        unlocked_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, code)
      );

      CREATE TABLE IF NOT EXISTS user_programs (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        program_id TEXT    NOT NULL,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed  BOOLEAN NOT NULL DEFAULT FALSE,
        days_done  INTEGER NOT NULL DEFAULT 0,
        UNIQUE (user_id, program_id)
      );

            CREATE TABLE IF NOT EXISTS pose_favorites (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pose_id TEXT    NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, pose_id)
      );

      CREATE TABLE IF NOT EXISTS user_favorite_poses (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pose_id    TEXT    NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (user_id, pose_id)
      );

      CREATE INDEX IF NOT EXISTS idx_user_favorite_poses_user
        ON user_favorite_poses(user_id);

      CREATE TABLE IF NOT EXISTS user_program_days (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        program_id   TEXT    NOT NULL,
        day_num      INTEGER NOT NULL,
        completed_at TIMESTAMPTZ DEFAULT NOW(),
        duration_sec INTEGER NOT NULL DEFAULT 0,
        UNIQUE (user_id, program_id, day_num)
      );

      CREATE INDEX IF NOT EXISTS idx_user_program_days_user_program
        ON user_program_days(user_id, program_id);
    `);
    console.log('PostgreSQL tables ready');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
