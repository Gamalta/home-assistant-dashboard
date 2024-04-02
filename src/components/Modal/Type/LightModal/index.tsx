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
import {ColorTempTab} from './ColorTempTab';
import {EffectTab} from './EffectTab';
import {HassEntityWithService} from '@hakit/core';
import {ColorTab} from './ColorTab';
import {LightModalProvider} from '../../../../contexts/LightModalContext';

type LightModalProps = Omit<ModalProps, 'children'> & {
  mainEntity: HassEntityWithService<'light'>;
  entities?: HassEntityWithService<'light'>[];
};

export function LightModal(props: LightModalProps) {
  const {mainEntity, entities = [], ...modalProps} = props;
  const [tab, setTab] = useState(0);
  return (
    <Modal {...modalProps} title="Light Modal Title">
      <LightModalProvider entities={[mainEntity, ...entities]}>
        <Stack spacing={2} overflow="hidden">
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
                mainEntity.service.toggle();
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
            <ToggleButton value={2} key="buttonEffect">
              <AutoAwesomeIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </LightModalProvider>
    </Modal>
  );
}
