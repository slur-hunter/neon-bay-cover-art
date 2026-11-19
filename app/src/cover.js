// Neon Bay Cover Art — the cover renderer.
// Hypothesis: a multi-panel poster (several cropped photos + bold Anton caption +
// sunset/neon grade) reads as GTA-style cover art at a glance, where the starter's
// single-photo square did not. Metric: the exported PNGs look like a poster in the
// screenshots, and every panel/caption/grade control changes the render.

/** The three post sizes the app exports, in pixels. */
export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 x 1350' },
  wide: { w: 1920, h: 1080, label: '1920 x 1080' },
};

/** Panel layouts: each panel is [x, y, w, h] in fractions of the cover. */
export const LAYOUTS = {
  hero: {
    name: 'Hero + strip',
    panels: [
      [0, 0, 1, 0.62],
      [0, 0.62, 0.5, 0.38],
      [0.5, 0.62, 0.5, 0.38],
    ],
  },
  triptych: {
    name: 'Triptych',
    panels: [
      [0, 0, 1 / 3, 1],
      [1 / 3, 0, 1 / 3, 1],
      [2 / 3, 0, 1 / 3, 1],
    ],
  },
  split: {
    name: 'Split screen',
    panels: [
      [0, 0, 0.55, 1],
      [0.55, 0, 0.45, 0.5],
      [0.55, 0.5, 0.45, 0.5],
    ],
  },
};

/** Colour grades: [stop, colour] pairs for the sunset/neon wash. */
export const GRADES = {
  sunset: {
    name: 'Sunset',
    stops: [
      [0, 'rgba(255, 170, 60, 0)'],
      [0.55, 'rgba(255, 110, 60, 0.18)'],
      [1, 'rgba(214, 40, 120, 0.55)'],
    ],
  },
  neon: {
    name: 'Neon nights',
    stops: [
      [0, 'rgba(0, 229, 255, 0.12)'],
      [0.5, 'rgba(255, 0, 170, 0.10)'],
      [1, 'rgba(150, 0, 255, 0.5)'],
    ],
  },
  vice: {
    name: 'Vice pink',
    stops: [
      [0, 'rgba(255, 120, 200, 0.08)'],
      [0.55, 'rgba(255, 60, 150, 0.22)'],
      [1, 'rgba(120, 20, 160, 0.55)'],
    ],
  },
};

/** Caption ink colours the user can pick. */
export const CAPTION_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Sunset yellow', value: '#ffd23f' },
  { name: 'Hot pink', value: '#ff5da2' },
  { name: 'Neon cyan', value: '#4de8ff' },
];

/** A fresh editor state: no photos yet, hero layout, sunset grade. */
export function defaultState() {
  return {
    layout: 'hero',
    size: 'square',
    caption: 'Sunset Heist',
    tagline: 'VICE CITY • 2026',
    captionColor: '#ffffff',
    grade: 'sunset',
    gradeStrength: 0.7,
    panels: [
      { photo: null, zoom: 1, ox: 0, oy: 0 },
      { photo: null, zoom: 1, ox: 0, oy: 0 },
      { photo: null, zoom: 1, ox: 0, oy: 0 },
    ],
  };
}

/** Draws one photo into a panel rect, cover-fit, with zoom and pan offsets. */
export function drawPhotoInto(ctx, img, x, y, pw, ph, zoom, ox, oy) {
  const base = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * base;
  const dh = img.naturalHeight * base;
  const dx = x + (pw - dw) / 2 + ox * ((dw - pw) / 2);
  const dy = y + (ph - dh) / 2 + oy * ((dh - ph) / 2);
  ctx.drawImage(img, dx, dy, dw, dh);
}

