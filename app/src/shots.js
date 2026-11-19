// Neon Bay Cover Art — fixed scenes for screenshots.
// A ?shot=1..4 query sets the app to one scene instead of the empty editor,
// so the maker's screenshots show the app at work and the covers it exports.
// shot 1 = the cover itself, shot 2 = the editor with photos loaded,
// shot 3 = a portrait cover, shot 4 = a wide cover. window.__shotReady is
// set once the scene is drawn and the Anton font is loaded.

import { state, tray, ready, render, loadSamples, setExportSize } from './main.js';

const SHOTS = {
  1: { layout: 'hero', grade: 'sunset', ink: '#ffffff', caption: 'Sunset Heist', tagline: 'VICE CITY \u2022 2026', size: [1080, 1080], coverOnly: true },
  2: { layout: 'hero', grade: 'sunset', ink: '#ffffff', caption: 'Sunset Heist', tagline: 'VICE CITY \u2022 2026', size: [1080, 1080], coverOnly: false },
  3: { layout: 'triptych', grade: 'vice', ink: '#ffd23f', caption: 'Boulevard Queen', tagline: 'VICE CITY \u2022 2026', size: [1080, 1350], coverOnly: true },
  4: { layout: 'split', grade: 'neon', ink: '#4de8ff', caption: 'Night Shift', tagline: 'VICE CITY \u2022 2026', size: [1920, 1080], coverOnly: true },
};

function applyShot(number) {
  const shot = SHOTS[number];
  if (!shot) return false;
  state.layout = shot.layout;
  state.grade = shot.grade;
  state.ink = shot.ink;
  state.caption = shot.caption;
  state.tagline = shot.tagline;
  setExportSize(shot.size[0], shot.size[1]);
  if (shot.coverOnly) document.body.classList.add('shot-cover');
  const captionInput = document.getElementById('caption');
  if (captionInput) captionInput.value = shot.caption;
  const taglineInput = document.getElementById('tagline');
  if (taglineInput) taglineInput.value = shot.tagline;
  return true;
}

export async function setupShot() {
  const params = new URLSearchParams(window.location.search);
  const number = Number(params.get('shot') || 0);
  if (!SHOTS[number]) return false;
  await ready;
  await loadSamples();
  applyShot(number);
  if (tray.length > 0) {
    state.panels[0].photo = tray[0];
    if (tray[1]) state.panels[1].photo = tray[1];
    if (tray[2]) state.panels[2].photo = tray[2] || tray[0];
  }
  try {
    await document.fonts.load('80px Anton');
    await document.fonts.ready;
  } catch (err) {
    window.__errors.push(String(err.message || err));
  }
  render();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
  return true;
}

setupShot();
