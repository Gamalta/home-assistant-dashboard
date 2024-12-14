import {useWeather} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {keyframes} from '@mui/material/styles';
import type {SideBarConfigType} from '../../../configs/house';
import {useState} from 'react';
import {useLongPress} from '../../../hooks/useLongPress';
import {motion} from 'framer-motion';
import {WeatherModal} from '../../Modal/Type/WeatherModal';

const WEATHER_ICONS_PATH = 'weather/';

type WeatherDisplayProps = {
  weather: SideBarConfigType['weather'];
};

export function WeatherDisplay(props: WeatherDisplayProps) {
  const {weather: weatherEntity} = props;
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);
  const weather = useWeather(weatherEntity, {type: 'daily'});
  let condition = weather?.state;

  if (!condition || condition === 'unknown') condition = 'sunny';
  if (condition === 'execptional') condition = 'lightning-rainy';
  if (condition === 'windy-variant') condition = 'windy';

  const date = new Date();
  if ((condition === 'sunny' && date.getHours() > 19) || date.getHours() < 7)
    condition = 'clear-night';

  const weatherLongPress = useLongPress(
    () => setWeatherModalOpen(true),
    () => {}
  );

  return (
    <>
      <Stack
        component={motion.div}
        layoutId="weather-modal"
        justifyContent="end"
        spacing={1}
        sx={{cursor: 'pointer'}}
        {...weatherLongPress}
      >
        <Box
          component="img"
          height="40px"
          width="45px"
          src={`${WEATHER_ICONS_PATH}${condition}.png`}
          sx={{
            objectFit: 'contain',
            animation:
              condition === 'sunny'
                ? `${sunAnimation} 30s linear infinite`
                : `${weatherdAnimation} 6s ease-in-out infinite`,
          }}
        />
        <Typography variant="h6" color="text.secondary" textAlign="center">
          {weather.attributes.temperature ?? '--'}°
        </Typography>
      </Stack>
      <WeatherModal
        id="weather-modal"
        weather={weather}
        icon={`${WEATHER_ICONS_PATH}${condition}.png`}
        open={weatherModalOpen}
        onClose={() => setWeatherModalOpen(false)}
        title="Météo"
      />
    </>
  );
}

const sunAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const weatherdAnimation = keyframes`
  0% {
    transform: translate(-3px, 0) scale(1);
  }
  25% {
    transform: translate(3px, -2px) scale(1.05);
  }
  50% {
    transform: translate(5px, 1px) scale(0.97);
  }
  75% {
    transform: translate(0px, -3px) scale(1.02);
  }
  100% {
    transform: translate(-3px, 0) scale(1);
  }
`;
