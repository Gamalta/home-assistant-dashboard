import {
  AreaPlot,
  ChartsClipPath,
  ChartsTooltip,
  LinePlot,
  ResponsiveChartContainer,
} from '@mui/x-charts';
import {Modal, ModalProps} from '../..';
import {HassEntityWithService} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import {ThermostatIcon} from '../../../Icons/ThermostatIcon';
import Tooltip from '@mui/material/Tooltip';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Battery6BarIcon from '@mui/icons-material/Battery6Bar';
import Battery5BarIcon from '@mui/icons-material/Battery5Bar';
import Battery4BarIcon from '@mui/icons-material/Battery4Bar';
import Battery3BarIcon from '@mui/icons-material/Battery3Bar';
import Battery2BarIcon from '@mui/icons-material/Battery2Bar';
import Battery1BarIcon from '@mui/icons-material/Battery1Bar';
import Battery0BarIcon from '@mui/icons-material/Battery0Bar';
import WifiIcon from '@mui/icons-material/Wifi';
import Wifi2BarIcon from '@mui/icons-material/Wifi2Bar';
import Wifi1BarIcon from '@mui/icons-material/Wifi1Bar';
import IconButton from '@mui/material/IconButton';

type TemperatureModalProps = Omit<ModalProps, 'children'> & {
  temperatureEntity: HassEntityWithService<'sensor'>;
  humidityEntity?: HassEntityWithService<'sensor'>;
  batteryEntity?: HassEntityWithService<'sensor'>;
  signalEntity?: HassEntityWithService<'sensor'>;
};

