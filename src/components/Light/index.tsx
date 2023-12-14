import {useEffect, useState} from 'react';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import {EntityName, FilterByDomain, useEntity} from '@hakit/core';
import {useDialogContext} from '../../contexts/DialogContext';

require('dayjs/locale/fr');
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(duration);
dayjs.extend(relativeTime);

type LightProps = {
  entity: FilterByDomain<EntityName, 'light'>;
  icon?: React.ReactNode;
};

export function Light(props: LightProps) {
  const {entity, icon} = props;
  const lightEntity = useEntity(entity);
  const {open} = useDialogContext();

  const lastUpdated = dayjs
    .duration(dayjs().diff(dayjs(lightEntity.last_updated)))
    .locale('fr')
    .humanize();

  const [brightness, setBrightness] = useState(
    lightEntity.attributes.brightness
      ? Math.round((lightEntity.attributes.brightness * 100) / 255)
      : 0
  );

  const textColor =
    lightEntity.state === 'on' &&
    (lightEntity.custom.color[0] * 299 +
      lightEntity.custom.color[1] * 587 +
      lightEntity.custom.color[2] * 114) /
      1000 <
      128
      ? 'white'
      : 'black';

  useEffect(() => {
    if (lightEntity.attributes.brightness) {
      setBrightness(
        Math.round((lightEntity.attributes.brightness * 100) / 255)
      );
    }
  }, [lightEntity.state]);

  return (
    <Card
      sx={{
        background: `linear-gradient(0deg, rgba(0, 0, 0, ${
          ((100 - brightness) * 0.5) / 100 + 0.3
        }) 0%, rgba(255, 255, 255, 0) 100%), ${lightEntity.custom.hexColor}`,
      }}
    >
      <CardHeader
        sx={{width: '100%'}}
        avatar={
          <Avatar
            sx={{bgcolor: 'red'}}
            onClick={() => {
              open();
            }}
          >
            {icon}
          </Avatar>
        }
        action={
          <Switch
            checked={lightEntity.state === 'on'}
            onChange={(_, checked) =>
              checked
                ? lightEntity.service.turnOn()
                : (lightEntity.service.turnOff(), setBrightness(0))
            }
          />
        }
        title={lightEntity.attributes.friendly_name}
        titleTypographyProps={{
          color: textColor,
        }}
        subheader={`${
          lightEntity.state === 'on' ? `allumé - ${brightness}%` : 'éteint'
        } - modifié il y a ${lastUpdated}`}
        subheaderTypographyProps={{
          color: textColor,
        }}
      />
      <Box px={2}>
        <Slider
          value={brightness}
          onChange={(_, value) => setBrightness(value as number)}
          onChangeCommitted={(_, value) =>
            lightEntity.service.turnOn({
              brightness: Math.round((value as number) * 2.55),
            })
          }
        />
      </Box>
    </Card>
  );
}
