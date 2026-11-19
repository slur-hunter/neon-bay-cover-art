// Fixed scenes for screenshots. `?shot=editor` shows the editor with sample photos
// loaded; `?shot=cover` shows the cover alone, edge to edge. Query params:
// `size` (square|portrait|wide), `layout` (hero|triptych|split), `grade`,
// `caption`, `tagline`. window.__shotReady is set once the scene is painted
// with the Anton font loaded, so a screenshot never catches a fallback font.
export async function runShot(shot, query, env) {
  const size = query.get('size') ?? 'square';
  const layout = query.get('layout') ?? 'hero';
  const grade = query.get('grade') ?? 'sunset';
  const caption = query.get('caption') ?? 'Sunset Heist';
  const tagline = query.get('tagline') ?? 'VICE CITY • 2026';

  if (shot === 'cover') document.body.classList.add('shot-cover');
  env.setSize(size);
  env.setLayout(layout);
  env.setGrade(grade);
  env.setCaption(caption);
  env.setTagline(tagline);
  await env.loadSamples();
  // Vary the crops so the panels do not all show the same framing. The hero
  // layout's wide top panel needs the photo shifted down (positive oy shows the
  // top of the photo) so the face is not cut off; the narrow triptych panels
  // stay near-centred so faces stay in frame.
  if (layout === 'hero') {
    env.setPanelCrop(0, 1.15, 0, 0.55);
    env.setPanelCrop(1, 1.3, -0.2, 0.1);
    env.setPanelCrop(2, 1.1, 0.15, 0.9);
  } else if (layout === 'triptych') {
    env.setPanelCrop(0, 1.15, 0.1, -0.05);
    env.setPanelCrop(1, 1.3, 0, 0.1);
    env.setPanelCrop(2, 1.1, 0.15, 0.05);
  } else {
    env.setPanelCrop(0, 1.15, 0.1, -0.05);
    env.setPanelCrop(1, 1.3, -0.2, 0.1);
    env.setPanelCrop(2, 1.1, 0.15, 0.9);
  }
  await document.fonts.load('40px Anton');
  env.redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
