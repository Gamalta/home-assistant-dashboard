import {HassEntityWithService, useEntity} from '@hakit/core';
import {Modal, ModalProps} from '..';
import Stack from '@mui/material/Stack';
import {Thermostat} from 'react-thermostat';
import IconButton from '@mui/material/IconButton';
import {useCallback, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import WeekendIcon from '@mui/icons-material/WeekendRounded';
import HotelIcon from '@mui/icons-material/HotelRounded';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import {LeaveIcon} from '../../Icons/LeaveIcon';
import {ThermostatIcon} from '../../Icons/ThermostatIcon';
import Typography from '@mui/material/Typography';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import {TemperatureModalContent} from '../TemperatureModal/TemperatureModalContent';
import {ClimateConfigType} from '../../../configs/house';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import TuneIcon from '@mui/icons-material/TuneRounded';

type ClimateModalProps = Omit<ModalProps, 'children'> & {
  climateConfig: ClimateConfigType;
  climateEntity: HassEntityWithService<'climate'>;
};

enum PresetMode {
  Sleep = 'sleep',
  Comfort = 'comfort',
  Eco = 'eco',
  Off = 'off',
}

function interpolateColor(
  color1: string,
  color2: string,
  factor: number
): string {
  const hexToRgb = (hex: string) =>
    hex.match(/\w\w/g)!.map(x => parseInt(x, 16));
  const rgbToHex = (rgb: number[]) =>
    '#' + rgb.map(x => Math.round(x).toString(16).padStart(2, '0')).join('');

  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const result = c1.map((c, i) => c + (c2[i] - c) * factor);
  return rgbToHex(result as number[]);
}

const getModeColors = (
  presetMode: PresetMode,
  temperature: number,
  targetTemperature: number
) => {
  const baseNeutral = '#848484';
  const distance = targetTemperature - temperature;

  if (presetMode === PresetMode.Off) {
    return ['#848484', '#383838'];
  }

  if (distance <= -10) {
    return ['#2c8e98', '#dae8eb'];
  } else if (distance >= 10) {
    return ['#cfac48', '#c96100'];
  } else if (Math.abs(distance) <= 1) {
    return ['#848484', '#848484'];
  } else if (distance < -1) {
    const factor = (distance + 10) / 9;
    const coolColors = ['#2c8e98', '#dae8eb'];
    return [
      interpolateColor(coolColors[0], baseNeutral, factor),
      interpolateColor(coolColors[1], baseNeutral, factor),
    ];
  } else {
    const factor = (distance - 1) / 9;
    const heatColors = ['#cfac48', '#c96100'];
    return [
      interpolateColor(baseNeutral, heatColors[0], factor),
      interpolateColor(baseNeutral, heatColors[1], factor),
    ];
  }
};

export default function ClimateModal(props: ClimateModalProps) {
  const {climateConfig, climateEntity, ...modalProps} = props;
  const [tab, setTab] = useState<'control' | 'history'>('control');
  const [targetTemperature, setTargetTemperature] = useState(
    climateEntity.attributes.temperature
  );
  const [presetMode, setPresetMode] = useState<PresetMode>(
    Object.values<string>(PresetMode).includes(
      climateEntity.attributes.preset_mode ?? ''
    )
      ? (climateEntity.attributes.preset_mode as PresetMode)
      : PresetMode.Off
  );

  const temperatureEntity = useEntity(
    climateConfig.temperatureEntityId ?? 'unknown',
    {
      returnNullIfNotFound: true,
      historyOptions: {
        disable: false,
        hoursToShow: 24,
      },
    }
  );

  const humidityEntity = useEntity(
    climateConfig.humidityEntityId ?? 'unknown',
    {
      returnNullIfNotFound: true,
      historyOptions: {
        disable: false,
        hoursToShow: 24,
      },
    }
  );

  const isActive = presetMode !== PresetMode.Off;
  const theme = useTheme();

  const getThermostatColors = useCallback(
    () =>
      getModeColors(
        presetMode,
        climateEntity.attributes.current_temperature ?? 22,
        targetTemperature
      ),
    [
      presetMode,
      climateEntity.attributes.current_temperature,
      targetTemperature,
    ]
  );

  return (
    <Modal
      action={
        temperatureEntity &&
        {
          control: (
            <IconButton onClick={() => setTab('history')}>
              <AssessmentIcon />
            </IconButton>
          ),
          history: (
            <IconButton onClick={() => setTab('control')}>
              <TuneIcon />
            </IconButton>
          ),
        }[tab]
      }
      {...modalProps}
    >
      {
        {
          control: (
            <Stack width="350px" position="relative" alignItems="center">
              <Stack width="200px" mt={7} spacing={3} alignItems="center">
                <Thermostat
                  min={climateEntity.attributes.min_temp}
                  max={climateEntity.attributes.max_temp}
                  disabled={!isActive}
                  value={targetTemperature}
                  valueSuffix="°C"
                  track={{
                    colors: getThermostatColors(),
                    markers: {
                      main: {color: theme.palette.background.paper},
                      sub: {color: theme.palette.background.paper},
                    },
                  }}
                  onChange={newTemp =>
                    setTargetTemperature(Number(newTemp.toFixed(0)))
                  }
                />
                <IconButton
                  size="large"
                  sx={{
                    color: 'text.primary',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: isActive ? 'text.primary' : 'text.disabled',
                  }}
                  onClick={() =>
                    setPresetMode(
                      presetMode === PresetMode.Off
                        ? PresetMode.Comfort
                        : PresetMode.Off
                    )
                  }
                >
                  <PowerSettingsNewRoundedIcon />
                </IconButton>
              </Stack>
              <Stack
                spacing={1}
                p={1}
                position="absolute"
                right={0}
                top={0}
                bgcolor="background.tertiary"
                borderRadius={10}
              >
                <IconButton
                  sx={{
                    color:
                      presetMode === PresetMode.Comfort
                        ? theme.palette.primary.main
                        : undefined,
                    border: `solid 1px ${presetMode === PresetMode.Comfort ? theme.palette.primary.main : 'white'}`,
                  }}
                  onClick={() => setPresetMode(PresetMode.Comfort)}
                >
                  <WeekendIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color:
                      presetMode === PresetMode.Sleep ? '#04697bff' : undefined,
                    border: `solid 1px ${presetMode === PresetMode.Sleep ? '#04697bff' : 'white'}`,
                  }}
                  onClick={() => setPresetMode(PresetMode.Sleep)}
                >
                  <HotelIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color:
                      presetMode === PresetMode.Eco ? '#3e913eff' : undefined,
                    border: `solid 1px ${presetMode === PresetMode.Eco ? '#3e913eff' : 'white'}`,
                  }}
                  onClick={() => setPresetMode(PresetMode.Eco)}
                >
                  <LeaveIcon />
                </IconButton>
              </Stack>
              <Stack mx={-1} spacing={1} position="absolute" left={0} top={0}>
                <Stack direction="row" width="fit-content" zIndex={102}>
                  <ThermostatIcon
                    sx={{fontSize: '48px', color: 'orange', opacity: 0.75}}
                  />
                  <Typography variant="h4">{`${climateEntity.attributes.current_temperature ?? '--'}°C`}</Typography>
                </Stack>
                {climateEntity.attributes.current_humidity && (
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
                    <Typography
                      variant="h5"
                      color="textSecondary"
                    >{`${climateEntity.attributes.current_humidity}%`}</Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>
          ),
          history: temperatureEntity && (
            <TemperatureModalContent
              temperatureEntity={temperatureEntity}
              humidityEntity={humidityEntity ?? undefined}
            />
          ),
        }[tab]
      }
    </Modal>
  );
}
