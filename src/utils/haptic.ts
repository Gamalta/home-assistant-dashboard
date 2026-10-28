// Safari n'a pas l'API Vibration : sur iPhone, basculer un interrupteur natif
// (<input type="checkbox" switch>) fait vibrer le téléphone.
export function haptic() {
  if (navigator.vibrate) {
    navigator.vibrate(10);
    return;
  }
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  label.style.display = 'none';
  label.append(input);
  document.body.append(label);
  label.click();
  label.remove();
}
