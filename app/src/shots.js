// Neon Bay Cover Art — fixed scenes for screenshots.
//
// A `?shot=` query on the editor page sets up one scene instead of the bare
// editor, so a screenshot captures the app at work. Shot 1 is the cover
// itself, shot 2 the editor with a photo loaded, shots 3 and 4 the other two
// post sizes. Cover shots hide the editor chrome and show only the canvas.
//
// The scene is ready once the samples are loaded and the Anton font is in:
// the caller polls window.__shotReady. window.__errors collects page errors
// for the test harness, and window.__ready is set once the page loads.

window.__errors = [];
window.addEventListener('error', (e) => window.__errors.push(String(e.message || e.error)));
window.__ready = true;

/**
 * Runs one shot scene. `api` is the editor wiring from main.js: loading the
 * samples, setting caption, tagline, layout, grade and size, placing photos
 * and crops, redrawing, and reporting whether the font is ready.
 */
export async function runShot(shot, params, api) {
  const scenes = {
    1: {
      cover: true,
      setup: async () => {
        await api.loadSamples();
        api.setLayout('hero');
        api.setGrade('sunset');
        api.setCaption(params.get('caption') || 'Sunset Heist');
        api.setTagline('VICE CITY • 2026');
        api.setSize('square');
        api.setPanelCrop(0, 1.15, 0, -0.1);
        api.setPanelCrop(1, 1.1, 0.1, 0);
        api.setPanelCrop(2, 1.1, -0.1, 0);
      },
    },
    2: {
      cover: false,
      setup: async () => {
        await api.loadSamples();
        api.setLayout('hero');
        api.setGrade('sunset');
        api.setCaption(params.get('caption') || 'Sunset Heist');
        api.setTagline('VICE CITY • 2026');
        api.setSize('square');
      },
    },
    3: {
      cover: true,
      setup: async () => {
        await api.loadSamples();
        api.setLayout('triptych');
        api.setGrade('vice');
        api.setCaption(params.get('caption') || 'Boulevard Queen');
        api.setTagline('NEON BAY • 2026');
        api.setSize('portrait');
        api.setPanelPhoto(0, 1);
        api.setPanelPhoto(1, 0);
        api.setPanelPhoto(2, 1);
        api.setPanelCrop(0, 1.2, 0, 0);
        api.setPanelCrop(1, 1.15, 0, -0.1);
        api.setPanelCrop(2, 1.2, 0.1, 0);
      },
    },
    4: {
      cover: true,
      setup: async () => {
        await api.loadSamples();
        api.setLayout('split');
        api.setGrade('neon');
        api.setCaption(params.get('caption') || 'Night Shift');
        api.setTagline('NEON BAY • 2026');
        api.setSize('wide');
        api.setPanelPhoto(0, 0);
        api.setPanelPhoto(1, 1);
        api.setPanelPhoto(2, 0);
        api.setPanelCrop(0, 1.1, 0, 0);
        api.setPanelCrop(1, 1.2, -0.1, 0);
        api.setPanelCrop(2, 1.1, 0.1, -0.1);
      },
    },
  };

  const scene = scenes[shot] ?? scenes[1];
  if (scene.cover) document.body.classList.add('shot-cover');
  await scene.setup();
  api.redraw();
  if (api.fontReady()) {
    window.__shotReady = true;
  } else {
    window.__shotReadyPending = true;
  }
}
