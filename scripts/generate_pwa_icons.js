/**
 * ============================================================================
 * ГЕНЕРАТОР PWA-ИКОНОК БЕЗ ВНЕШНИХ NPM-ЗАВИСИМОСТЕЙ (Node.js + zlib)
 * ============================================================================
 * Создает файлы:
 *  - icons/icon-192.png
 *  - icons/icon-512.png
 *  - icons/icon.svg
 * Цвета: Теплая бумага #FAF2E7, небесно-голубой #DCEEFE, нежная мята #C8E2D2, #1E3F30
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 таблица
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}
const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcData = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/**
 * Рендерит буфер пикселей RGBA в PNG-буфер
 */
function encodePng(width, height, pixelDrawer) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Scanlines с фильтром 0
  const rowBytes = width * 4;
  const rawData = Buffer.alloc(height * (rowBytes + 1));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const color = pixelDrawer(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = color[0]; // R
      rawData[pxOffset + 1] = color[1]; // G
      rawData[pxOffset + 2] = color[2]; // B
      rawData[pxOffset + 3] = color[3]; // A
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', idatData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Логика отрисовки пикселей иконки «Мои таблицы ♡»
 * Цвета: Бумага #FAF2E7, Голубой #DCEEFE, Мята #C8E2D2, Глубокая мята #1E3F30
 */
function drawIconPixel(x, y, w, h) {
  // Цвета
  const paper = [250, 242, 231, 255]; // #FAF2E7
  const blue = [220, 238, 254, 255];  // #DCEEFE
  const mint = [200, 226, 210, 255];  // #C8E2D2
  const darkMint = [30, 63, 48, 255]; // #1E3F30

  const cx = w / 2;
  const cy = h / 2;

  // Закругленные углы для внешнего бумажного квадрата
  const cornerR = w * 0.22;
  const dxCorner = Math.max(0, Math.abs(x - cx) - (cx - cornerR));
  const dyCorner = Math.max(0, Math.abs(y - cy) - (cy - cornerR));
  const distCornerSq = dxCorner * dxCorner + dyCorner * dyCorner;
  if (distCornerSq > cornerR * cornerR) {
    return [0, 0, 0, 0]; // Прозрачный угол за пределами скругления
  }

  // Внутренний голубой диск-плашка
  const diskR = w * 0.36;
  const dx = x - cx;
  const dy = y - (cy + w * 0.01);
  const distCenter = Math.sqrt(dx * dx + dy * dy);

  // Определение сердца внутри диска
  // Уравнение сердца: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
  const heartScale = w * 0.19;
  const hx = (x - cx) / heartScale;
  const hy = -(y - (cy - w * 0.015)) / heartScale; // инвертируем Y
  const hx2 = hx * hx;
  const hy2 = hy * hy;
  const heartTerm = hx2 + hy2 - 1;
  const heartVal = heartTerm * heartTerm * heartTerm - hx2 * hy2 * hy;

  // Сердечко
  if (heartVal <= 0.08) {
    // Внутренняя область сердца — нежная мята #C8E2D2, контур — #1E3F30
    if (heartVal > -0.06) {
      return darkMint; // Четкий красивый контур сердца
    }
    return mint; // Заливка нежной мяты
  }

  // Голубая карточка-диск
  if (distCenter <= diskR) {
    // Мягкая подсветка сверху диска
    if (dy < -diskR * 0.4) {
      return [230, 244, 255, 255];
    }
    return blue;
  }

  // Внешний фон — теплая 3D бумага
  return paper;
}

/**
 * Создание векторного SVG (512x512)
 */
function generateSvg() {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">',
    '  <defs>',
    '    <filter id="paperShadow" x="-10%" y="-10%" width="125%" height="125%">',
    '      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#8C7355" flood-opacity="0.18"/>',
    '    </filter>',
    '    <linearGradient id="blueCardGrad" x1="0%" y1="0%" x2="0%" y2="100%">',
    '      <stop offset="0%" stop-color="#E8F4FE"/>',
    '      <stop offset="100%" stop-color="#DCEEFE"/>',
    '    </linearGradient>',
    '    <linearGradient id="mintHeartGrad" x1="0%" y1="0%" x2="0%" y2="100%">',
    '      <stop offset="0%" stop-color="#D8EFE0"/>',
    '      <stop offset="100%" stop-color="#C8E2D2"/>',
    '    </linearGradient>',
    '  </defs>',
    '  <!-- Теплый бумажный фон со скруглением -->',
    '  <rect x="16" y="16" width="480" height="480" rx="110" fill="#FAF2E7" filter="url(#paperShadow)"/>',
    '  <!-- Голубая внутренняя карточка -->',
    '  <rect x="76" y="76" width="360" height="360" rx="180" fill="url(#blueCardGrad)"/>',
    '  <!-- Фирменное сердечко ♡ в нежной мяте -->',
    '  <path d="M256 385 C230 360 145 285 145 208 C145 158 185 125 232 125 C244 125 252 130 256 136 C260 130 268 125 280 125 C327 125 367 158 367 208 C367 285 282 360 256 385 Z"',
    '        fill="url(#mintHeartGrad)" stroke="#1E3F30" stroke-width="14" stroke-linejoin="round"/>',
    '</svg>'
  ].join('\n');
}

function main() {
  const iconsDir = path.resolve(__dirname, '../icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('Создана папка icons/');
  }

  // 1. icon.svg
  const svgContent = generateSvg();
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent, 'utf8');
  console.log('✓ Создан icons/icon.svg');

  // 2. icon-192.png
  console.log('Генерация icons/icon-192.png...');
  const png192 = encodePng(192, 192, drawIconPixel);
  fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);
  console.log(`✓ Создан icons/icon-192.png (${png192.length} байт)`);

  // 3. icon-512.png
  console.log('Генерация icons/icon-512.png...');
  const png512 = encodePng(512, 512, drawIconPixel);
  fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);
  console.log(`✓ Создан icons/icon-512.png (${png512.length} байт)`);

  console.log('\nВсе PWA иконки успешно сгенерированы без единой npm-зависимости!');
}

main();
