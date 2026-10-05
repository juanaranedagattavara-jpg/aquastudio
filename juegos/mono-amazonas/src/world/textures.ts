import {
  CanvasTexture, ClampToEdgeWrapping, LinearMipmapLinearFilter, RepeatWrapping, SRGBColorSpace, Texture,
} from 'three';
import { Rng } from '../core/random';

// Texturas generadas en canvas: sin assets externos, el juego es un único archivo.

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function finish(c: HTMLCanvasElement, repeat: boolean, srgb = true): CanvasTexture {
  const t = new CanvasTexture(c);
  if (srgb) t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = repeat ? RepeatWrapping : ClampToEdgeWrapping;
  t.minFilter = LinearMipmapLinearFilter;
  t.anisotropy = 4;
  return t;
}

const rng = new Rng(777);

export function barkTexture(): Texture {
  const [c, g] = canvas(128, 256);
  g.fillStyle = '#c9b49a';
  g.fillRect(0, 0, 128, 256);
  // estrías verticales
  for (let i = 0; i < 90; i++) {
    const x = rng.range(0, 128);
    const w = rng.range(1, 4);
    const l = rng.range(0.55, 0.85);
    g.fillStyle = `rgba(${Math.floor(70 * l)},${Math.floor(55 * l)},${Math.floor(40 * l)},${rng.range(0.25, 0.6)})`;
    g.fillRect(x, 0, w, 256);
  }
  // grietas
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = `rgba(40,30,20,${rng.range(0.3, 0.7)})`;
    g.lineWidth = rng.range(1, 2.5);
    g.beginPath();
    let x = rng.range(0, 128), y = rng.range(0, 256);
    g.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      x += rng.range(-3, 3);
      y += rng.range(5, 14);
      g.lineTo(x, y);
    }
    g.stroke();
  }
  // líquenes y musgo
  for (let i = 0; i < 70; i++) {
    g.fillStyle = rng.chance(0.5) ? `rgba(110,140,70,${rng.range(0.15, 0.4)})` : `rgba(200,200,170,${rng.range(0.1, 0.3)})`;
    g.beginPath();
    g.ellipse(rng.range(0, 128), rng.range(0, 256), rng.range(2, 8), rng.range(2, 10), 0, 0, Math.PI * 2);
    g.fill();
  }
  return finish(c, true);
}

