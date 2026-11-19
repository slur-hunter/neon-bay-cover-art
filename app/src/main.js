// Neon Bay Cover Art — wires the editor page.
// Hypothesis: three steps (add photos, pick a layout, export) get a user from photo
// to PNG in under a minute. Metric: headless playthrough with zero console errors,
// a photo loaded, caption edited, and all three export sizes verified by PNG bytes.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, defaultState, LAYOUTS, GRADES, SIZES, CAPTION_COLORS, panelAt } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const state = defaultState();
/** Loaded photos: { img, name } in load order. */
const photos = [];
let selectedPanel = 0;
let selectedPhoto = -1;
let fontReady = false;

function redraw() {
  drawCover(canvas, state, photos.map((p) => p.img));
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Adds already-loaded images to the photo tray and returns their indexes. */
export function addPhotos(entries) {
  const indexes = [];
  for (const { img, name } of entries) {
    photos.push({ img, name });
    indexes.push(photos.length - 1);
  }
  renderPhotoList();
  renderPanelPhotoOptions();
  return indexes;
}

/** Loads the bundled sample photos (AI-made, free to use) into the tray. */
export async function loadSamples() {
  const entries = [];
  for (const name of ['boulevard', 'pier']) {
    entries.push({ img: await loadImage(`samples/${name}.jpg`), name: `${name}.jpg` });
  }
  const [first] = addPhotos(entries);
  // Fill the hero layout with the samples so the cover is complete at once.
  state.panels[0].photo = first;
  state.panels[1].photo = first + 1;
  state.panels[2].photo = first;
  selectedPhoto = first;
  renderPhotoList();
  syncPanelControls();
  redraw();
  return entries;
}

function renderPhotoList() {
  const list = document.getElementById('photo-list');
  list.textContent = '';
  photos.forEach((photo, i) => {
    const li = document.createElement('li');
    if (i === selectedPhoto) li.className = 'selected';
    const thumb = document.createElement('img');
    thumb.src = photo.img.src;
    thumb.alt = photo.name;
    thumb.title = photo.name;
    thumb.addEventListener('click', () => {
      selectedPhoto = i;
      state.panels[selectedPanel].photo = i;
      renderPhotoList();
      syncPanelControls();
      redraw();
    });
    const label = document.createElement('span');
    label.textContent = photo.name;
    li.append(thumb, label);
    list.append(li);
  });
}

function renderPanelPhotoOptions() {
  const select = document.getElementById('panel-photo');
  select.textContent = '';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = 'Empty panel';
  select.append(empty);
  photos.forEach((photo, i) => {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = photo.name;
    select.append(option);
  });
  const current = state.panels[selectedPanel].photo;
  select.value = current === null || current === undefined ? '' : String(current);
}

function syncPanelControls() {
  const panel = state.panels[selectedPanel];
  document.getElementById('panel-photo').value =
    panel.photo === null || panel.photo === undefined ? '' : String(panel.photo);
  const zoom = document.getElementById('zoom');
  zoom.value = panel.zoom;
  document.getElementById('zoom-val').textContent = `${Number(panel.zoom).toFixed(2)}×`;
  const ox = document.getElementById('ox');
  ox.value = panel.ox;
  document.getElementById('ox-val').textContent = String(panel.ox);
  const oy = document.getElementById('oy');
  oy.value = panel.oy;
  document.getElementById('oy-val').textContent = String(panel.oy);
  document.querySelectorAll('#panel-buttons button').forEach((button, i) => {
    button.setAttribute('aria-pressed', String(i === selectedPanel));
  });
}

function selectPanel(i) {
  selectedPanel = i;
  syncPanelControls();
}

function buildButtons() {
  const layouts = document.getElementById('layout-buttons');
  for (const [key, layout] of Object.entries(LAYOUTS)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = layout.name;
    button.setAttribute('aria-pressed', String(state.layout === key));
    button.addEventListener('click', () => {
      state.layout = key;
      layouts.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      redraw();
    });
    layouts.append(button);
  }

  const panels = document.getElementById('panel-buttons');
  for (let i = 0; i < 3; i += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `Panel ${i + 1}`;
    button.setAttribute('aria-pressed', String(i === selectedPanel));
    button.addEventListener('click', () => selectPanel(i));
    panels.append(button);
  }

  const colors = document.getElementById('color-buttons');
  for (const color of CAPTION_COLORS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = color.name;
    button.setAttribute('aria-pressed', String(state.captionColor === color.value));
    button.addEventListener('click', () => {
      state.captionColor = color.value;
      colors.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      redraw();
    });
    colors.append(button);
  }

  const grade = document.getElementById('grade');
  for (const [key, value] of Object.entries(GRADES)) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = value.name;
    grade.append(option);
  }
  grade.value = state.grade;

  const sizes = document.getElementById('size-buttons');
  for (const [key, size] of Object.entries(SIZES)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = size.label;
    button.setAttribute('aria-pressed', String(state.size === key));
    button.addEventListener('click', () => {
      state.size = key;
      sizes.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      applySize();
      redraw();
    });
    sizes.append(button);
  }
}

