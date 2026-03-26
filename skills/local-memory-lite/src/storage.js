import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { extractKeywords, normalizeContent } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class LocalMemoryStorage {
  constructor(dbPath) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  initialize() {
    const sql = readFileSync(join(__dirname, '../migrations/001-init.sql'), 'utf8');
    this.db.exec(sql);
  }

  upsertMemory({ memory_type = 'note', content, source = 'manual', session_id = null, keywords = '', importance = 0.5 }) {
    const normalized = normalizeContent(content);
    const finalKeywords = keywords || extractKeywords(content);
    const existing = this.db.prepare('SELECT * FROM memories WHERE normalized_content = ?').get(normalized);

    if (existing) {
      return this.db.prepare(`
        UPDATE memories
        SET importance = MAX(importance, ?),
            keywords = CASE WHEN IFNULL(keywords, '') = '' THEN ? ELSE keywords || ' ' || ? END,
            source = ?,
            session_id = COALESCE(?, session_id),
            hit_count = hit_count + 1,
            last_seen_at = CURRENT_TIMESTAMP
        WHERE normalized_content = ?
      `).run(importance, finalKeywords, finalKeywords, source, session_id, normalized);
    }

    return this.db.prepare(`
      INSERT INTO memories (memory_type, content, normalized_content, source, session_id, keywords, importance)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(memory_type, content, normalized, source, session_id, finalKeywords, importance);
  }

  search(text, { limit = 8, memoryType = null } = {}) {
    const q = `%${String(text || '').trim()}%`;
    const clauses = ['(content LIKE ? OR keywords LIKE ?)'];
    const params = [q, q];
    if (memoryType) {
      clauses.push('memory_type = ?');
      params.push(memoryType);
    }
    params.push(limit);
    return this.db.prepare(`
      SELECT * FROM memories
      WHERE ${clauses.join(' AND ')}
      ORDER BY importance DESC, hit_count DESC, last_seen_at DESC
      LIMIT ?
    `).all(...params);
  }

  recent(limit = 8, memoryType = null) {
    if (memoryType) {
      return this.db.prepare(`
        SELECT * FROM memories
        WHERE memory_type = ?
        ORDER BY last_seen_at DESC, importance DESC
        LIMIT ?
      `).all(memoryType, limit);
    }
    return this.db.prepare(`
      SELECT * FROM memories
      ORDER BY last_seen_at DESC, importance DESC
      LIMIT ?
    `).all(limit);
  }

  list({ limit = 20, memoryType = null } = {}) {
    return this.recent(limit, memoryType);
  }

  stats() {
    const total = this.db.prepare('SELECT COUNT(*) AS c FROM memories').get().c;
    const byType = this.db.prepare('SELECT memory_type, COUNT(*) AS c FROM memories GROUP BY memory_type ORDER BY c DESC').all();
    return { total, byType };
  }

  close() {
    this.db.close();
  }
}

export function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}
