import { extractMemories, getStorage } from '../src/index.js';

export default async function requestAfter(context) {
  try {
    const request = context?.request || context?.requestData || {};
    const response = context?.response || {};
    const sessionId = request.sessionId || context?.requestId || null;
    const userText = request.prompt || request.query || request.message || request.body || '';
    const agentText = response.content || response.text || response.message || '';
    const combined = [userText, agentText].filter(Boolean).join('\n');
    if (!combined.trim()) return;

    const storage = getStorage();
    for (const item of extractMemories(combined)) {
      storage.upsertMemory({ ...item, source: 'hook', session_id: sessionId });
    }
  } catch (err) {
    console.error('[local-memory-lite] request-after failed:', err.message);
  }
}
