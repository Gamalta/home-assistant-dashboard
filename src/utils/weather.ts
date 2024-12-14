const WEATHER_ICONS_PATH = 'weather/';

export function getWeatherIcon(
  condition?: string,
  displayMoon: boolean = false
) {
  if (!condition || condition === 'unknown') condition = 'sunny';
  if (condition === 'execptional') condition = 'lightning-rainy';
  if (condition === 'windy-variant') condition = 'windy';

  if (displayMoon) {
    const date = new Date();
    if ((condition === 'sunny' && date.getHours() > 19) || date.getHours() < 7)
      condition = 'clear-night';
  }
  return condition;
}

export function getWeatherIconPath(
  condition?: string,
  displayMoon: boolean = false
) {
  return `${WEATHER_ICONS_PATH}${getWeatherIcon(condition, displayMoon)}.png`;
}
