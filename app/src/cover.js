// Neon Bay Cover Art — cover rendering engine.
// Pure canvas drawing: layouts, photo placement, colour grades, lettering.
// No DOM access here except the 2D context passed in, so the same code
// draws the live preview and the exported PNG at full size.

export const LAYOUTS = {
  hero: {
    label: 'Hero + strip',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.62 },
      { x: 0, y: 0.63, w: 0.495, h: 0.37 },
      { x: 0.505, y: 0.63, w: 0.495, h: 0.37 },
    ],
  },
  triptych: {
    label: 'Triptych',
    panels: [
      { x: 0, y: 0, w: 0.3267, h: 1 },
      { x: 0.3367, y: 0, w: 0.3267, h: 1 },
      { x: 0.6733, y: 0, w: 0.3267, h: 1 },
    ],
  },
  split: {
    label: 'Split screen',
    panels: [
      { x: 0, y: 0, w: 0.55, h: 1 },
      { x: 0.56, y: 0, w: 0.44, h: 0.495 },
      { x: 0.56, y: 0.505, w: 0.44, h: 0.495 },
    ],
  },
};

export const GRADES = {
  sunset: {
    label: 'Sunset',
    stops: [
      [0, '#ff9a3c'],
      [0.5, '#ff5da2'],
      [1, '#7b2ff7'],
    ],
  },
  neon: {
    label: 'Neon nights',
    stops: [
      [0, '#00e5ff'],
      [0.5, '#ff2fb3'],
      [1, '#6a00ff'],
    ],
  },
  vice: {
    label: 'Vice pink',
    stops: [
      [0, '#ff7ad9'],
      [0.5, '#ff2e88'],
      [1, '#b537f2'],
    ],
  },
};

export const INKS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Sunset yellow', value: '#ffd23f' },
  { name: 'Hot pink', value: '#ff5da2' },
  { name: 'Neon cyan', value: '#4de8ff' },
];

