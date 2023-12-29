import {
  EntityName,
  FilterByDomain,
  useEntity,
  useLightColor,
} from '@hakit/core';
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
  entityGroup: FilterByDomain<EntityName, 'light'>;
  entities: FilterByDomain<EntityName, 'light'>[];
};

enum LightModalTab {
  Color = 'color',
  Temperature = 'temperature',
  Effect = 'effect',
}

export function LightModal(props: LightModalProps) {
  const {entityGroup, entities} = props;

  const lightGroup = useEntity(entityGroup);
  const lights = entities.map(entity => useEntity(entity));
  const lightColors = useLightColor(lightGroup);
  const [control, setControl] = useState(LightModalTab.Color);
  const [activeIds, setActiveIds] = useState<string[]>([]);

  const onColorPickerClick = (color: [number, number, number]) => {
    console.log(color);
    console.log(activeIds.length);
    lights
      .filter(entity => activeIds.includes(entity.entity_id))
      .forEach(entity => {
        entity.service.turnOn({rgb_color: color});
      });
  };

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
              entities={lights}
              lightColors={lightColors}
              onClick={onColorPickerClick}
              onEntitiesClick={entities =>
                setActiveIds(entities.map(entity => entity.entity_id))
              }
              onEntitiesChangeApplied={(entities, color) =>
                entities.forEach(entity =>
                  entity.service.turnOn({rgb_color: color})
                )
              }
            />
          ),
          temperature: (
            <ColorTempPicker
              key="temp"
              entities={lights}
              onChangeApplied={(entity, kelvin) => {
                //entity.service.turnOn({kelvin});
              }}
            />
          ),
          effect: <div key="effect">Effect</div>,
        }[control]
      }
      <Divider />
      <>{activeIds}</>
      <Divider />
      <ToggleButtonGroup
        exclusive
        value={control}
        onChange={(_, newTab) => newTab && setControl(newTab)}
      >
        <ToggleButton
          value={LightModalTab.Color}
          onClick={() => {
            lightGroup.service.toggle();
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
      <Stack direction="row" flexWrap="wrap" gap={1} width="100%">
        {entities.map(entity => (
          <LightCard
            key={entity}
            entity={entity}
            variant="small"
            onClick={() => setActiveIds([entity])}
            active={activeIds.includes(entity)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
