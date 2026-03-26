export const DEFAULTS = {
  maxBeforeResults: 6,
  maxRecentFallback: 3,
  minLineLength: 8,
  maxExtractedPerTurn: 6,
  ignorePatterns: [
    /^ok$/i,
    /^thanks?$/i,
    /^好的?$/,
    /^收到$/,
    /^嗯+$/,
    /^哈哈+$/,
    /^lol$/i,
    /^test(ing)?$/i
  ]
};

export function shouldIgnoreLine(line) {
  const s = String(line || '').trim();
  if (!s) return true;
  return DEFAULTS.ignorePatterns.some(re => re.test(s));
}

export function normalizeContent(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[“”"'`‘’]/g, '')
    .replace(/[，。！？!?,.:;；：]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractKeywords(text) {
  const raw = String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return Array.from(new Set(raw.filter(w => w.length >= 2))).slice(0, 16).join(' ');
}
