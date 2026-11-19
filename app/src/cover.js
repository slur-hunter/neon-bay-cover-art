// Neon Bay Cover Art — the cover engine.
// Draws a multi-panel poster cover onto a canvas from a plain state object.
// Photos are Image objects the editor loads from the person's own machine,
// the caption font is the vendored Anton file under app/fonts/, and nothing
// here reaches the network.

export const LAYOUTS = {
  hero: [
    { x: 0, y: 0, w: 1, h: 0.62 },
    { x: 0, y: 0.62, w: 0.5, h: 0.38 },
    { x: 0.5, y: 0.62, w: 0.5, h: 0.38 },
  ],
  triptych: [
    { x: 0, y: 0, w: 1 / 3, h: 1 },
    { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
    { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
  ],
  split: [
    { x: 0, y: 0, w: 0.55, h: 1 },
    { x: 0.55, y: 0, w: 0.45, h: 0.5 },
    { x: 0.55, y: 0.5, w: 0.45, h: 0.5 },
  ],
};

export const GRADES = {
  sunset: ['#ff7a18', '#ff2d78'],
  neon: ['#00e5ff', '#ff00a8', '#7b2fff'],
  vice: ['#ff5da2', '#b967ff'],
};

export const INKS = {
  white: '#ffffff',
  yellow: '#ffd23f',
  pink: '#ff5da2',
  cyan: '#4de8ff',
};

export const EXPORT_SIZES = [
  { label: 'Square 1080 x 1080', width: 1080, height: 1080 },
  { label: 'Portrait 1080 x 1350', width: 1080, height: 1350 },
  { label: 'Wide 1920 x 1080', width: 1920, height: 1080 },
];

export function blankState() {
  return {
    layout: 'hero',
    grade: 'sunset',
    gradeStrength: 0.7,
    ink: '#ffffff',
    caption: 'Sunset Heist',
    tagline: 'VICE CITY \u2022 2026',
    selectedPanel: 0,
    panels: [
      { photo: null, zoom: 1, panX: 0, panY: 0 },
      { photo: null, zoom: 1, panX: 0, panY: 0 },
      { photo: null, zoom: 1, panX: 0, panY: 0 },
    ],
  };
}

export function panelRects(layout, width, height) {
  const defs = LAYOUTS[layout] || LAYOUTS.hero;
  return defs.map((d) => ({
    x: d.x * width,
    y: d.y * height,
    w: d.w * width,
    h: d.h * height,
  }));
}

export function hitPanel(layout, width, height, px, py) {
  const rects = panelRects(layout, width, height);
  for (let i = rects.length - 1; i >= 0; i -= 1) {
    const r = rects[i];
    if (px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h) return i;
  }
  return -1;
}

function drawPhotoCover(ctx, img, rect, zoom, panX, panY) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + panX * Math.max(dw - rect.w, 0) / 2;
  const dy = rect.y + (rect.h - dh) / 2 + panY * Math.max(dh - rect.h, 0) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPlaceholder(ctx, rect, index) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, '#2b1a4a');
  g.addColorStop(0.55, '#c94b6d');
  g.addColorStop(1, '#1a0f2e');
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const size = Math.max(14, Math.min(rect.w, rect.h) * 0.12);
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText(`PANEL ${index + 1}`, rect.x + rect.w / 2, rect.y + rect.h / 2);
}

function drawGradeWash(ctx, width, height, grade, strength) {
  const stops = GRADES[grade] || GRADES.sunset;
  const g = ctx.createLinearGradient(0, 0, width * 0.35, height);
  stops.forEach((color, i) => g.addColorStop(i / Math.max(stops.length - 1, 1), color));
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = Math.max(0, Math.min(1, strength)) * 0.85;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = Math.max(0, Math.min(1, strength)) * 0.5;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawVignette(ctx, width, height) {
  const r = Math.hypot(width, height) / 2;
  const g = ctx.createRadialGradient(
    width / 2, height / 2, r * 0.35,
    width / 2, height / 2, r,
  );
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

function drawWordmark(ctx, width, height) {
  const pad = Math.round(width * 0.025);
  const size = Math.max(16, Math.round(width * 0.032));
  ctx.font = `${size}px Anton, sans-serif`;
  const text = 'NEON BAY';
  const tw = ctx.measureText(text).width;
  const chipW = tw + pad * 2;
  const chipH = size + pad * 1.1;
  const x = pad;
  const y = pad;
  ctx.save();
  roundRect(ctx, x, y, chipW, chipH, chipH / 2);
  ctx.fillStyle = 'rgba(12, 6, 24, 0.85)';
  ctx.fill();
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.strokeStyle = '#ff5da2';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + pad, y + chipH / 2 + size * 0.04);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitCaptionSize(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px Anton, sans-serif`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  return size;
}

function drawSpacedLine(ctx, text, centerX, y, spacing) {
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(chars.length - 1, 0);
  let x = centerX - total / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i] + spacing;
  });
}

function drawCaptionBlock(ctx, width, height, state) {
  const caption = (state.caption || '').toUpperCase();
  const tagline = (state.tagline || '').toUpperCase();
  if (!caption && !tagline) return;
  const maxW = width * 0.92;
  const capSize = fitCaptionSize(ctx, caption || 'NEON BAY', maxW, Math.round(height * 0.15));
  const capY = height * 0.9;
  const tagSize = Math.max(12, Math.round(capSize * 0.26));
  const tagY = capY - capSize * 1.05;
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  if (tagline) {
    ctx.font = `${tagSize}px Anton, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = tagSize * 0.4;
    drawSpacedLine(ctx, tagline, width / 2, tagY, tagSize * 0.35);
    ctx.shadowBlur = 0;
  }
  if (caption) {
    ctx.font = `${capSize}px Anton, sans-serif`;
    const capW = ctx.measureText(caption).width;
    const startX = (width - capW) / 2;
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, capSize * 0.09);
    ctx.strokeStyle = 'rgba(10, 5, 20, 0.92)';
    ctx.shadowColor = '#ff2d78';
    ctx.shadowBlur = capSize * 0.22;
    ctx.strokeText(caption, startX, capY);
    ctx.shadowBlur = 0;
    ctx.fillStyle = state.ink || '#ffffff';
    ctx.fillText(caption, startX, capY);
    const barH = Math.max(4, capSize * 0.09);
    const barY = capY + capSize * 0.16;
    const bar = ctx.createLinearGradient(startX, 0, startX + capW, 0);
    bar.addColorStop(0, '#ff5da2');
    bar.addColorStop(0.5, '#ffd23f');
    bar.addColorStop(1, '#4de8ff');
    ctx.fillStyle = bar;
    ctx.fillRect(startX, barY, capW, barH);
  }
  ctx.restore();
}

export function drawCover(ctx, width, height, state) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#14101f';
  ctx.fillRect(0, 0, width, height);
  const rects = panelRects(state.layout, width, height);
  rects.forEach((rect, i) => {
    const panel = state.panels[i] || { photo: null, zoom: 1, panX: 0, panY: 0 };
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (panel.photo) {
      drawPhotoCover(ctx, panel.photo, rect, panel.zoom, panel.panX, panel.panY);
    } else {
      drawPlaceholder(ctx, rect, i);
    }
    ctx.restore();
    ctx.strokeStyle = '#14101f';
    ctx.lineWidth = Math.max(2, width * 0.006);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });
  drawGradeWash(ctx, width, height, state.grade, state.gradeStrength);
  drawVignette(ctx, width, height);
  drawWordmark(ctx, width, height);
  drawCaptionBlock(ctx, width, height, state);
  ctx.restore();
}
