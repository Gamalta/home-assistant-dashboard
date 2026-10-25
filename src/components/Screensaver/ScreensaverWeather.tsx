import {EntityName, FilterByDomain, useWeather} from '@hakit/core';
import CloudIcon from '@mui/icons-material/CloudRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {getWeatherIconPath} from '../../utils/weather';
import {ScreensaverCard} from './ScreensaverCard';

type ScreensaverWeatherProps = {
  weather: FilterByDomain<EntityName, 'weather'>;
};

export function ScreensaverWeather(props: ScreensaverWeatherProps) {
  const {weather: weatherEntity} = props;
  const weather = useWeather(weatherEntity, {type: 'daily'});
  const [today, ...days] = weather.forecast?.forecast ?? [];

  return (
    <ScreensaverCard icon={<CloudIcon />} title="Météo">
      <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
        <Box
          component="img"
          src={getWeatherIconPath(weather.state, true)}
          sx={{width: 64, height: 64, objectFit: 'contain'}}
        />
        <Typography variant="h3">
          {weather.attributes.temperature ?? '--'}°
        </Typography>
        {today && (
          <Typography color="textSecondary">
            {today.templow}° / {today.temperature}°
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={3}>
        {days.slice(0, 4).map(period => (
          <Stack key={period.datetime} sx={{alignItems: 'center'}}>
            <Typography variant="body2" color="textSecondary">
              {new Date(period.datetime).toLocaleDateString('fr-FR', {
                weekday: 'short',
              })}
            </Typography>
            <Box
              component="img"
              src={getWeatherIconPath(period.condition)}
              sx={{width: 36, height: 36, objectFit: 'contain'}}
            />
            <Typography variant="body2">{period.temperature}°</Typography>
          </Stack>
        ))}
      </Stack>
    </ScreensaverCard>
  );
}
