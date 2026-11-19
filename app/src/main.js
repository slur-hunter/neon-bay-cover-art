// Neon Bay Cover Art — the editor.
// Wires the cover engine to the page: photo tray, layout and grade
// controls, caption and crop controls, and PNG export. Photos are read on
// the person's own machine and never leave it.

import { blankState, drawCover, hitPanel, EXPORT_SIZES, INKS } from './cover.js';

export const state = blankState();
export const tray = [];
export let exportSize = EXPORT_SIZES[0];

const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');

window.__errors = [];
window.addEventListener('error', (event) => {
  window.__errors.push(String(event.message || event.error || 'error'));
});
window.addEventListener('unhandledrejection', (event) => {
  window.__errors.push(String((event.reason && event.reason.message) || event.reason || 'rejection'));
});

function resizePreview() {
  canvas.width = Math.round(600 * (exportSize.width / exportSize.height) > 600
    ? 600
    : 600 * (exportSize.width / exportSize.height));
  canvas.height = Math.round(canvas.width * (exportSize.height / exportSize.width));
  if (canvas.width < 300) canvas.width = 300;
  if (canvas.height < 300) canvas.height = 300;
}

export function render() {
  resizePreview();
  drawCover(ctx, canvas.width, canvas.height, state);
  syncControls();
}

function syncControls() {
  document.querySelectorAll('[data-layout]').forEach((button) => {
    button.classList.toggle('active', button.dataset.layout === state.layout);
  });
  document.querySelectorAll('[data-grade]').forEach((button) => {
    button.classList.toggle('active', button.dataset.grade === state.grade);
  });
  document.querySelectorAll('[data-ink]').forEach((button) => {
    button.classList.toggle('active', button.dataset.ink === state.ink);
  });
  document.querySelectorAll('[data-size]').forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.size) === exportSize.width
      && Number(button.dataset.sizeHeight) === exportSize.height);
  });
  const panel = state.panels[state.selectedPanel];
  const zoom = document.getElementById('zoom');
  const panX = document.getElementById('panx');
  const panY = document.getElementById('pany');
  if (zoom) zoom.value = String(panel.zoom);
  if (panX) panX.value = String(panel.panX);
  if (panY) panY.value = String(panel.panY);
  const label = document.getElementById('panel-label');
  if (label) label.textContent = `Panel ${state.selectedPanel + 1} of 3`;
  document.querySelectorAll('#tray .thumb').forEach((thumb, i) => {
    thumb.classList.toggle('assigned', tray[i] === panel.photo);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

export async function loadSamples() {
  const names = ['samples/boulevard.jpg', 'samples/pier.jpg'];
  for (const name of names) {
    if (tray.some((img) => img.dataset && img.dataset.source === name)) continue;
    try {
      const img = await loadImage(name);
      img.dataset.source = name;
      tray.push(img);
      addThumb(img);
    } catch (err) {
      window.__errors.push(String(err.message || err));
    }
  }
  if (tray.length > 0) {
    state.panels[0].photo = tray[0];
    if (tray[1]) state.panels[1].photo = tray[1];
    state.panels[2].photo = tray[2] || tray[0];
  }
  render();
}

function addThumb(img) {
  const trayEl = document.getElementById('tray');
  if (!trayEl) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'thumb';
  button.title = 'Click to put this photo in the selected panel';
  const thumb = document.createElement('img');
  thumb.src = img.src;
  thumb.alt = 'photo';
  button.appendChild(thumb);
  button.addEventListener('click', () => {
    state.panels[state.selectedPanel].photo = img;
    render();
  });
  trayEl.appendChild(button);
}

function addFiles(files) {
  [...files].forEach((file) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const img = await loadImage(String(reader.result));
        tray.push(img);
        addThumb(img);
        state.panels[state.selectedPanel].photo = img;
        render();
      } catch (err) {
        window.__errors.push(String(err.message || err));
      }
    };
    reader.readAsDataURL(file);
  });
}

export function setExportSize(width, height) {
  const found = EXPORT_SIZES.find((s) => s.width === width && s.height === height);
  if (found) exportSize = found;
  render();
}

export async function exportPNG() {
  const off = document.createElement('canvas');
  off.width = exportSize.width;
  off.height = exportSize.height;
  drawCover(off.getContext('2d'), off.width, off.height, state);
  const blob = await new Promise((resolve) => off.toBlob(resolve, 'image/png'));
  const bytes = blob ? blob.size : 0;
  const name = `neon-bay-cover-${exportSize.width}x${exportSize.height}.png`;
  window.__lastExport = { name, width: exportSize.width, height: exportSize.height, bytes };
  if (blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  return window.__lastExport;
}

// Test hook: lets a headless check call the export and read its record.
window.__exportPNG = exportPNG;

function bindControls() {
  document.querySelectorAll('[data-layout]').forEach((button) => {
    button.addEventListener('click', () => {
      state.layout = button.dataset.layout;
      render();
    });
  });
  document.querySelectorAll('[data-grade]').forEach((button) => {
    button.addEventListener('click', () => {
      state.grade = button.dataset.grade;
      render();
    });
  });
  document.querySelectorAll('[data-ink]').forEach((button) => {
    button.addEventListener('click', () => {
      state.ink = button.dataset.ink;
      render();
    });
  });
  document.querySelectorAll('[data-size]').forEach((button) => {
    button.addEventListener('click', () => {
      setExportSize(Number(button.dataset.size), Number(button.dataset.sizeHeight));
    });
  });
  const caption = document.getElementById('caption');
  if (caption) caption.addEventListener('input', () => { state.caption = caption.value; render(); });
  const tagline = document.getElementById('tagline');
  if (tagline) tagline.addEventListener('input', () => { state.tagline = tagline.value; render(); });
  const strength = document.getElementById('strength');
  if (strength) {
    strength.addEventListener('input', () => {
      state.gradeStrength = Number(strength.value) / 100;
      render();
    });
  }
  const zoom = document.getElementById('zoom');
  if (zoom) zoom.addEventListener('input', () => { state.panels[state.selectedPanel].zoom = Number(zoom.value); render(); });
  const panX = document.getElementById('panx');
  if (panX) panX.addEventListener('input', () => { state.panels[state.selectedPanel].panX = Number(panX.value); render(); });
  const panY = document.getElementById('pany');
  if (panY) panY.addEventListener('input', () => { state.panels[state.selectedPanel].panY = Number(panY.value); render(); });
  const picker = document.getElementById('panel-photo');
  if (picker) {
    picker.addEventListener('change', () => {
      const index = Number(picker.value);
      state.panels[state.selectedPanel].photo = Number.isNaN(index) ? null : tray[index];
      render();
    });
  }
  const fileInput = document.getElementById('file-input');
  if (fileInput) fileInput.addEventListener('change', () => addFiles(fileInput.files));
  const samples = document.getElementById('load-samples');
  if (samples) samples.addEventListener('click', () => loadSamples());
  const exportButton = document.getElementById('export');
  if (exportButton) exportButton.addEventListener('click', () => exportPNG());
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const px = (event.clientX - rect.left) * (canvas.width / rect.width);
    const py = (event.clientY - rect.top) * (canvas.height / rect.height);
    const hit = hitPanel(state.layout, canvas.width, canvas.height, px, py);
    if (hit >= 0) {
      state.selectedPanel = hit;
      render();
    }
  });
}

export const ready = (async () => {
  bindControls();
  try {
    await document.fonts.load('80px Anton');
    await document.fonts.ready;
  } catch (err) {
    window.__errors.push(String(err.message || err));
  }
  render();
  window.__ready = true;
})();