export const SIZES = [
  { label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  { label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  { label: 'Wide 1920 x 1080', w: 1920, h: 1080 },
];

export const WORDMARK = 'NEON BAY';

// Draw one photo into a panel rect with cover-fit, zoom and pan.
// panX and panY run from -1 to 1 across the slack the zoom leaves.
export function drawPhotoInto(ctx, img, rx, ry, rw, rh, zoom, panX, panY) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(rw / iw, rh / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const slackX = dw - rw;
  const slackY = dh - rh;
  const dx = rx + (rw - dw) / 2 + (panX * slackX) / 2;
  const dy = ry + (rh - dh) / 2 + (panY * slackY) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Fill a panel that has no photo yet: dusk gradient with a panel number.
export function drawEmptyPanel(ctx, rx, ry, rw, rh, index) {
  const grad = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
  grad.addColorStop(0, '#2b1055');
  grad.addColorStop(0.55, '#c22a7a');
  grad.addColorStop(1, '#ff9a3c');
  ctx.fillStyle = grad;
  ctx.fillRect(rx, ry, rw, rh);
  const size = Math.min(rw, rh) * 0.16;
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(`PANEL ${index + 1}`, rx + rw / 2, ry + rh / 2);
}

// Shrink the caption until it fits inside maxWidth, starting from startSize.
export function fitCaptionFont(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px Anton, sans-serif`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size *= 0.92;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  return size;
}

// Draw the whole cover. state holds layout, panels, caption, tagline, ink,
// grade and strength. options.showSelection draws the selected-panel outline
// (preview only, never on export).
export function drawCover(ctx, state, width, height, options = {}) {
  const showSelection = options.showSelection === true;
  const layout = LAYOUTS[state.layout] || LAYOUTS.hero;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const strength = Math.max(0, Math.min(100, state.strength ?? 70)) / 100;

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#14101c';
  ctx.fillRect(0, 0, width, height);

  // Panels.
  layout.panels.forEach((panel, i) => {
    const rx = panel.x * width;
    const ry = panel.y * height;
    const rw = panel.w * width;
    const rh = panel.h * height;
    const slot = state.panels[i] || {};
    ctx.save();
    ctx.beginPath();
    ctx.rect(rx, ry, rw, rh);
    ctx.clip();
    if (slot.photo && slot.photo.img) {
      drawPhotoInto(ctx, slot.photo.img, rx, ry, rw, rh, slot.zoom || 1, slot.panX || 0, slot.panY || 0);
    } else {
      drawEmptyPanel(ctx, rx, ry, rw, rh, i);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = Math.max(2, width * 0.002);
    ctx.strokeRect(rx, ry, rw, rh);
    if (showSelection && state.selected === i) {
      ctx.strokeStyle = '#ff5da2';
      ctx.lineWidth = Math.max(4, width * 0.005);
      ctx.strokeRect(rx, ry, rw, rh);
    }
  });

  // Colour grade wash over the photos.
  if (strength > 0) {
    const wash = ctx.createLinearGradient(0, 0, 0, height);
    for (const [stop, color] of grade.stops) wash.addColorStop(stop, color);
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = strength * 0.55;
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Bottom shade so the caption always reads, then the vignette.
  const shade = ctx.createLinearGradient(0, height * 0.55, 0, height);
  shade.addColorStop(0, 'rgba(10, 5, 20, 0)');
  shade.addColorStop(1, 'rgba(10, 5, 20, 0.55)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);

  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.45,
    width / 2, height / 2, Math.max(width, height) * 0.75,
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // Wordmark chip, top left.
  const chipPad = width * 0.03;
  const chipSize = height * 0.032;
  ctx.font = `${chipSize}px Anton, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const chipTextWidth = ctx.measureText(WORDMARK).width;
  const chipW = chipTextWidth + chipPad * 1.1;
  const chipH = chipSize * 1.9;
  const chipX = width * 0.03;
  const chipY = height * 0.03;
  ctx.fillStyle = 'rgba(8, 8, 16, 0.85)';
  ctx.strokeStyle = '#ff5da2';
  ctx.lineWidth = Math.max(2, width * 0.002);
  roundRect(ctx, chipX, chipY, chipW, chipH, chipH * 0.28);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(WORDMARK, chipX + chipPad * 0.55, chipY + chipH / 2 + chipSize * 0.04);

  // Caption: bold Anton, auto-fit to 92% of the cover width, dark stroke,
  // neon pink glow, gradient underline bar.
  const caption = (state.caption || '').toUpperCase();
  const tagline = (state.tagline || '').toUpperCase();
  const captionMax = width * 0.92;
  const captionSize = fitCaptionFont(ctx, caption, captionMax, width * 0.115);
  const captionWidth = ctx.measureText(caption).width;
  const captionBaseline = height * 0.925;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${captionSize}px Anton, sans-serif`;
  ctx.shadowColor = '#ff2fb3';
  ctx.shadowBlur = captionSize * 0.35;
  ctx.lineWidth = captionSize * 0.14;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(16, 6, 20, 0.92)';
  ctx.strokeText(caption, width / 2, captionBaseline);
  ctx.fillStyle = state.ink || '#ffffff';
  ctx.fillText(caption, width / 2, captionBaseline);
  ctx.shadowBlur = 0;

  const barH = Math.max(4, captionSize * 0.09);
  const barY = captionBaseline + captionSize * 0.14;
  const bar = ctx.createLinearGradient(width / 2 - captionWidth / 2, 0, width / 2 + captionWidth / 2, 0);
  bar.addColorStop(0, '#ff5da2');
  bar.addColorStop(0.5, '#ffd23f');
  bar.addColorStop(1, '#4de8ff');
  ctx.fillStyle = bar;
  roundRect(ctx, width / 2 - captionWidth / 2, barY, captionWidth, barH, barH / 2);
  ctx.fill();

  // Tagline above the caption, letter-spaced.
  if (tagline) {
    const tagSize = height * 0.028;
    ctx.font = `${tagSize}px Anton, sans-serif`;
    try {
      ctx.letterSpacing = `${tagSize * 0.35}px`;
    } catch {
      // Older engines ignore letterSpacing; the tagline still draws.
    }
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = tagSize * 0.4;
    ctx.fillText(tagline, width / 2, captionBaseline - captionSize * 1.18);
    ctx.shadowBlur = 0;
    try {
      ctx.letterSpacing = '0px';
    } catch {
      // No-op on engines without the property.
    }
  }

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
