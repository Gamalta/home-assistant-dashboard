import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import {EntityName, FilterByDomain, useEntity} from '@hakit/core';
import {useDialogContext} from '../../contexts/DialogContext';
import {useState} from 'react';

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
    Math.round(((lightEntity.attributes.brightness ?? 0) * 100) / 255)
  );

  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      lightEntity.service.turnOn();
      setBrightness(
        Math.round(((lightEntity.attributes.brightness ?? 0) * 100) / 255)
      );
    } else {
      lightEntity.service.turnOff();
      setBrightness(0);
    }
  };

  const handleBrightnessChange = (value: number) => {
    setBrightness(value);
  };

  const handleBrightnessChangeCommitted = (value: number) => {
    lightEntity.service.turnOn({
      brightness: Math.round((value as number) * 2.55),
    });
  };

  return (
    <Card>
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
            onChange={(_, checked) => handleSwitchChange(checked)}
          />
        }
        title={lightEntity.attributes.friendly_name}
        subheader={`${
          lightEntity.state === 'on' ? `allumé - ${brightness}%` : 'éteint'
        } - modifié il y a ${lastUpdated}`}
      />
      <Box px={2}>
        <Slider
          value={brightness}
          onChange={(_, value) => handleBrightnessChange(value as number)}
          onChangeCommitted={(_, value) =>
            handleBrightnessChangeCommitted(value as number)
          }
        />
      </Box>
    </Card>
  );
}