export function TemperatureModal(props: TemperatureModalProps) {
  const {
    temperatureEntity,
    humidityEntity,
    batteryEntity,
    signalEntity,
    ...modalProps
  } = props;

  const roundToNearest5Minutes = (timestamp: number) => {
    return Math.floor(timestamp / (15 * 60 * 1000)) * (15 * 60 * 1000);
  };

  const temperatureMap = Object.fromEntries(
    temperatureEntity.history.entityHistory.map(data => [
      roundToNearest5Minutes(data.lu * 1000),
      Number(data.s) || null,
    ])
  );
  const tempTimestamps = Object.keys(temperatureMap);
  const temperatures = Object.values(temperatureMap).filter(
    data => data !== null
  );
  const maxTemp = Math.max(...temperatures);
  const minTemp = Math.min(...temperatures);
  const tempLastTimestamp = tempTimestamps[tempTimestamps.length - 1];
  const tempFormatedLastTimestamp = new Date(
    Number(tempLastTimestamp)
  ).toLocaleTimeString('fr', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const humidityMap = Object.fromEntries(
    (humidityEntity?.history?.entityHistory ?? []).map(data => [
      roundToNearest5Minutes(data.lu * 1000),
      Number(data.s) || null,
    ])
  );

  const humTimestamps = Object.keys(humidityMap);
  const humLastTimesptamp = humTimestamps[humTimestamps.length - 1];
  const formatedLastTimeHumidity = new Date(
    Number(humLastTimesptamp)
  ).toLocaleTimeString('fr', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const timestamps = Array.from(
    new Set([...Object.keys(temperatureMap), ...Object.keys(humidityMap)])
  ).sort((a, b) => Number(a) - Number(b));

  let lastTemp = 0;
  let lastHum = 0;
  const dataset = timestamps.map(time => {
    const temperature = temperatureMap[time] || lastTemp;
    const humidity = humidityMap[time] || lastHum;
    lastTemp = temperature;
    lastHum = humidity;
    return {
      timestamp: Number(time),
      temperature,
      humidity,
    };
  });
  const lastTime = dataset[dataset.length - 1]?.timestamp;

  const getBatteryIcon = () => {
    const batteryIcons = [
      <Battery0BarIcon />, // 0% to 12.5%
      <Battery1BarIcon />, // 12.5% to 25%
      <Battery2BarIcon />, // 25% to 37.5%
      <Battery3BarIcon />, // 37.5% to 50%
      <Battery4BarIcon />, // 50% to 62.5%
      <Battery5BarIcon />, // 62.5% to 75%
      <Battery6BarIcon />, // 75% to 87.5%
      <BatteryFullIcon />, // 87.5% to 100%
    ];

    const batteryRange = Math.min(
      Math.floor((Number(batteryEntity?.state) ?? 100) / 12.5),
      7
    );
    return batteryIcons[batteryRange];
  };

  const getSignalIcon = () => {
    const signalStrength = Number(signalEntity?.state) ?? -100;
    if (signalStrength <= -90) {
      return <WifiIcon />; // good signal (<= -90 dBm)
    } else if (signalStrength <= -70) {
      return <Wifi2BarIcon />; // medium signal (> -90, <= -70 dBm)
    } else {
      return <Wifi1BarIcon />; // bad signal (> -70 dBm)
    }
  };

  return (
    <Modal
      {...modalProps}
      action={
        <Stack
          direction="row"
          borderRadius={1}
          border={theme => `1px solid ${theme.palette.divider}`}
          spacing={1}
          p={1}
        >
          {signalEntity && (
            <Stack position="relative">
              <WifiIcon sx={{opacity: 0.3}} />
              <Tooltip
                title={`${signalEntity.state} dBm`}
                sx={{position: 'absolute'}}
              >
                {getSignalIcon()}
              </Tooltip>
            </Stack>
          )}
          {batteryEntity && (
            <Tooltip title={`${batteryEntity.state}%`}>
              {getBatteryIcon()}
            </Tooltip>
          )}
        </Stack>
      }
    >
      <Stack width="500px" height="300px" position="relative">
        <Stack justifyContent="space-between" height="100%" width="fit-content">
          <Stack spacing={1}>
            <Stack direction="row" width="fit-content" zIndex={102}>
              <ThermostatIcon
                sx={{fontSize: '48px', color: 'orange', opacity: 0.75}}
              />
              <Tooltip title={`mis à jour: ${tempFormatedLastTimestamp}`}>
                <Typography variant="h4">{`${temperatureEntity.state}°C`}</Typography>
              </Tooltip>
            </Stack>
            {humidityEntity && (
              <Stack
                direction="row"
                width="fit-content"
                spacing={1}
                zIndex={102}
                pl={1}
              >
                <WaterDropIcon
                  fontSize="large"
                  sx={{color: 'blue', opacity: 0.6}}
                />
                <Tooltip title={`mis à jour: ${formatedLastTimeHumidity}`}>
                  <Typography
                    variant="h5"
                    color={theme => theme.palette.text.secondary}
                  >{`${humidityEntity.state}%`}</Typography>
                </Tooltip>
              </Stack>
            )}
          </Stack>
          <Stack spacing={2} direction="row" ml={-2} mb={-2}>
            <Chip label={`min: ${minTemp}°C`} />
            <Chip label={`max: ${maxTemp}°C`} />
          </Stack>
        </Stack>
        <Stack
          margin="-32px"
          marginTop={0}
          height="275px"
          width="564px"
          position="absolute"
          bottom={0}
          zIndex={101}
        >
          <ResponsiveChartContainer
            margin={{bottom: 0, right: 0, top: 0, left: 0}}
            sx={{
              '& .MuiLineElement-series-temperature': {
                strokeWidth: 3,
              },
              '& .MuiLineElement-series-humidity': {
                strokeWidth: 2,
                opacity: 0.5,
              },
            }}
            dataset={dataset}
            series={[
              {
                id: 'temperature',
                type: 'line',
                dataKey: 'temperature',
                label: 'Température: ',
                yAxisKey: 'temperature',
                color: 'orange',

                area: true,
                valueFormatter: value => `${value}°C`,
              },
              {
                id: 'humidity',
                type: 'line',
                dataKey: 'humidity',
                label: 'Humidité: ',
                yAxisKey: 'humidity',
                color: 'blue',
                valueFormatter: value => `${value}%`,
              },
            ]}
            xAxis={[
              {
                id: 'time',
                dataKey: 'timestamp',
                scaleType: 'utc',
                min: lastTime - 24 * 60 * 60 * 1000,
                max: lastTime,
                valueFormatter: value =>
                  new Date(value).toLocaleTimeString('fr', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
              },
            ]}
            yAxis={[
              {
                id: 'temperature',
                min: minTemp - 1,
                max: maxTemp + 1,
                scaleType: 'linear',
              },
              {
                id: 'humidity',
                min: -80,
                max: 100,
                scaleType: 'linear',
              },
            ]}
          >
            <g clipPath="url(#clip-path)">
              <LinePlot />
              <AreaPlot opacity={0.2} />
            </g>
            <ChartsTooltip />
            <ChartsClipPath id="clip-path" />
          </ResponsiveChartContainer>
        </Stack>
      </Stack>
    </Modal>
  );
}
