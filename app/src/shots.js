// Neon Bay Cover Art — fixed screenshot scenes.
// ?shot=1..4 set up one cover or the editor so screenshots show the app
// at work with real photos loaded. Nothing here is a mock: every scene is
// the app drawing its own cover with the same engine as the editor.

const SCENES = {
  // 1-cover: the wide cover itself, bright sunset grade, hero layout.
  1: {
    mode: 'cover',
    layout: 'hero',
    grade: 'sunset',
    strength: 70,
    ink: '#ffffff',
    caption: 'Sunset Heist',
    tagline: 'VICE CITY • 2026',
    sizeIndex: 2,
    panels: [0, 1, 0],
    canvas: { w: 1280, h: 800 },
  },
  // 2-editor: the editor with photos loaded, hero layout.
  2: {
    mode: 'editor',
    layout: 'hero',
    grade: 'sunset',
    strength: 70,
    ink: '#ffffff',
    caption: 'Sunset Heist',
    tagline: 'VICE CITY • 2026',
    sizeIndex: 0,
    panels: [0, 1, 0],
    canvas: null,
  },
  // 3-cover-portrait: portrait cover, triptych, vice pink grade.
  3: {
    mode: 'cover',
    layout: 'triptych',
    grade: 'vice',
    strength: 80,
    ink: '#ffd23f',
    caption: 'Boulevard Queen',
    tagline: 'NEON BAY • 2026',
    sizeIndex: 1,
    panels: [0, 1, 0],
    canvas: { w: 640, h: 800 },
  },
  // 4-cover-wide: wide cover, split screen, neon nights grade.
  4: {
    mode: 'cover',
    layout: 'split',
    grade: 'neon',
    strength: 75,
    ink: '#4de8ff',
    caption: 'Night Shift',
    tagline: 'AFTER DARK • NEON BAY',
    sizeIndex: 2,
    panels: [0, 1, 0],
    canvas: { w: 1280, h: 800 },
  },
};

// Configure the state for one shot. Returns true when a shot was applied.
export async function applyShotMode(env) {
  const params = new URLSearchParams(window.location.search);
  const shotId = Number(params.get('shot'));
  const scene = SCENES[shotId];
  if (!scene) return false;

  await env.loadSamples();
  const { state } = env;
  state.layout = scene.layout;
  state.grade = scene.grade;
  state.strength = scene.strength;
  state.ink = scene.ink;
  state.caption = scene.caption;
  state.tagline = scene.tagline;
  state.sizeIndex = scene.sizeIndex;
  state.selected = 0;
  scene.panels.forEach((photoIndex, i) => {
    state.panels[i].photo = photoIndex < env.photos.length ? photoIndex : null;
    state.panels[i].zoom = 1;
    state.panels[i].panX = 0;
    state.panels[i].panY = 0;
  });

  const captionInput = document.getElementById('caption');
  if (captionInput) captionInput.value = scene.caption;
  const taglineInput = document.getElementById('tagline');
  if (taglineInput) taglineInput.value = scene.tagline;

  if (scene.mode === 'cover') {
    document.body.classList.add('shot-cover');
    env.setPreviewOverride(scene.canvas);
  }
  env.syncPanelControls();
  env.render();
  return true;
}
