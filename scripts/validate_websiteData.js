const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'pages', 'osr', 'sanatanhelp.html');
const outPath = path.join(__dirname, 'tmp_websiteData.js');

const text = fs.readFileSync(htmlPath, 'utf8');
const marker = 'const websiteData =';
const start = text.indexOf(marker);
if (start === -1) {
  console.error('websiteData marker not found');
  process.exit(2);
}
let i = text.indexOf('{', start + marker.length);
if (i === -1) {
  console.error('Opening brace not found');
  process.exit(2);
}
let depth = 0;
let end = -1;
for (; i < text.length; i++) {
  const ch = text[i];
  if (ch === '{') depth++;
  else if (ch === '}') {
    depth--;
    if (depth === 0) { end = i; break; }
  }
}
if (end === -1) {
  console.error('Could not find matching closing brace for websiteData');
  process.exit(3);
}
const snippet = text.slice(text.indexOf('{', start + marker.length), end + 1);
const out = 'module.exports = ' + snippet + ';\n';
fs.writeFileSync(outPath, out, 'utf8');
console.log('Wrote', outPath);

try {
  const data = require(outPath);
  console.log('websiteData parsed successfully. Keys:', Object.keys(data).join(', '));
  process.exit(0);
} catch (err) {
  console.error('Error requiring tmp file:', err && err.stack || err);
  process.exit(4);
}
