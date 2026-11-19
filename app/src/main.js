// Neon Bay Cover Art — editor.
// Wires the page: photo tray, layout and grade controls, panel editing,
// live preview on canvas, and PNG export at the three post sizes.
// Photos stay on this machine: file inputs and the bundled samples are
// read locally, nothing is uploaded anywhere.

import { LAYOUTS, GRADES, INKS, SIZES, drawCover } from './cover.js';
import { applyShotMode } from './shots.js';

window.__errors = [];
window.addEventListener('error', (event) => {
  window.__errors.push(String(event.message || event.error || 'error'));
});
window.addEventListener('unhandledrejection', (event) => {
  window.__errors.push(String((event.reason && event.reason.message) || event.reason || 'rejection'));
});

const SAMPLES = [
  { name: 'Boulevard', src: 'samples/boulevard.jpg' },
  { name: 'Pier', src: 'samples/pier.jpg' },
];

const state = {
  layout: 'hero',
  panels: [
    { photo: null, zoom: 1, panX: 0, panY: 0 },
    { photo: null, zoom: 1, panX: 0, panY: 0 },
    { photo: null, zoom: 1, panX: 0, panY: 0 },
  ],
  caption: 'Sunset Heist',
  tagline: 'VICE CITY • 2026',
  ink: '#ffffff',
  grade: 'sunset',
  strength: 70,
  sizeIndex: 0,
  selected: 0,
};

const photos = [];
let previewOverride = null;

const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');

function currentSize() {
  return SIZES[state.sizeIndex];
}

function previewDimensions() {
  if (previewOverride) return previewOverride;
  const size = currentSize();
  const maxSide = 900;
  const scale = Math.min(1, maxSide / Math.max(size.w, size.h));
  return { w: Math.round(size.w * scale), h: Math.round(size.h * scale) };
}

function render() {
  const dims = previewDimensions();
  if (canvas.width !== dims.w || canvas.height !== dims.h) {
    canvas.width = dims.w;
    canvas.height = dims.h;
  }
  const view = {
    layout: state.layout,
    panels: state.panels.map((slot) => ({
      photo: slot.photo == null ? null : photos[slot.photo] || null,
      zoom: slot.zoom,
      panX: slot.panX,
      panY: slot.panY,
    })),
    caption: state.caption,
    tagline: state.tagline,
    ink: state.ink,
    grade: state.grade,
    strength: state.strength,
    selected: state.selected,
  };
  drawCover(ctx, view, canvas.width, canvas.height, { showSelection: true });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

async function loadSamples() {
  for (const sample of SAMPLES) {
    if (photos.some((photo) => photo.name === sample.name)) continue;
    const img = await loadImage(sample.src);
    photos.push({ name: sample.name, img });
  }
  if (state.panels.every((slot) => slot.photo == null)) {
    state.panels[0].photo = 0;
    if (photos.length > 1) state.panels[1].photo = 1;
    if (photos.length > 0) state.panels[2].photo = 0;
  }
  buildTray();
  buildPanelPhotoSelect();
  render();
}

function buildTray() {
  const tray = document.getElementById('tray');
  tray.innerHTML = '';
  photos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thumb';
    button.title = `Put ${photo.name} in the selected panel`;
    const thumb = document.createElement('img');
    thumb.src = photo.img.src;
    thumb.alt = photo.name;
    const label = document.createElement('span');
    label.textContent = photo.name;
    button.append(thumb, label);
    button.addEventListener('click', () => {
      state.panels[state.selected].photo = index;
      buildPanelPhotoSelect();
      render();
    });
    tray.appendChild(button);
  });
  const hint = document.getElementById('trayHint');
  if (hint) hint.textContent = photos.length
    ? 'Click a photo to put it in the selected panel.'
    : 'Load the samples or add your own photos to begin.';
}

function buildPanelPhotoSelect() {
  const select = document.getElementById('panelPhoto');
  select.innerHTML = '';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = 'Empty panel';
  select.appendChild(empty);
  photos.forEach((photo, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = photo.name;
    select.appendChild(option);
  });
  const slot = state.panels[state.selected];
  select.value = slot.photo == null ? '' : String(slot.photo);
}

function syncPanelControls() {
  const slot = state.panels[state.selected];
  document.getElementById('panelLabel').textContent = `Panel ${state.selected + 1}`;
  buildPanelPhotoSelect();
  document.getElementById('zoom').value = String(slot.zoom);
  document.getElementById('zoomValue').textContent = `${slot.zoom.toFixed(2)}x`;
  document.getElementById('panX').value = String(slot.panX);
  document.getElementById('panXValue').textContent = slot.panX.toFixed(2);
  document.getElementById('panY').value = String(slot.panY);
  document.getElementById('panYValue').textContent = slot.panY.toFixed(2);
}

function buildRadioGroup(containerId, items, current, onPick) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach((item) => {
    const label = document.createElement('label');
    label.className = 'choice';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = containerId;
    input.value = item.value;
    input.checked = item.value === current;
    input.addEventListener('change', () => onPick(item.value));
    label.append(input, document.createTextNode(item.label));
    container.appendChild(label);
  });
}

function buildInkSwatches() {
  const container = document.getElementById('inkSwatches');
  container.innerHTML = '';
  INKS.forEach((ink) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch';
    button.style.background = ink.value;
    button.title = ink.name;
    button.setAttribute('aria-label', `Caption ink ${ink.name}`);
    if (state.ink === ink.value) button.classList.add('active');
    button.addEventListener('click', () => {
      state.ink = ink.value;
      container.querySelectorAll('.swatch').forEach((el) => el.classList.remove('active'));
      button.classList.add('active');
      render();
    });
    container.appendChild(button);
  });
}

