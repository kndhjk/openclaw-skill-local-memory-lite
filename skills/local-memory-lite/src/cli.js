#!/usr/bin/env node
import { getStorage } from './index.js';

const storage = getStorage();
const [cmd, ...rest] = process.argv.slice(2);

if (cmd === 'add') {
  const text = rest.join(' ').trim();
  if (!text) {
    console.error('usage: node src/cli.js add <text>');
    process.exit(1);
  }
  storage.upsertMemory({ content: text, memory_type: 'manual', source: 'cli', keywords: text.toLowerCase(), importance: 0.9 });
  console.log('ok');
} else if (cmd === 'search') {
  const q = rest.join(' ').trim();
  console.log(JSON.stringify(storage.search(q), null, 2));
} else if (cmd === 'recent') {
  const limit = Number(rest[0] || 8);
  const memoryType = rest[1] || null;
  console.log(JSON.stringify(storage.recent(limit, memoryType), null, 2));
} else if (cmd === 'list') {
  const limit = Number(rest[0] || 20);
  const memoryType = rest[1] || null;
  console.log(JSON.stringify(storage.list({ limit, memoryType }), null, 2));
} else if (cmd === 'stats') {
  console.log(JSON.stringify(storage.stats(), null, 2));
} else {
  console.log('commands: add | search | recent | list | stats');
}

storage.close();
