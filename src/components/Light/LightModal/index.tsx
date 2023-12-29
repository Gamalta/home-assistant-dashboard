import {HassEntityWithService, useLightColor} from '@hakit/core';
import SvgIcon from '@mui/material/SvgIcon';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNewRounded';
import {ColorPicker} from './ColorPicker';
import {ColorTempPicker} from './ColorTempPicker';
import Stack from '@mui/material/Stack';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Divider from '@mui/material/Divider';
import {useState} from 'react';
import {LightCard} from '../lightCard';

type LightModalProps = {
  entityGroup: HassEntityWithService<'light'>;
  entities: HassEntityWithService<'light'>[];
};

enum LightModalTab {
  Color = 'color',
  Temperature = 'temperature',
  Effect = 'effect',
}

export function LightModal(props: LightModalProps) {
  const {entityGroup, entities} = props;
  const lightColors = useLightColor(entityGroup);
  const [control, setControl] = useState(LightModalTab.Color);

  return (
    <Stack
      gap={2}
      justifyContent="space-evenly"
      alignItems="center"
      height="100%"
    >
      {
        {
          color: (
            <ColorPicker
              key="color"
              entities={entities}
              lightColors={lightColors}
              onChangeApplied={(entity, color) => {
                entity.service.turnOn({rgb_color: color});
              }}
            />
          ),
          temperature: (
            <ColorTempPicker
              key="temp"
              entities={entities}
              onChangeApplied={(entity, kelvin) => {
                //entity.service.turnOn({kelvin});
              }}
            />
          ),
          effect: <div key="effect">Effect</div>,
        }[control]
      }

      <ToggleButtonGroup
        exclusive
        value={control}
        onChange={(_, newTab) => newTab && setControl(newTab)}
      >
        <ToggleButton
          value={LightModalTab.Color}
          onClick={() => {
            entityGroup.service.toggle();
          }}
          sx={{'&.Mui-selected': {bgcolor: 'transparent'}}}
        >
          <PowerSettingsNewIcon />
        </ToggleButton>
        <Divider />
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
      <Stack direction="row" flexWrap="wrap" gap={2} width="100%">
        {entities.map(entity => (
          <LightCard entity={entity} variant="small" />
        ))}
      </Stack>
    </Stack>
  );
}