function hitPanel(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const fx = (clientX - rect.left) / rect.width;
  const fy = (clientY - rect.top) / rect.height;
  const layout = LAYOUTS[state.layout];
  const hit = layout.panels.findIndex((panel) => (
    fx >= panel.x && fx <= panel.x + panel.w && fy >= panel.y && fy <= panel.y + panel.h
  ));
  return hit;
}

async function exportCover(size) {
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  const offCtx = off.getContext('2d');
  const view = {
    layout: state.layout,
    panels: state.panels.map((slot) => ({
      photo: slot.photo == null ? null : photos[slot.photo] || null,
      zoom: slot.zoom,
      panX: slot.panX,
      panY: slot.panY,
    })),
    caption: state.caption,
    tagline: state.tagline,
    ink: state.ink,
    grade: state.grade,
    strength: state.strength,
    selected: -1,
  };
  drawCover(offCtx, view, size.w, size.h, { showSelection: false });
  const blob = await new Promise((resolve) => off.toBlob(resolve, 'image/png'));
  const name = `neon-bay-cover-${size.w}x${size.h}.png`;
  const info = { name, width: size.w, height: size.h, bytes: blob.size };
  window.__lastExport = info;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  const status = document.getElementById('exportStatus');
  if (status) status.textContent = `Exported ${name} (${size.w} x ${size.h}, ${Math.round(blob.size / 1024)} KiB).`;
  return info;
}

function wireControls() {
  buildRadioGroup('layoutChoices', Object.entries(LAYOUTS).map(([value, def]) => ({ value, label: def.label })), state.layout, (value) => {
    state.layout = value;
    render();
  });
  buildRadioGroup('gradeChoices', Object.entries(GRADES).map(([value, def]) => ({ value, label: def.label })), state.grade, (value) => {
    state.grade = value;
    render();
  });
  buildRadioGroup('sizeChoices', SIZES.map((size, index) => ({ value: String(index), label: size.label })), String(state.sizeIndex), (value) => {
    state.sizeIndex = Number(value);
    render();
  });
  buildInkSwatches();

  const captionInput = document.getElementById('caption');
  captionInput.value = state.caption;
  captionInput.addEventListener('input', () => {
    state.caption = captionInput.value;
    render();
  });
  const taglineInput = document.getElementById('tagline');
  taglineInput.value = state.tagline;
  taglineInput.addEventListener('input', () => {
    state.tagline = taglineInput.value;
    render();
  });

  const strength = document.getElementById('strength');
  strength.value = String(state.strength);
  document.getElementById('strengthValue').textContent = `${state.strength}%`;
  strength.addEventListener('input', () => {
    state.strength = Number(strength.value);
    document.getElementById('strengthValue').textContent = `${state.strength}%`;
    render();
  });

  document.getElementById('panelPhoto').addEventListener('change', (event) => {
    const value = event.target.value;
    state.panels[state.selected].photo = value === '' ? null : Number(value);
    render();
  });
  const zoom = document.getElementById('zoom');
  zoom.addEventListener('input', () => {
    state.panels[state.selected].zoom = Number(zoom.value);
    document.getElementById('zoomValue').textContent = `${Number(zoom.value).toFixed(2)}x`;
    render();
  });
  const panX = document.getElementById('panX');
  panX.addEventListener('input', () => {
    state.panels[state.selected].panX = Number(panX.value);
    document.getElementById('panXValue').textContent = Number(panX.value).toFixed(2);
    render();
  });
  const panY = document.getElementById('panY');
  panY.addEventListener('input', () => {
    state.panels[state.selected].panY = Number(panY.value);
    document.getElementById('panYValue').textContent = Number(panY.value).toFixed(2);
    render();
  });

  document.getElementById('loadSamples').addEventListener('click', async () => {
    try {
      await loadSamples();
    } catch (error) {
      window.__errors.push(String(error.message || error));
    }
  });
  document.getElementById('photoFiles').addEventListener('change', async (event) => {
    const files = [...event.target.files];
    for (const file of files) {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const img = await loadImage(dataUrl);
      photos.push({ name: file.name.replace(/\.[^.]+$/, ''), img });
    }
    buildTray();
    buildPanelPhotoSelect();
    render();
    event.target.value = '';
  });

  canvas.addEventListener('click', (event) => {
    const hit = hitPanel(event.clientX, event.clientY);
    if (hit >= 0) {
      state.selected = hit;
      syncPanelControls();
      render();
    }
  });

  document.getElementById('exportButton').addEventListener('click', async () => {
    try {
      await exportCover(currentSize());
    } catch (error) {
      window.__errors.push(String(error.message || error));
    }
  });
}

wireControls();
buildTray();
syncPanelControls();
render();
window.__ready = true;

try {
  await document.fonts.load('100px Anton');
  await document.fonts.ready;
  render();
} catch {
  // The caption falls back to sans-serif; the cover still draws.
}

// Fixed screenshot scenes (?shot=1..4) take over from here when present.
const shotActive = await applyShotMode({
  state,
  photos,
  loadSamples,
  render,
  setPreviewOverride: (dims) => {
    previewOverride = dims;
  },
  syncPanelControls,
  buildTray,
});
if (shotActive) {
  try {
    await document.fonts.ready;
  } catch {
    // Already handled above.
  }
  render();
  window.__shotReady = true;
}
