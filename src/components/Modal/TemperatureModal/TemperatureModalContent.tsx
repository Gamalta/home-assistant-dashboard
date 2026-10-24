import WaterDropIcon from '@mui/icons-material/WaterDrop';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  alignHistories,
  formatTime,
  isHistoryLoading,
  valueRange,
} from '../../../utils/chart';
import {Chart} from '../../Charts/Chart';
import {ThermostatIcon} from '../../Icons/ThermostatIcon';
import {EntityName, HassEntityWithService, useEntity} from '@hakit/core';

const HISTORY_OPTIONS = {
  returnNullIfNotFound: true,
  historyOptions: {disable: false, hoursToShow: 24},
} as const;

type TemperatureModalContentProps = {
  temperatureEntity: HassEntityWithService<'sensor'>;
  humidityEntity?: HassEntityWithService<'sensor'>;
};

export function TemperatureModalContent(props: TemperatureModalContentProps) {
  const {temperatureEntity, humidityEntity} = props;

  const temperatureHistory = useEntity(
    temperatureEntity.entity_id as EntityName,
    HISTORY_OPTIONS,
  )?.history;
  const humidityHistory = useEntity(
    (humidityEntity?.entity_id ?? 'unknown') as EntityName,
    HISTORY_OPTIONS,
  )?.history;

  const {
    x,
    data: [temperatures, humidities],
  } = alignHistories([
    temperatureHistory?.entityHistory ?? [],
    humidityHistory?.entityHistory ?? [],
  ]);
  const range = valueRange(temperatures);
  const temperatureUnit = temperatureEntity.attributes.unit_of_measurement;
  const humidityUnit = humidityEntity?.attributes.unit_of_measurement ?? '%';
  const format = (unit?: string) => (value: number) =>
    `${value.toLocaleString('fr', {maximumFractionDigits: 1})}${unit ?? ''}`;

  return (
    <Chart
      bleed
      loading={isHistoryLoading(temperatureHistory)}
      x={x}
      formatX={formatTime}
      series={[
        {
          id: 'temperature',
          label: 'Température',
          data: temperatures,
          color: 'warning',
          format: format(temperatureUnit),
        },
        ...(humidityEntity
          ? [
              {
                id: 'humidity',
                label: 'Humidité',
                data: humidities,
                color: 'info',
                variant: 'line' as const,
                format: format(humidityUnit),
              },
            ]
          : []),
      ]}
      sx={{height: 300, width: 500}}
    >
      <Stack direction="row" sx={{justifyContent: 'space-between'}}>
        <Stack spacing={1}>
          <Stack direction="row">
            <ThermostatIcon
              sx={{fontSize: '48px', color: 'warning.main', opacity: 0.75}}
            />
            <Tooltip
              title={`mis à jour: ${formatTime(temperatureEntity.last_updated)}`}
            >
              <Typography
                variant="h4"
                sx={{pointerEvents: 'auto'}}
              >{`${temperatureEntity.state}${temperatureUnit}`}</Typography>
            </Tooltip>
          </Stack>
          {humidityEntity && (
            <Stack direction="row" spacing={1} sx={{pl: 1}}>
              <WaterDropIcon
                fontSize="large"
                sx={{color: 'info.main', opacity: 0.75}}
              />
              <Tooltip
                title={`mis à jour: ${formatTime(humidityEntity.last_updated)}`}
              >
                <Typography
                  variant="h5"
                  color="textSecondary"
                  sx={{pointerEvents: 'auto'}}
                >{`${humidityEntity.state}${humidityUnit}`}</Typography>
              </Tooltip>
            </Stack>
          )}
        </Stack>
        {/* En haut à droite, au-dessus de la courbe qui ne monte pas jusque-là. */}
        {range && (
          <Stack spacing={1} sx={{alignItems: 'flex-end'}}>
            <Chip
              size="small"
              label={`max: ${format(temperatureUnit)(range.max)}`}
            />
            <Chip
              size="small"
              label={`min: ${format(temperatureUnit)(range.min)}`}
            />
          </Stack>
        )}
      </Stack>
    </Chart>
  );
}
