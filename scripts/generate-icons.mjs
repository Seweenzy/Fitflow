import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const img = join(root, 'assets', 'images');
const iconDir = join(root, 'assets', 'expo.icon', 'Assets');
mkdirSync(img, { recursive: true });
mkdirSync(iconDir, { recursive: true });

const INK = '#17211D';
const ACCENT = '#C8F169';
const SPLASH_BG = { r: 32, g: 138, b: 239, alpha: 1 };

function brandSVG(size, { scale = 1, fullBleed = false } = {}) {
  const radius = fullBleed ? 0 : Math.round(size * 0.24);
  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.64 * scale;
  const bar = 0.16 * s;
  const gapX = 0.0625 * size * scale;
  const rot = -35;
  const slash = (xoff) =>
    `<rect x="${cx - bar / 2 - s / 2 + xoff}" y="${cy - bar / 2}" width="${bar}" height="${s}" rx="${bar / 2}" transform="rotate(${rot} ${cx} ${cy})" fill="${ACCENT}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="${INK}"/>
  ${slash(0)}
  ${slash(gapX)}
</svg>`;
}

function foregroundSVG(size) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.62;
  const bar = 0.16 * s;
  const gapX = 0.06 * size;
  const rot = -35;
  const slash = (xoff) =>
    `<rect x="${cx - bar / 2 - s / 2 + xoff}" y="${cy - bar / 2}" width="${bar}" height="${s}" rx="${bar / 2}" transform="rotate(${rot} ${cx} ${cy})" fill="${ACCENT}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${slash(0)}
  ${slash(gapX)}
</svg>`;
}

function fullBleedSVG(size) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.66;
  const bar = 0.16 * s;
  const gapX = 0.06 * size;
  const rot = -35;
  const slash = (xoff) =>
    `<rect x="${cx - bar / 2 - s / 2 + xoff}" y="${cy - bar / 2}" width="${bar}" height="${s}" rx="${bar / 2}" transform="rotate(${rot} ${cx} ${cy})" fill="${ACCENT}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${size}" height="${size}" fill="${INK}"/>
  ${slash(0)}
  ${slash(gapX)}
</svg>`;
}

async function writeSVGtoPNG(svg, target, size, flatten = false) {
  const buffer = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  let img = sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([{ input: buffer }]);
  if (flatten) img = img.flatten({ background: INK });
  await img.png().toFile(target);
  console.log('wrote', target);
}

async function main() {
  const appIcon = 1024;

  await writeSVGtoPNG(brandSVG(appIcon), join(img, 'icon.png'), appIcon, true);
  await writeSVGtoPNG(brandSVG(appIcon, { scale: 0.62 }), join(img, 'splash-icon.png'), appIcon);
  await writeSVGtoPNG(fullBleedSVG(appIcon), join(iconDir, 'ios-icon.png'), appIcon, true);
  await writeSVGtoPNG(foregroundSVG(appIcon), join(img, 'android-icon-foreground.png'), appIcon);

  await sharp({
    create: { width: appIcon, height: appIcon, channels: 4, background: SPLASH_BG },
  }).png().toFile(join(img, 'android-icon-background.png'));
  console.log('wrote android-icon-background.png');

  await writeSVGtoPNG(
    foregroundSVG(appIcon).replaceAll(ACCENT, '#FFFFFF'),
    join(img, 'android-icon-monochrome.png'),
    appIcon,
  );

  await writeSVGtoPNG(brandSVG(appIcon, { scale: 0.62 }), join(img, 'favicon.png'), 256);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
