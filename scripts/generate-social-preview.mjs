import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const logoSvgPath = path.join(rootDir, 'public', 'brand', 'logo-horizontal-dark.svg');
const logoSvgContent = fs.readFileSync(logoSvgPath, 'utf8');

// Strip the outer <svg> wrapper to embed smoothly into our 1200x630 container
const innerSvg = logoSvgContent
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '');

const socialCardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body, html {
      width: 1200px;
      height: 630px;
      background-color: #090d16;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #f8fafc;
      overflow: hidden;
      position: relative;
    }
    /* Subtle background grid pattern */
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    /* Ambient radial glow highlights */
    .glow-cyan {
      position: absolute;
      top: -120px;
      left: 15%;
      width: 550px;
      height: 550px;
      background: radial-gradient(circle, rgba(0, 229, 255, 0.12) 0%, rgba(0, 229, 255, 0) 70%);
      pointer-events: none;
    }
    .glow-violet {
      position: absolute;
      bottom: -150px;
      right: 15%;
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(147, 51, 234, 0) 70%);
      pointer-events: none;
    }
    .card-border {
      position: absolute;
      inset: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      pointer-events: none;
    }
    .content {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 68px 84px;
    }
    .top-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(37, 99, 235, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.35);
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      color: #93c5fd;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      align-self: flex-start;
    }
    .top-badge .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #38bdf8;
      box-shadow: 0 0 8px #38bdf8;
    }
    .logo-container {
      width: 740px;
      height: 180px;
      margin-top: 10px;
    }
    .logo-container svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .tagline {
      font-size: 32px;
      font-weight: 500;
      color: #94a3b8;
      line-height: 1.3;
      margin-top: -12px;
      letter-spacing: -0.01em;
    }
    .tagline strong {
      color: #f1f5f9;
      font-weight: 600;
    }
    .bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 24px;
    }
    .pills {
      display: flex;
      gap: 12px;
    }
    .pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      color: #cbd5e1;
    }
    .domain {
      font-size: 18px;
      font-weight: 600;
      color: #60a5fa;
      letter-spacing: -0.01em;
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="glow-cyan"></div>
  <div class="glow-violet"></div>
  <div class="card-border"></div>

  <div class="content">
    <div class="top-badge">
      <span class="dot"></span>
      <span>Official Python Documentation</span>
    </div>

    <div>
      <div class="logo-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1350 440">
          ${innerSvg}
        </svg>
      </div>
      <p class="tagline">Production-ready <strong>conversational AI agents</strong>, handoffs, tools & channels.</p>
    </div>

    <div class="bottom-bar">
      <div class="pills">
        <span class="pill">Multi-Agent</span>
        <span class="pill">Sessions & State</span>
        <span class="pill">Telegram & WhatsApp</span>
        <span class="pill">Python &ge;3.10</span>
      </div>
      <div class="domain">chatflowagent.org</div>
    </div>
  </div>
</body>
</html>`;

async function generate() {
  console.log('Launching headless Chromium to render 1200x630 social preview image...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(socialCardHtml, { waitUntil: 'networkidle' });

  // Let SVG fonts and gradients settle
  await page.waitForTimeout(500);

  const buffer = await page.screenshot({ type: 'png' });
  await browser.close();

  const publicBrandPath = path.join(rootDir, 'public', 'brand', 'social-preview.png');
  const publicOgPath = path.join(rootDir, 'public', 'opengraph-image.png');
  const appOgPath = path.join(rootDir, 'src', 'app', 'opengraph-image.png');

  fs.writeFileSync(publicBrandPath, buffer);
  fs.writeFileSync(publicOgPath, buffer);
  fs.writeFileSync(appOgPath, buffer);

  console.log(`✅ Generated: ${publicBrandPath} (${buffer.length} bytes)`);
  console.log(`✅ Generated: ${publicOgPath}`);
  console.log(`✅ Generated: ${appOgPath}`);
}

generate().catch((err) => {
  console.error('Fatal during social preview generation:', err);
  process.exit(1);
});

