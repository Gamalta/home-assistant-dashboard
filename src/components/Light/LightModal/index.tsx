import {
  EntityName,
  FilterByDomain,
  rgb2hs,
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
import {useCallback, useState} from 'react';
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
  const [activeIds, setActiveIds] = useState<
    FilterByDomain<EntityName, 'light'>[]
  >([entities[0]]);
  const [hoverIds, setHoverIds] = useState<
    FilterByDomain<EntityName, 'light'>[]
  >([]);

  const getCoordFromHSLColor = useCallback(
    ([hue, saturation]: [number, number]) => {
      const phi = (hue / 360) * 2 * Math.PI;
      const sat = Math.min(saturation, 1);
      const x = Math.cos(phi) * sat;
      const y = Math.sin(phi) * sat;
      return {x, y};
    },
    []
  );

  const getColorDistance = useCallback(
    (color1: [number, number, number], color2: [number, number, number]) => {
      const [hue1, saturation1] = rgb2hs(color1);
      const [hue2, saturation2] = rgb2hs(color2);

      const coord1 = getCoordFromHSLColor([hue1, saturation1]);
      const coord2 = getCoordFromHSLColor([hue2, saturation2]);

      const dx = coord2.x - coord1.x;
      const dy = coord2.y - coord1.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    [getCoordFromHSLColor]
  );

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
              hoverEntities={hoverIds}
              activeEntities={activeIds}
              lightColors={lightColors}
              onEntitiesClick={entities =>
                setActiveIds(
                  entities.map(
                    entity =>
                      entity.entity_id as FilterByDomain<EntityName, 'light'>
                  )
                )
              }
              onEntitiesChange={(entities, color) => {
                const entityIds = new Set(
                  entities.map(entity => entity.entity_id)
                );
                const newHoverIds = lights
                  .filter(
                    ({entity_id, custom: {color: entityColor}}) =>
                      !entityIds.has(entity_id) &&
                      getColorDistance(color, entityColor) < 0.25
                  )
                  .map(
                    ({entity_id}) =>
                      entity_id as FilterByDomain<EntityName, 'light'>
                  );
                setHoverIds(newHoverIds);
              }}
              onEntitiesChangeApplied={(entities, color) => {
                const entityIds = new Set(
                  entities.map(
                    entity =>
                      entity.entity_id as FilterByDomain<EntityName, 'light'>
                  )
                );
                const newActiveIds: FilterByDomain<EntityName, 'light'>[] = [];
                const lightsToTurnOn = [...entities];

                lights.forEach(light => {
                  const entityId = light.entity_id as FilterByDomain<
                    EntityName,
                    'light'
                  >;
                  if (
                    !entityIds.has(entityId) &&
                    getColorDistance(color, light.custom.color) < 0.25
                  ) {
                    console.log('fusion');
                    newActiveIds.push(entityId);
                    lightsToTurnOn.push(light);
                  }
                });

                setActiveIds([...newActiveIds, ...Array.from(entityIds)]);
                setHoverIds([]);
                lightsToTurnOn.forEach(light =>
                  light.service.turnOn({rgb_color: color})
                );
              }}
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
