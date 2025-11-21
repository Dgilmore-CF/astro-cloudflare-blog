-- Additional tables for authentication and admin features
-- Run this after the base schema.sql

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK(role IN ('admin', 'editor', 'viewer')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login TEXT
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Full-text search virtual table for posts
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
  title,
  content,
  excerpt,
  content='posts',
  content_rowid='id'
);

-- Triggers to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS posts_ai AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts(rowid, title, content, excerpt)
  VALUES (new.id, new.title, new.content, new.excerpt);
END;

CREATE TRIGGER IF NOT EXISTS posts_ad AFTER DELETE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, content, excerpt)
  VALUES('delete', old.id, old.title, old.content, old.excerpt);
END;

CREATE TRIGGER IF NOT EXISTS posts_au AFTER UPDATE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, content, excerpt)
  VALUES('delete', old.id, old.title, old.content, old.excerpt);
  INSERT INTO posts_fts(rowid, title, content, excerpt)
  VALUES (new.id, new.title, new.content, new.excerpt);
END;
