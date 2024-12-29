import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import {useState} from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNewRounded';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {ColorWheelIcon} from '../../Icons/ColorWheelIcon';
import {Modal, ModalProps} from '..';
import {ColorTempWheelIcon} from '../../Icons/ColorTempWheelIcon';
import {ColorTempTab} from './Tabs/ColorTempTab';
import {EffectTab} from './Tabs/EffectTab';
import {ColorTab} from './Tabs/ColorTab';
import {LightModalProvider} from '../../../contexts/LightModalContext';
import {LightCard} from './components/LightCard';
import Typography from '@mui/material/Typography';
import {BrightnessSlider} from './components/BrightnessSlider';
import {useRoomContext} from '../../../contexts/RoomContext';
import {HassEntityWithService} from '@hakit/core';

type LightModalProps = Omit<ModalProps, 'children'>;

export function LightModal(props: LightModalProps) {
  const {...modalProps} = props;
  const [tab, setTab] = useState(0);
  const {lightEntities} = useRoomContext();

  const entities = lightEntities.filter(
    (entity): entity is HassEntityWithService<'light'> => entity !== undefined
  );
  return (
    <Modal {...modalProps}>
      <LightModalProvider entities={entities}>
        <Stack spacing={2} sx={{overflowX: 'hidden', overflowY: 'auto'}}>
          <Stack
            direction="row"
            width="500px"
            component={motion.div}
            transition={{
              tension: 190,
              friction: 70,
              mass: 0.4,
            }}
            initial={false}
            animate={{x: tab * -100 + '%'}}
          >
            <ColorTab />
            <ColorTempTab />
            <EffectTab />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <ToggleButtonGroup
              exclusive
              value={tab}
              onChange={(_, newTab) => setTab(newTab)}
            >
              <ToggleButton
                value=""
                onClick={event => {
                  event.preventDefault();
                  const oneWasEnable = entities.find(
                    entity => entity.state === 'on'
                  );
                  entities.map(entity => {
                    oneWasEnable
                      ? entity.service.turnOff()
                      : entity.service.turnOn();
                  });
                }}
              >
                <PowerSettingsNewIcon />
              </ToggleButton>
              <Divider />
              <ToggleButton value={0} key="buttonColor">
                <ColorWheelIcon />
              </ToggleButton>
              <ToggleButton value={1} key="buttonTemp">
                <ColorTempWheelIcon />
              </ToggleButton>
              <ToggleButton value={2} key="buttonEffect" disabled>
                <AutoAwesomeIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            <BrightnessSlider />
          </Stack>
          <Stack spacing={1}>
            <Typography variant="h6">Lumières</Typography>
            <Stack direction="row" gap={2} p={1}>
              {entities.map(entity => (
                <LightCard key={entity.entity_id} entity={entity} />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </LightModalProvider>
    </Modal>
  );
}
