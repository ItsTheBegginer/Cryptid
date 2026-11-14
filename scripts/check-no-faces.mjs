// Fails (exit 1) if presentation code or public assets contain face-related terms.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src/presentation', 'public'];
const EXT = new Set(['.ts', '.tsx', '.css', '.svg', '.html', '.json', '.js']);
const BANNED = /\b(eyes?|eyeball|eyebrows?|face|faces|facial|mouth|pupils?|iris|smile|grin|nostrils?|teeth)\b/i;

let violations = 0;
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (BANNED.test(name)) { console.error(`BANNED NAME: ${p}`); violations++; }
    if (!EXT.has(extname(p))) continue;
    readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
      if (BANNED.test(line)) { console.error(`${p}:${i + 1}: ${line.trim()}`); violations++; }
    });
  }
};
ROOTS.filter(existsSync).forEach(walk);

if (violations) { console.error(`\n${violations} violation(s). See .kiro/steering/no-faces.md`); process.exit(1); }
console.log('No-faces check passed.');
