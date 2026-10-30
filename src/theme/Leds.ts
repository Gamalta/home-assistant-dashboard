// Voyants des appareils : couleurs système d'iOS, les mêmes dans les deux thèmes.
export const Leds = {
  green: {color: '#34C759', name: 'vert'},
  orange: {color: '#FF9500', name: 'orange'},
  red: {color: '#FF3B30', name: 'rouge'},
  off: {color: '#8E8E93', name: 'éteint'},
};

export type Led = keyof typeof Leds;
