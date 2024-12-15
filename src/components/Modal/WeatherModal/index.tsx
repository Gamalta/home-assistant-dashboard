import {useWeather} from '@hakit/core';
import {Modal, ModalProps} from '..';
import Stack from '@mui/material/Stack';
import {getWeatherIcon, getWeatherIconPath} from '../../../utils/weather';
import {Typography} from '@mui/material';

type WeatherModalProps = Omit<ModalProps, 'children'> & {
  weather: ReturnType<typeof useWeather>;
};

const DAY_OF_WEEK = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];
const CONDITION = {
  'clear-night': 'Nuit dégagée',
  cloudy: 'Nuageux',
  fog: 'Brouillard',
  lightning: 'Orageux',
  partlycloudy: 'Partiellement nuageux',
  pouring: 'Tempête',
  rainy: 'Pluvieux',
  snowy: 'Chute de neige',
  sunny: 'Ensoleillé',
};

export function WeatherModal(props: WeatherModalProps) {
  const {weather, ...modalProps} = props;

  return (
    <Modal {...modalProps}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          bgcolor="background.tertiary"
          borderRadius={1}
          p={4}
          alignItems="center"
          position="relative"
        >
          <Stack>
            <Typography variant="h5">
              {
                CONDITION[
                  getWeatherIcon(weather.state) as keyof typeof CONDITION
                ]
              }
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">
                {weather.attributes.temperature}
                {weather.attributes.temperature_unit}
              </Typography>
              {weather.forecast?.forecast[0] && (
                <Typography color="text.secondary">
                  {weather.forecast?.forecast[0].templow}°/
                  {weather.forecast?.forecast[0].temperature}°
                </Typography>
              )}
            </Stack>
          </Stack>
          <img
            src={getWeatherIconPath(weather.state, true)}
            style={{
              height: '75px',
              width: '75px',
              objectFit: 'contain',
            }}
          />
          {weather.forecast?.forecast[0] && (
            <img
              src={getWeatherIconPath(
                weather.forecast?.forecast[0].condition,
                true
              )}
              style={{
                position: 'absolute',
                height: '120px',
                width: '120px',
                objectFit: 'contain',
                opacity: 0.2,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={2}>
          {weather.forecast?.forecast.slice(1, 5).map(period => (
            <Stack
              key={period.datetime}
              alignItems="center"
              bgcolor="background.tertiary"
              borderRadius={1}
              py={2}
              spacing={1}
              width="124px"
            >
              <Typography>
                {DAY_OF_WEEK[new Date(period.datetime).getDay()]}
              </Typography>
              <img
                src={getWeatherIconPath(period.condition)}
                style={{
                  height: '60px',
                  width: '60px',
                  objectFit: 'contain',
                }}
              />
              <Stack alignItems="center">
                <Typography>
                  {period.temperature}
                  {weather.attributes.temperature_unit}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  {period.templow}
                  {weather.attributes.temperature_unit}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Modal>
  );
}
