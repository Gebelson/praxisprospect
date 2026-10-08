import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initSchema, seedInitialData } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory
const dataDir = path.resolve(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'praxis.db');
console.log(`[Database] Conectando ao SQLite em: ${dbPath}`);

export const db = new DatabaseSync(dbPath);

// Enable Foreign Keys & WAL mode for speed and integrity
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Database helper methods
export const query = <T = any>(sql: string, params: any[] = []): T[] => {
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
};

export const get = <T = any>(sql: string, params: any[] = []): T | undefined => {
  const stmt = db.prepare(sql);
  return stmt.get(...params) as T | undefined;
};

export const run = (sql: string, params: any[] = []): { changes: number; lastInsertRowid: number | bigint } => {
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return {
    changes: Number(result.changes),
    lastInsertRowid: result.lastInsertRowid,
  };
};

export const transaction = <T>(fn: () => T): T => {
  db.exec('BEGIN TRANSACTION;');
  try {
    const res = fn();
    db.exec('COMMIT;');
    return res;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
};

// Initialize schema & seeds
export const initDatabase = () => {
  initSchema(db);
  seedInitialData(db);
  console.log('[Database] Esquema relacional e sementes iniciais verificados com sucesso.');
};
