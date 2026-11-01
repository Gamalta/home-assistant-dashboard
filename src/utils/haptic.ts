// Safari n'a pas l'API Vibration, et depuis iOS 26.5 un clic de script ne
// fait plus vibrer l'iPhone : c'est le toucher d'une tuile qui y bascule un
// interrupteur caché (Mobile/Tile).
export function haptic() {
  navigator.vibrate?.(10);
}