export function groundDetailTexture(): Texture {
  const [c, g] = canvas(256, 256);
  g.fillStyle = '#d8d0c0';
  g.fillRect(0, 0, 256, 256);
  // hojarasca
  for (let i = 0; i < 900; i++) {
    const x = rng.range(0, 256), y = rng.range(0, 256);
    const l = rng.range(0.45, 1);
    const hue = rng.chance(0.3) ? [110 * l, 115 * l, 70 * l] : [150 * l, 110 * l, 70 * l];
    g.fillStyle = `rgba(${hue[0] | 0},${hue[1] | 0},${hue[2] | 0},${rng.range(0.35, 0.8)})`;
    g.save();
    g.translate(x, y);
    g.rotate(rng.range(0, Math.PI));
    g.beginPath();
    g.ellipse(0, 0, rng.range(2, 6), rng.range(1, 2.5), 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  // ramitas
  for (let i = 0; i < 60; i++) {
    g.strokeStyle = `rgba(60,45,30,${rng.range(0.4, 0.8)})`;
    g.lineWidth = rng.range(0.7, 1.6);
    g.beginPath();
    const x = rng.range(0, 256), y = rng.range(0, 256), a = rng.range(0, Math.PI), l = rng.range(6, 18);
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  return finish(c, true);
}

/** Hoja ancha (taioba / heliconia). */
export function broadLeafTexture(): Texture {
  const [c, g] = canvas(128, 256);
  g.clearRect(0, 0, 128, 256);
  const grad = g.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, '#2f6d22');
  grad.addColorStop(0.5, '#4f9a33');
  grad.addColorStop(1, '#2f6d22');
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(64, 250);
  g.bezierCurveTo(-30, 180, 0, 30, 64, 4);
  g.bezierCurveTo(128, 30, 158, 180, 64, 250);
  g.fill();
  g.strokeStyle = 'rgba(200,230,150,0.7)';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(64, 250);
  g.lineTo(64, 10);
  g.stroke();
  g.lineWidth = 1.2;
  for (let y = 40; y < 235; y += 16) {
    g.beginPath();
    g.moveTo(64, y + 10);
    g.quadraticCurveTo(40, y, 14, y - 8);
    g.moveTo(64, y + 10);
    g.quadraticCurveTo(88, y, 114, y - 8);
    g.stroke();
  }
  return finish(c, false);
}

/** Fronda pinnada (helecho / palmera). */
export function frondTexture(leaflets = 26, color = '#3f8a2c'): Texture {
  const [c, g] = canvas(128, 512);
  g.clearRect(0, 0, 128, 512);
  g.strokeStyle = '#5b6b2a';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(64, 512);
  g.lineTo(64, 0);
  g.stroke();
  for (let i = 0; i < leaflets; i++) {
    const t = i / leaflets;
    const y = 500 - t * 490;
    const len = 58 * Math.sin(Math.PI * (0.12 + t * 0.85));
    for (const side of [-1, 1]) {
      g.fillStyle = i % 3 === 0 ? '#2f6d22' : color;
      g.save();
      g.translate(64, y);
      g.rotate(side * (1.05 - t * 0.35));
      g.beginPath();
      g.ellipse(0, -len / 2, 4.5, len / 2, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
  }
  return finish(c, false);
}

export function waterNormalTexture(): Texture {
  const size = 256;
  const [c, g] = canvas(size, size);
  const img = g.createImageData(size, size);
  const h = new Float32Array(size * size);
  // suma de ondas periódicas (tileable)
  const waves: [number, number, number, number][] = [];
  for (let i = 0; i < 18; i++) {
    waves.push([rng.int(-6, 6), rng.int(-6, 6), rng.range(0, Math.PI * 2), rng.range(0.3, 1)]);
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      for (const [kx, ky, ph, a] of waves) v += a * Math.sin(((kx * x + ky * y) / size) * Math.PI * 2 + ph);
      h[y * size + x] = v;
    }
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const l = h[y * size + ((x - 1 + size) % size)], r = h[y * size + ((x + 1) % size)];
      const u = h[((y - 1 + size) % size) * size + x], d = h[((y + 1) % size) * size + x];
      let nx = (l - r) * 0.5, ny = (u - d) * 0.5;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len;
      ny /= len;
      const i = (y * size + x) * 4;
      img.data[i] = (nx * 0.5 + 0.5) * 255;
      img.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      img.data[i + 2] = (nz / len * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return finish(c, true, false);
}

export function glowTexture(): Texture {
  const [c, g] = canvas(128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return finish(c, false);
}

/** Gradiente vertical para haces de luz y columnas de los frutos dorados. */
export function beamTexture(): Texture {
  const [c, g] = canvas(64, 256);
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.6)');
  grad.addColorStop(1, 'rgba(255,255,255,1)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 256);
  const h = g.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, 'rgba(0,0,0,1)');
  h.addColorStop(0.5, 'rgba(0,0,0,0)');
  h.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = h;
  g.fillRect(0, 0, 64, 256);
  return finish(c, false);
}

/** Pintura corporal (urucum rojo + jenipapo negro) para los cazadores. */
export function bodyPaintTexture(): Texture {
  const [c, g] = canvas(256, 128);
  g.fillStyle = '#9a6444';
  g.fillRect(0, 0, 256, 128);
  // banda de jenipapo con motivo geométrico
  g.strokeStyle = '#17120f';
  g.lineWidth = 3;
  for (let row = 0; row < 3; row++) {
    const y0 = 34 + row * 22;
    g.beginPath();
    for (let x = 0; x <= 256; x += 16) {
      g.lineTo(x, y0 + (x / 16) % 2 * 10);
    }
    g.stroke();
  }
  g.fillStyle = '#17120f';
  for (let x = 8; x < 256; x += 32) {
    g.beginPath();
    g.moveTo(x, 18);
    g.lineTo(x + 8, 26);
    g.lineTo(x, 34);
    g.lineTo(x - 8, 26);
    g.closePath();
    g.fill();
  }
  // líneas de urucum
  g.fillStyle = '#b8321e';
  g.fillRect(0, 4, 256, 6);
  g.fillRect(0, 108, 256, 8);
  return finish(c, true);
}

export function thatchTexture(): Texture {
  const [c, g] = canvas(128, 128);
  g.fillStyle = '#8c7442';
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 400; i++) {
    const l = rng.range(0.6, 1.2);
    g.strokeStyle = `rgba(${(150 * l) | 0},${(125 * l) | 0},${(70 * l) | 0},0.8)`;
    g.lineWidth = rng.range(1, 2);
    const x = rng.range(0, 128), y = rng.range(0, 128);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + rng.range(-2, 2), y + rng.range(10, 24));
    g.stroke();
  }
  return finish(c, true);
}
