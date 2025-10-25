export const centipedeParams = {
  // body/legs
  ribStep: 2,
  ribLenHead: 168,
  ribLenTail: 60,
  sizeBlend: 0.4,
  strideMs: 900,
  bodySpriteScale: 0.75,
  legSpriteScale: 0.9,
  // head wave (index uses this)
  headWave: {
    omega: 0.012,      // rad/ms
    ampMax: 60,        // px
    speedScale: 180,   // px per (px/ms)
    minSpeed: 0.02,    // px/ms threshold
    tailRetention: 0.98,
  },
};


