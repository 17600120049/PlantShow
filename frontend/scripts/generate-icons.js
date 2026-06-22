/**
 * 生成 Lucide 风格图标 — SVG + PNG (MIT — https://lucide.dev)
 * 运行: npm run icons
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, '../static/icons');
const PNG_SIZE = 81;

const COLORS = {
  primary: '#2D4739',
  white: '#FFFFFF',
  gray: '#9C9690',
  lightgray: '#CCCCCC',
  accent: '#C4785A',
  gold: '#D4A017',
  'gold-dark': '#B8860B',
  sage: '#6B8B7A'
};

const SHAPES = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M14 20c-5.5-2.5-.8-6.4-3-10"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  'scan-line': '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>',
  'qr-code': '<rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>'
};

function buildSvg(shapes, color, strokeWidth, filled, opacity) {
  const opacityAttr = opacity < 1 ? ` stroke-opacity="${opacity}"` : '';
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PNG_SIZE}" height="${PNG_SIZE}" viewBox="0 0 24 24"`,
    `fill="${filled ? color : 'none'}" stroke="${color}" stroke-width="${strokeWidth}"`,
    `stroke-linecap="round" stroke-linejoin="round"${opacityAttr}>`,
    shapes,
    '</svg>'
  ].join(' ');
}

async function writePng(filePath, svgContent) {
  await sharp(Buffer.from(svgContent))
    .resize(PNG_SIZE, PNG_SIZE)
    .png()
    .toFile(filePath);
}

async function writeIcon(name, variant, colorKey, strokeWidth, filled, opacity) {
  const shapes = SHAPES[name];
  if (!shapes) return;
  const dir = path.join(OUT, name);
  fs.mkdirSync(dir, { recursive: true });
  const base = variant || 'default';
  const strokeColor = COLORS[colorKey] || colorKey;
  const svg = buildSvg(shapes, strokeColor, strokeWidth, filled, opacity);
  fs.writeFileSync(path.join(dir, `${base}.svg`), svg);
  await writePng(path.join(dir, `${base}.png`), svg);
}

async function main() {
  const jobs = [
    ['sprout', 'white', 'white', 2.2, false, 1],
    ['sprout', 'primary', 'primary', 2, false, 1],
    ['scan-line', 'white', 'white', 2, false, 1],
    ['qr-code', 'white', 'white', 2, false, 1],
    ['chevron-right', 'white-dim', 'white', 2, false, 0.75],
    ['chevron-right', 'gray', 'gray', 2, false, 1],
    ['chevron-right', 'lightgray', 'lightgray', 2, false, 1],
    ['map-pin', 'gray', 'gray', 1.8, false, 1],
    ['clock', 'gray', 'gray', 1.8, false, 1],
    ['navigation', 'gray', 'gray', 1.8, false, 1],
    ['navigation', 'primary', 'primary', 1.8, false, 1],
    ['leaf', 'primary', 'primary', 1.6, false, 1],
    ['leaf', 'primary-bold', 'primary', 2, false, 1],
    ['leaf', 'white', 'white', 2, false, 1],
    ['leaf', 'gray', 'gray', 2, false, 1],
    ['building-2', 'primary', 'primary', 1.6, false, 1],
    ['building-2', 'white', 'white', 2, false, 1],
    ['building-2', 'gray', 'gray', 2, false, 1],
    ['heart', 'accent-fill', 'accent', 1.5, true, 1],
    ['user', 'white', 'white', 2, false, 1],
    ['star', 'gold-fill', 'gold', 1.5, true, 1],
    ['star', 'gold-dark', 'gold-dark', 2, false, 1],
    ['settings', 'white', 'white', 1.8, false, 1],
    ['settings', 'gray', 'gray', 2, false, 1],
    ['gift', 'sage', 'sage', 2, false, 1]
  ];

  for (const job of jobs) {
    await writeIcon(...job);
  }

  const tabDir = path.join(OUT, 'tab');
  fs.mkdirSync(tabDir, { recursive: true });
  const tabJobs = [
    ['home', SHAPES.home, '#9C9690', 1.75, false],
    ['home-active', SHAPES.home, '#2D4739', 2, false],
    ['heart', SHAPES.heart, '#9C9690', 1.75, false],
    ['heart-active', SHAPES.heart, '#C4785A', 1.5, true],
    ['user', SHAPES.user, '#9C9690', 1.75, false],
    ['user-active', SHAPES.user, '#2D4739', 2, false]
  ];

  for (const [name, shapes, color, sw, filled] of tabJobs) {
    const svg = buildSvg(shapes, color, sw, filled, 1);
    fs.writeFileSync(path.join(tabDir, `${name}.svg`), svg);
    await writePng(path.join(tabDir, `${name}.png`), svg);
  }

  console.log('Icons generated (SVG + PNG) in', OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
