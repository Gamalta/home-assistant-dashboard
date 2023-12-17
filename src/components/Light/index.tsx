import {useEffect, useState} from 'react';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import {EntityName, FilterByDomain, useEntity} from '@hakit/core';
import {useDialogContext} from '../../contexts/DialogContext';
import {LightModal} from './LightModal';

type LightProps = {
  entityGroup: FilterByDomain<EntityName, 'light'>;
  lights: FilterByDomain<EntityName, 'light'>[];
  icon?: React.ReactNode;
};

export function Light(props: LightProps) {
  const {entityGroup, lights, icon} = props;

  const entity = useEntity(entityGroup);
  const entities = lights.map(light => useEntity(light));
  const {open, setContent} = useDialogContext();

  const [brightness, setBrightness] = useState(
    entity.attributes.brightness
      ? Math.round((entity.attributes.brightness * 100) / 255)
      : 0
  );

  const textColor =
    entity.state === 'on' &&
    (entity.custom.color[0] * 299 +
      entity.custom.color[1] * 587 +
      entity.custom.color[2] * 114) /
      1000 <
      128
      ? 'white'
      : 'black';

  useEffect(() => {
    if (entity.attributes.brightness) {
      setBrightness(Math.round((entity.attributes.brightness * 100) / 255));
    }
  }, [entity.state]);

  return (
    <Card
      sx={{
        background: `linear-gradient(0deg, rgba(0, 0, 0, ${
          ((100 - brightness) * 0.5) / 100 + 0.3
        }) 0%, rgba(255, 255, 255, 0) 100%), ${entity.custom.hexColor}`,
      }}
    >
      <CardHeader
        sx={{width: '100%'}}
        avatar={
          <Avatar
            onClick={() => {
              setContent(
                <LightModal entityGroup={entity} entities={entities} />
              );
              open();
            }}
            sx={{
              bgcolor: 'transparent',
              '& svg': {
                height: 46,
                width: 46,
                fill: textColor,
              },
            }}
          >
            {icon}
          </Avatar>
        }
        action={
          <Switch
            checked={entity.state === 'on'}
            onChange={(_, checked) =>
              checked
                ? entity.service.turnOn()
                : (entity.service.turnOff(), setBrightness(0))
            }
          />
        }
        title={entity.attributes.friendly_name}
        titleTypographyProps={{
          color: textColor,
        }}
        subheader={entity.state === 'on' ? `allumé - ${brightness}%` : 'éteint'}
        subheaderTypographyProps={{
          color: textColor,
        }}
      />
      <Box px={2}>
        <Slider
          value={brightness}
          onChange={(_, value) => setBrightness(value as number)}
          onChangeCommitted={(_, value) =>
            entity.service.turnOn({
              brightness: Math.round((value as number) * 2.55),
            })
          }
        />
      </Box>
    </Card>
  );
}
