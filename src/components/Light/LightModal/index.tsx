import {
  HassEntityWithService,
  lightSupportsColor,
  useLightColor,
} from '@hakit/core';
import SvgIcon from '@mui/material/SvgIcon';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNewRounded';
import Brightness6Icon from '@mui/icons-material/Brightness6Rounded';
import {ColorPicker} from './ColorPicker';
import {ColorTempPicker} from './ColorTempPicker';
import Stack from '@mui/material/Stack';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Divider from '@mui/material/Divider';
import {useState} from 'react';

type LightModalProps = {
  entity: HassEntityWithService<'light'>;
};

enum LightModalTab {
  Color = 'color',
  Temperature = 'temperature',
  Effect = 'effect',
}

export function LightModal(props: LightModalProps) {
  const {entity} = props;
  const {attributes} = entity;
  const lightColors = useLightColor(entity);
  const supportsColor = lightSupportsColor(entity);
  const [control, setControl] = useState(
    supportsColor ? LightModalTab.Color : LightModalTab.Temperature
  );

  return (
    <Stack
    //justifyContent={device.xxs ? 'flex-start' : 'center'}
    >
      <Stack>
        {
          {
            color: (
              <ColorPicker
                key="color"
                defaultColor={attributes.rgb_color ?? [0, 0, 0]}
                minKelvin={attributes.min_color_temp_kelvin}
                maxKelvin={attributes.max_color_temp_kelvin}
                lightColors={lightColors}
                onChangeApplied={color => {
                  entity.service.turnOn({rgb_color: color});
                }}
              />
            ),
            temperature: (
              <ColorTempPicker
                key="temp"
                defaultTemperature={attributes.color_temp_kelvin ?? 2000}
                minKelvin={attributes.min_color_temp_kelvin}
                maxKelvin={attributes.max_color_temp_kelvin}
                onChangeApplied={kelvin => {
                  entity.service.turnOn({kelvin});
                }}
              />
            ),
            effect: <div key="effect">Effect</div>,
          }[control]
        }
      </Stack>

      <ToggleButtonGroup
        exclusive
        value={control}
        onChange={(_, newTab) => newTab && setControl(newTab)}
      >
        <ToggleButton
          value={LightModalTab.Color}
          onClick={() => {
            entity.service.toggle();
          }}
          sx={{'&.Mui-selected': {bgcolor: 'transparent'}}}
        >
          <PowerSettingsNewIcon />
        </ToggleButton>
        <Divider />
        {supportsColor && (
          <ToggleButton value={LightModalTab.Color} key="buttonColor">
            <SvgIcon
              viewBox="0 0 24 24"
              sx={{
                backgroundImage: 'url(color_wheel.png)',
                backgroundSize: 'cover',
                borderRadius: '50%',
              }}
            />
          </ToggleButton>
        )}
        <ToggleButton value={LightModalTab.Temperature} key="buttonTemp">
          <SvgIcon
            viewBox="0 0 24 24"
            sx={{
              backgroundImage:
                'linear-gradient(0deg, rgb(166, 209, 255) 0%, rgb(255, 255, 255) 50%, rgb(255, 160, 0) 100%)',
              borderRadius: '50%',
            }}
          />
        </ToggleButton>
        <ToggleButton value={LightModalTab.Effect} key="buttonEffect">
          <AutoAwesomeIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
