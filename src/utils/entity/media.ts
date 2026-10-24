// Valeurs de MediaPlayerEntityFeature dans Home Assistant.
export enum MediaPlayerFeature {
  PAUSE = 1,
  VOLUME_SET = 4,
  VOLUME_MUTE = 8,
  PREVIOUS_TRACK = 16,
  NEXT_TRACK = 32,
  TURN_ON = 128,
  TURN_OFF = 256,
  SELECT_SOURCE = 2048,
  PLAY = 16384,
}

export function isMediaOn(state: string) {
  return !['off', 'standby', 'unavailable', 'unknown'].includes(state);
}

// Sans titre (accueil d'une application sur l'Apple TV), on affiche l'application.
export function mediaTitle(attributes: {
  media_title?: string;
  app_name?: string;
}) {
  return attributes.media_title || attributes.app_name;
}
