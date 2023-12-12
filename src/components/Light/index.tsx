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

  const brightness = Math.round(
    ((lightEntity.attributes.brightness ?? 0) * 100) / 255
  );
  const lastUpdated = dayjs
    .duration(dayjs().diff(dayjs(lightEntity.last_updated)))
    .locale('fr')
    .humanize();

  return (
    <Card>
      <CardHeader
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
            onChange={event => {
              event.target.checked
                ? lightEntity.service.turnOn()
                : lightEntity.service.turnOff();
            }}
          />
        }
        title={lightEntity.attributes.friendly_name}
        subheader={`${
          lightEntity.state === 'on' ? `allumé - ${brightness}%` : 'éteint'
        } - modifié il y a ${lastUpdated}`}
      />
      <Box px={2}>
        <Slider />
      </Box>
    </Card>
  );
}
