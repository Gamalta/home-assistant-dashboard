import {EntityName, FilterByDomain, useWeather} from '@hakit/core';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import {motion} from 'framer-motion';
import {useState} from 'react';
import {getWeatherIconPath} from '../../utils/weather';
import {WeatherModal} from '../Modal/WeatherModal';

type MobileWeatherProps = {
  weather: FilterByDomain<EntityName, 'weather'>;
};

export function MobileWeather(props: MobileWeatherProps) {
  const {weather: weatherEntity} = props;
  const [open, setOpen] = useState(false);
  const weather = useWeather(weatherEntity, {type: 'daily'});
  const condition = weather.forecast?.forecast[0].condition ?? weather?.state;
  const temperature = weather.attributes.temperature;

  return (
    <>
      <motion.div layoutId="weather-modal">
        <ButtonBase
          aria-label="Météo"
          onClick={() => setOpen(true)}
          sx={{gap: 0.75, p: 0.5, borderRadius: 2}}
        >
          <Box
            component="img"
            src={getWeatherIconPath(condition, true)}
            alt=""
            sx={{width: 36, height: 24, objectFit: 'contain'}}
          />
          <Typography sx={{fontWeight: 500}}>
            {temperature === undefined ? '--' : Math.round(temperature)}°
          </Typography>
        </ButtonBase>
      </motion.div>
      <WeatherModal
        id="weather-modal"
        weather={weather}
        open={open}
        onClose={() => setOpen(false)}
        title="Météo"
      />
    </>
  );
}
