import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import {useState} from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNewRounded';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import {motion} from 'framer-motion';
import {ColorWheelIcon} from '../../../Icons/ColorWheelIcon';
import {Modal, ModalProps} from '../..';
import {ColorTempWheelIcon} from '../../../Icons/ColorTempWheelIcon';
import {ColorTempTab} from './Tabs/ColorTempTab';
import {EffectTab} from './Tabs/EffectTab';
import {HassEntityWithService} from '@hakit/core';
import {ColorTab} from './Tabs/ColorTab';
import {LightModalProvider} from '../../../../contexts/LightModalContext';
import {LightCard} from './components/LightCard';
import Typography from '@mui/material/Typography';

type LightModalProps = Omit<ModalProps, 'children'> & {
  mainEntity: HassEntityWithService<'light'>;
  entities?: HassEntityWithService<'light'>[];
};

export function LightModal(props: LightModalProps) {
  const {mainEntity, entities = [], ...modalProps} = props;
  const [tab, setTab] = useState(0);
  return (
    <Modal {...modalProps}>
      <LightModalProvider entities={[mainEntity, ...entities]}>
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
          <ToggleButtonGroup
            exclusive
            value={tab}
            onChange={(_, newTab) => setTab(newTab)}
          >
            <ToggleButton
              value=""
              onClick={event => {
                event.preventDefault();
                const allEntities = [mainEntity, ...entities];
                const oneWasEnable = allEntities.find(
                  entity => entity.state === 'on'
                );
                allEntities.map(entity => {
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
          <Stack spacing={1}>
            <Typography variant="h6">Lumières</Typography>
            <Stack direction="row" gap={2} p={1}>
              {[mainEntity, ...entities].map(entity => (
                <LightCard key={entity.entity_id} entity={entity} />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </LightModalProvider>
    </Modal>
  );
}
