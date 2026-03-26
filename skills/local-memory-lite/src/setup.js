import { homedir } from 'os';
import { join } from 'path';
import { getStorage } from './index.js';

const dataDir = process.env.LOCAL_MEMORY_LITE_DIR || join(homedir(), '.openclaw', 'local-memory-lite');
const dbPath = join(dataDir, 'memory.db');
const storage = getStorage();
const stats = storage.stats();
console.log('✅ local-memory-lite ready');
console.log(`📂 ${dbPath}`);
console.log(`🧠 memories: ${stats.total}`);
console.log('🔌 Hooks: request-before, request-after');
console.log('💡 CLI: node src/cli.js add|search|recent|stats');
storage.close();
