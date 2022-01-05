export const FRAME_PROFILES_SIZE = {
  bottom: 80,
  up: 40,
  side: 60, // 25
};

export const DEFAULT_FRAME_COLOR = 'darkgray';

export const FILLING_COLORS = {
  highlight: {
    background: '#3B89EB',
    stroke: '#3A84E3',
  },
};

export const IMAGES_PATH = {
  chipboardPath: '/src/client/assets/images/visualisation/chipboard-texture.jpg',
  glassPath: '/src/client/assets/images/visualisation/glass-rect.svg',
  mirrorPath: '/src/client/assets/images/visualisation/mirror-rect.svg',
};

export const MIRROR_GRADIENT = [
  0,
  'rgb(235,239,242)',
  0.2,
  'rgb(194,204,209)',
  0.3,
  'rgb(235,239,242)',
  0.5,
  'rgb(194,204,209)',
  0.7,
  'rgb(235,239,242)',
  0.9,
  'rgb(179,186,189)',
  1,
  'rgb(235,239,242)',
];

export const GLASS_GRADIENT = [
  0,
  'rgb(173,207,219)',
  0.2,
  'rgb(231,247,255)',
  0.3,
  'rgb(173,207,219)',
  0.5,
  'rgb(231,247,255)',
  0.6,
  'rgb(173,207,219)',
  0.8,
  'rgb(231,247,255)',
  1,
  'rgb(173,207,219)',
];

// Hardcoded to avoid showing bad-looking images
export const dspListWithWhiteMargins = ['2298 PR'];
