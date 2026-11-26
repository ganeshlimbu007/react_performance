// Writes every ```` fenced block marked `file=<path>` in a labs markdown file.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const doc = process.argv[2] ?? 'LABS-WEEK01-02.md';
const md = readFileSync(doc, 'utf8');
const block = /^````[a-z]*[ \t]+file=(\S+)\n([\s\S]*?)^````$/gm;

let m;
let n = 0;
while ((m = block.exec(md))) {
  const [, path, body] = m;
  mkdirSync(dirname(resolve(path)), { recursive: true });
  writeFileSync(resolve(path), body);
  console.log('wrote ' + path);
  n++;
}
console.log(n + ' files from ' + doc);
