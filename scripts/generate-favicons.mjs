import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const symbolSvgPath = path.join(rootDir, 'public', 'brand', 'logo-symbol.svg');
const symbolSvgContent = fs.readFileSync(symbolSvgPath, 'utf8');

// Extract the defs and graphic content from logo-symbol.svg
const defsMatch = symbolSvgContent.match(/<defs>([\s\S]*?)<\/defs>/);
const defsContent = defsMatch ? defsMatch[1] : '';

const groupMatch = symbolSvgContent.match(/<g id="chatflow-symbol"[\s\S]*?<\/g>/);
const groupContent = groupMatch ? groupMatch[0] : '';

// Create the standalone square SVG for browser favicons
// Centered viewBox: -25 -40 480 480
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-25 -40 480 480" width="100%" height="100%">
  <defs>
${defsContent}
    <!-- Subtle luminous filter for dark tab definition -->
    <filter id="cf-tab-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <style>
    :root {
      color-scheme: light dark;
    }
  </style>
  <g id="favicon-symbol">
    ${groupContent}
  </g>
</svg>`;

// Write public/icon.svg and src/app/icon.svg
fs.writeFileSync(path.join(rootDir, 'public', 'icon.svg'), faviconSvg, 'utf8');
fs.writeFileSync(path.join(rootDir, 'src', 'app', 'icon.svg'), faviconSvg, 'utf8');
console.log('✅ Generated public/icon.svg and src/app/icon.svg');

// Create HTML template for rendering PNGs with Playwright
async function generatePngs() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Transparent PNGs (16, 32, 48, 192, 512)
  const sizes = [16, 32, 48, 192, 512];
  const pngBuffers = {};

  for (const size of sizes) {
    await page.setViewportSize({ width: size, height: size });
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body, html { width: ${size}px; height: ${size}px; background: transparent; overflow: hidden; }
          svg { width: 100%; height: 100%; display: block; }
        </style>
      </head>
      <body>
        ${faviconSvg}
      </body>
    </html>`;

    await page.setContent(html);
    const buffer = await page.screenshot({ omitBackground: true });
    pngBuffers[size] = buffer;

    if (size === 16) {
      fs.writeFileSync(path.join(rootDir, 'public', 'favicon-16x16.png'), buffer);
    } else if (size === 32) {
      fs.writeFileSync(path.join(rootDir, 'public', 'favicon-32x32.png'), buffer);
    } else if (size === 192) {
      fs.writeFileSync(path.join(rootDir, 'public', 'icon-192.png'), buffer);
    } else if (size === 512) {
      fs.writeFileSync(path.join(rootDir, 'public', 'icon-512.png'), buffer);
    }
    console.log(`✅ Generated PNG ${size}x${size}`);
  }

  // 2. Apple Touch Icon (180x180 on sleek dark background with padding)
  await page.setViewportSize({ width: 180, height: 180 });
  const appleHtml = `<!DOCTYPE html>
  <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html {
          width: 180px;
          height: 180px;
          background: #090d16;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .wrapper {
          width: 144px;
          height: 144px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        svg { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        ${faviconSvg}
      </div>
    </body>
  </html>`;

  await page.setContent(appleHtml);
  const appleBuffer = await page.screenshot({ omitBackground: false });
  fs.writeFileSync(path.join(rootDir, 'public', 'apple-touch-icon.png'), appleBuffer);
  fs.writeFileSync(path.join(rootDir, 'src', 'app', 'apple-icon.png'), appleBuffer);
  console.log('✅ Generated public/apple-touch-icon.png and src/app/apple-icon.png (180x180)');

  await browser.close();

  // 3. Build multi-resolution ICO file (16x16, 32x32, 48x48)
  const icoSizes = [16, 32, 48];
  const images = icoSizes.map((s) => ({
    width: s,
    height: s,
    buffer: pngBuffers[s],
  }));

  const icoBuffer = createIco(images);
  fs.writeFileSync(path.join(rootDir, 'public', 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(rootDir, 'src', 'app', 'favicon.ico'), icoBuffer);
  console.log('✅ Generated public/favicon.ico and src/app/favicon.ico');

  // 4. Generate public/site.webmanifest
  const manifest = {
    name: 'chatflow-agent',
    short_name: 'chatflow-agent',
    description: 'Official documentation and platform for chatflow-agent in Python',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#090d16',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };

  fs.writeFileSync(
    path.join(rootDir, 'public', 'site.webmanifest'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
  console.log('✅ Generated public/site.webmanifest');
}

/**
 * Packs PNG buffers into a multi-resolution Windows ICO container
 */
function createIco(images) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = images.length;

  let offset = headerSize + dirEntrySize * numImages;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(numImages, 4); // Count of images

  const dirEntries = [];
  const imageBuffers = [];

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Size
    entry.writeUInt32LE(offset, 12); // Offset

    offset += img.buffer.length;
    dirEntries.push(entry);
    imageBuffers.push(img.buffer);
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

generatePngs().catch((err) => {
  console.error('Fatal during favicon generation:', err);
  process.exit(1);
});