function applySize() {
  const size = SIZES[state.size];
  canvas.width = size.w;
  canvas.height = size.h;
}

function bindControls() {
  document.getElementById('photos').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    const entries = [];
    for (const file of files) {
      entries.push({ img: await loadImage(URL.createObjectURL(file)), name: file.name });
    }
    const [first] = addPhotos(entries);
    selectedPhoto = first;
    const emptyPanel = state.panels.findIndex((p) => p.photo === null || p.photo === undefined);
    if (emptyPanel !== -1) state.panels[emptyPanel].photo = first;
    renderPhotoList();
    syncPanelControls();
    redraw();
    status.textContent = `Loaded ${files.length} photo${files.length > 1 ? 's' : ''}.`;
  });

  document.getElementById('samples').addEventListener('click', async () => {
    await loadSamples();
    status.textContent = 'Sample photos loaded.';
  });

  document.getElementById('panel-photo').addEventListener('change', (e) => {
    state.panels[selectedPanel].photo = e.target.value === '' ? null : Number(e.target.value);
    redraw();
  });

  const bindRange = (id, valId, format, apply) => {
    const input = document.getElementById(id);
    input.addEventListener('input', () => {
      const value = Number(input.value);
      document.getElementById(valId).textContent = format(value);
      apply(value);
      redraw();
    });
  };
  bindRange('zoom', 'zoom-val', (v) => `${v.toFixed(2)}×`, (v) => { state.panels[selectedPanel].zoom = v; });
  bindRange('ox', 'ox-val', (v) => String(v), (v) => { state.panels[selectedPanel].ox = v; });
  bindRange('oy', 'oy-val', (v) => String(v), (v) => { state.panels[selectedPanel].oy = v; });
  bindRange('grade-strength', 'grade-val', (v) => `${Math.round(v * 100)}%`, (v) => { state.gradeStrength = v; });

  document.getElementById('caption').addEventListener('input', (e) => {
    state.caption = e.target.value;
    redraw();
  });
  document.getElementById('tagline').addEventListener('input', (e) => {
    state.tagline = e.target.value;
    redraw();
  });
  document.getElementById('grade').addEventListener('change', (e) => {
    state.grade = e.target.value;
    redraw();
  });

  canvas.addEventListener('click', (e) => {
    const hit = panelAt(state, canvas, e.clientX, e.clientY);
    if (hit !== -1) selectPanel(hit);
  });

  document.getElementById('export').addEventListener('click', () => {
    exportCover();
  });
}

/** Renders the cover at full export size and downloads it as a PNG. */
export function exportCover() {
  const size = SIZES[state.size];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state, photos.map((p) => p.img));
  const name = `neon-bay-cover-${size.w}x${size.h}.png`;
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    status.textContent = `Saved ${name}`;
    window.__lastExport = { name, width: size.w, height: size.h, bytes: blob.size };
  }, 'image/png');
}

// The caption is drawn in Anton; wait for the vendored font before the first paint.
document.fonts.load('40px Anton').then(() => {
  fontReady = true;
  redraw();
  if (window.__shotReadyPending) window.__shotReady = true;
});

buildButtons();
bindControls();
renderPhotoList();
renderPanelPhotoOptions();
syncPanelControls();
applySize();
redraw();

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    loadSamples,
    setCaption: (text) => {
      state.caption = text;
      document.getElementById('caption').value = text;
    },
    setTagline: (text) => {
      state.tagline = text;
      document.getElementById('tagline').value = text;
    },
    setLayout: (layout) => { state.layout = layout; },
    setGrade: (grade) => {
      state.grade = grade;
      document.getElementById('grade').value = grade;
    },
    setSize: (size) => {
      state.size = size;
      document.querySelectorAll('#size-buttons button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      applySize();
    },
    setPanelPhoto: (panel, photo) => { state.panels[panel].photo = photo; },
    setPanelCrop: (panel, zoom, ox, oy) => {
      Object.assign(state.panels[panel], { zoom, ox, oy });
    },
    redraw,
    fontReady: () => fontReady,
  });
}
