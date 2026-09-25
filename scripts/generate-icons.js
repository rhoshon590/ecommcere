/* Generates the PWA PNG icons (192, 512, 512 maskable, 180 apple-touch).
   Pure Node — no dependencies. Run: node scripts/generate-icons.js */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

/* --- Minimal PNG encoder (RGBA, 8-bit) --- */
let CRC_TABLE;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

/* --- Brand icon drawing: terracotta tile with a cream mug --- */
const TERRACOTTA = [200, 118, 63];
const CREAM = [251, 248, 242];
const COFFEE = [123, 74, 44];

function inRoundRect(x, y, rx, ry, w, h, r) {
  const cx = Math.max(rx + r, Math.min(x, rx + w - r));
  const cy = Math.max(ry + r, Math.min(y, ry + h - r));
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function drawIcon(size, { safe = false } = {}) {
  const scale = safe ? 0.8 : 1;
  const offset = (size * (1 - scale)) / 2;
  const px = Buffer.alloc(size * size * 4);

  const bodyX = size * 0.22;
  const bodyY = size * 0.32;
  const bodyW = size * 0.52;
  const bodyH = size * 0.4;
  const bodyR = size * 0.09;
  const coffeeH = size * 0.16;
  const handleCx = size * 0.74;
  const handleCy = size * 0.52;
  const handleR = size * 0.14;
  const handleThick = size * 0.06;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let u = x + 0.5;
      let v = y + 0.5;
      if (safe) {
        u = (u - offset) / scale;
        v = (v - offset) / scale;
      }
      let color = TERRACOTTA;
      if (inRoundRect(u, v, bodyX, bodyY, bodyW, bodyH, bodyR)) {
        color = v < bodyY + coffeeH ? COFFEE : CREAM;
      } else {
        const d = Math.hypot(u - handleCx, v - handleCy);
        if (d <= handleR && d >= handleR - handleThick && u >= bodyX + bodyW - handleR) {
          color = CREAM;
        }
      }
      const i = (y * size + x) * 4;
      px[i] = color[0];
      px[i + 1] = color[1];
      px[i + 2] = color[2];
      px[i + 3] = 255;
    }
  }
  return encodePNG(size, size, px);
}

writeFileSync(join(OUT, "icon-192.png"), drawIcon(192));
writeFileSync(join(OUT, "icon-512.png"), drawIcon(512));
writeFileSync(join(OUT, "icon-maskable-512.png"), drawIcon(512, { safe: true }));
writeFileSync(join(OUT, "icon-180.png"), drawIcon(180));
console.log("Icons written to", OUT);
