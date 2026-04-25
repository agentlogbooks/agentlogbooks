const fs = require('fs');
const path = require('path');

const SRC = 'src';
const OUT = '.';
const PAGES_DIR = path.join(SRC, 'pages');
const INCLUDE_RE = /<!--\s*include:\s*(\S+?)\s*-->/g;

function render(html) {
  return html.replace(INCLUDE_RE, (_, p) => {
    const fullPath = path.join(SRC, p);
    if (!fs.existsSync(fullPath)) {
      throw new Error('Missing partial: ' + fullPath);
    }
    return render(fs.readFileSync(fullPath, 'utf8'));
  });
}

function walk(dir, outDir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.keep') continue;
    const src = path.join(dir, entry.name);
    const dst = path.join(outDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dst, { recursive: true });
      walk(src, dst);
    } else if (entry.name.endsWith('.html')) {
      fs.writeFileSync(dst, render(fs.readFileSync(src, 'utf8')));
    }
  }
}

walk(PAGES_DIR, OUT);
console.log('Build complete.');
