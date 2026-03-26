import { homedir } from 'os';
import { join } from 'path';
import { DEFAULTS, extractKeywords, normalizeContent, shouldIgnoreLine } from './config.js';
import { LocalMemoryStorage, ensureDir } from './storage.js';

let storage;

export function getStorage() {
  if (!storage) {
    const dataDir = process.env.LOCAL_MEMORY_LITE_DIR || join(homedir(), '.openclaw', 'local-memory-lite');
    ensureDir(dataDir);
    storage = new LocalMemoryStorage(join(dataDir, 'memory.db'));
    storage.initialize();
  }
  return storage;
}

export function classifyLine(line) {
  const lower = String(line).toLowerCase();
  if (/喜欢|偏好|prefer|usually|always|不要|别|short reply|少废话|直接一点/.test(lower)) {
    return { type: 'preference', importance: 0.85 };
  }
  if (/项目|project|repo|仓库|正在做|working on|termux|openclaw/.test(lower)) {
    return { type: 'project', importance: 0.74 };
  }
  if (/记住|remember|我叫|name is|timezone|时区|住在|email|邮箱|whatsapp|telegram/.test(lower)) {
    return { type: 'fact', importance: 0.88 };
  }
  if (/todo|待办|要做|稍后|之后/.test(lower)) {
    return { type: 'todo', importance: 0.78 };
  }
  return { type: 'note', importance: 0.52 };
}

export function extractMemories(text = '') {
  const lines = String(text)
    .split(/[\n。！？!?]/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 20);

  const out = [];
  const seen = new Set();
  for (const line of lines) {
    if (line.length < DEFAULTS.minLineLength) continue;
    if (shouldIgnoreLine(line)) continue;

    const normalized = normalizeContent(line);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);

    const { type, importance } = classifyLine(line);
    if (type === 'note' && line.length < 18) continue;

    out.push({
      memory_type: type,
      content: line,
      keywords: extractKeywords(line),
      importance
    });

    if (out.length >= DEFAULTS.maxExtractedPerTurn) break;
  }
  return out;
}