/** Draws the empty-panel placeholder: a dusk gradient with a panel number. */
export function drawEmptyPanel(ctx, x, y, pw, ph, label) {
  const g = ctx.createLinearGradient(x, y, x + pw, y + ph);
  g.addColorStop(0, '#3a1c5e');
  g.addColorStop(1, '#12081f');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, pw, ph);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = Math.max(2, pw * 0.004);
  ctx.strokeRect(x + pw * 0.06, y + ph * 0.06, pw * 0.88, ph * 0.88);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = `bold ${Math.round(ph * 0.07)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + pw / 2, y + ph / 2);
}

/** Fits the caption to the cover width and returns the font size to use. */
export function fitCaptionSize(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  }
  return size;
}

/**
 * Draws the whole cover onto `canvas` (at its own pixel size) from `state`
 * and the loaded `photos` array (HTMLImageElements, indexed by panel.photo).
 */
export function drawCover(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.hero;
  const gap = Math.max(4, Math.round(w * 0.006));

  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, w, h);

  layout.panels.forEach(([fx, fy, fw, fh], i) => {
    const x = fx * w;
    const y = fy * h;
    const pw = fw * w;
    const ph = fh * h;
    const panel = state.panels[i] ?? { photo: null, zoom: 1, ox: 0, oy: 0 };
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + gap / 2, y + gap / 2, pw - gap, ph - gap);
    ctx.clip();
    const img = panel.photo !== null && panel.photo !== undefined ? photos[panel.photo] : null;
    if (img) {
      drawPhotoInto(ctx, img, x + gap / 2, y + gap / 2, pw - gap, ph - gap, panel.zoom, panel.ox, panel.oy);
    } else {
      drawEmptyPanel(ctx, x + gap / 2, y + gap / 2, pw - gap, ph - gap, `PANEL ${i + 1}`);
    }
    ctx.restore();
  });

  // Panel gutters: dark seams, each spanning only the panels it separates.
  ctx.fillStyle = '#14081f';
  layout.panels.forEach(([fx, fy, fw, fh]) => {
    if (fx > 0) ctx.fillRect(fx * w - gap / 2, fy * h, gap, fh * h);
    if (fy > 0) ctx.fillRect(fx * w, fy * h - gap / 2, fw * w, gap);
  });

  // Sunset / neon grade wash over the whole poster.
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  for (const [stop, color] of grade.stops) wash.addColorStop(stop, color);
  ctx.save();
  ctx.globalAlpha = state.gradeStrength;
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // Vignette: darkened corners pull the eye to the middle.
  const vig = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(10, 4, 18, 0)');
  vig.addColorStop(1, 'rgba(10, 4, 18, 0.45)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Top-left title chip: the app's own original wordmark, not a game logo.
  const chipH = Math.round(h * 0.045);
  const chipPad = Math.round(w * 0.02);
  ctx.font = `${Math.round(chipH * 0.55)}px Anton, 'Arial Narrow', sans-serif`;
  const chipText = 'NEON BAY';
  const chipW = ctx.measureText(chipText).width + chipPad * 2;
  const chipX = Math.round(w * 0.03);
  const chipY = Math.round(h * 0.03);
  ctx.fillStyle = 'rgba(16, 6, 28, 0.85)';
  ctx.fillRect(chipX, chipY, chipW, chipH);
  ctx.strokeStyle = '#ff2e88';
  ctx.lineWidth = Math.max(2, chipH * 0.06);
  ctx.strokeRect(chipX, chipY, chipW, chipH);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(chipText, chipX + chipPad, chipY + chipH / 2 + 1);

  // Tagline, then the big caption along the foot.
  const caption = (state.caption || '').trim().toUpperCase();
  const tagline = (state.tagline || '').trim().toUpperCase();
  const footY = h - Math.round(h * 0.045);
  if (tagline) {
    const tagSize = Math.round(h * 0.022);
    ctx.font = `bold ${tagSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(spreadLetters(tagline), w / 2, footY - Math.round(h * 0.115));
  }
  if (caption) {
    const maxW = w * 0.92;
    const size = fitCaptionSize(ctx, caption, maxW, Math.round(h * 0.115));
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(16, 6, 28, 0.9)';
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.strokeText(caption, w / 2, footY);
    ctx.fillStyle = state.captionColor;
    ctx.shadowColor = 'rgba(255, 46, 136, 0.65)';
    ctx.shadowBlur = Math.round(size * 0.18);
    ctx.fillText(caption, w / 2, footY);
    ctx.shadowBlur = 0;
    // Neon underline bar under the caption.
    const barW = Math.min(maxW, ctx.measureText(caption).width * 0.6);
    const barH = Math.max(4, Math.round(h * 0.006));
    const barGrad = ctx.createLinearGradient(w / 2 - barW / 2, 0, w / 2 + barW / 2, 0);
    barGrad.addColorStop(0, '#ff2e88');
    barGrad.addColorStop(0.5, '#ffd23f');
    barGrad.addColorStop(1, '#4de8ff');
    ctx.fillStyle = barGrad;
    ctx.fillRect(w / 2 - barW / 2, footY + Math.round(h * 0.018), barW, barH);
  }
}

/** Letterspaces a short tagline with hair spaces so it reads as a poster slug. */
export function spreadLetters(text) {
  return text.split('').join('\u200a');
}

/** Returns the panel index under a point on the preview canvas, or -1. */
export function panelAt(state, canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const fx = (clientX - rect.left) / rect.width;
  const fy = (clientY - rect.top) / rect.height;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.hero;
  return layout.panels.findIndex(([px, py, pw, ph]) => fx >= px && fx < px + pw && fy >= py && fy < py + ph);
}
