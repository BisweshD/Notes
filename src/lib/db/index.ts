import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

function getDbPath(): string {
  const dbUrl = process.env.DATABASE_URL || './data/psychiatry.db';
  // Resolve relative paths from project root
  return path.isAbsolute(dbUrl) ? dbUrl : path.resolve(process.cwd(), dbUrl);
}

function createConnection() {
  const dbPath = getDbPath();

  // Ensure the directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(dbPath);

  // Enable WAL mode for concurrent reads during writes
  sqlite.pragma('journal_mode = WAL');
  // Enforce foreign key constraints
  sqlite.pragma('foreign_keys = ON');
  // Recommended for WAL mode performance
  sqlite.pragma('synchronous = NORMAL');
  // Set busy timeout (5 seconds) for concurrent access
  sqlite.pragma('busy_timeout = 5000');

  return drizzle(sqlite, { schema });
}

// Singleton database instance
let _db: ReturnType<typeof createConnection> | null = null;

export function getDb() {
  if (!_db) {
    _db = createConnection();
  }
  return _db;
}

// For testing: allow resetting the connection
export function resetDb() {
  _db = null;
}

// Export the database type for use in repositories
export type AppDatabase = ReturnType<typeof getDb>;
