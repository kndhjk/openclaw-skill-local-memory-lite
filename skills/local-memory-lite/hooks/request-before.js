import { DEFAULTS } from '../src/config.js';
import { getStorage } from '../src/index.js';

function uniqueById(items) {
  const seen = new Set();
  return items.filter(item => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export default async function requestBefore(context) {
  try {
    const requestData = context?.requestData || context?.request || {};
    const query = requestData.prompt || requestData.query || requestData.message || requestData.body || '';
    if (!query || typeof query !== 'string') return;

    const storage = getStorage();
    const hits = storage.search(query, { limit: DEFAULTS.maxBeforeResults });
    const recent = hits.length < 3 ? storage.recent(DEFAULTS.maxRecentFallback) : [];
    const merged = uniqueById([...hits, ...recent]).slice(0, DEFAULTS.maxBeforeResults);
    if (!merged.length) return;

    requestData.context = requestData.context || {};
    requestData.context.local_memory = merged.map(m => ({
      type: m.memory_type,
      content: m.content,
      importance: m.importance,
      hits: m.hit_count,
      created_at: m.created_at
    }));
    requestData.context.local_memory_text = merged.map(m => `[${m.memory_type}] ${m.content}`).join('\n');
  } catch (err) {
    console.error('[local-memory-lite] request-before failed:', err.message);
  }
}
