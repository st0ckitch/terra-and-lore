/* Hero scene configuration: the Meshy forest island and the cat's route over it. Units are world units (island scale applied). */
window.TL_HERO = {
  actorHeight: 0.8,
  scene: {
    island: { url: 'models/forest.glb' + (window.TL_MODEL_EXT || ''), scale: 3.4, position: [0, 0.68, 0], rotation: [0, 0, 0] },
    path: [[0.10, 0, 0.80], [0.09, 0, 0.58], [0.06, 0, 0.36], [0.02, 0, 0.14], [-0.06, 0, -0.04], [-0.22, 0, -0.19], [-0.33, 0, -0.33], [-0.37, 0, -0.46]].map(function (p) { return [p[0] * 3.4, 0, p[2] * 3.4]; }),
    jumpAt: [5],
    hopAt: -1,
    speed: 1.5,
    camera: { position: [0.4, 4.1, 9.6], target: [0, 0.2, 0], fov: 32 }
  }
};
