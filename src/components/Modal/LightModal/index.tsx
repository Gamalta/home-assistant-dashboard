import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import {useEffect, useState} from 'react';
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
import {OnOffTab} from './Tabs/OnOffTab';
import {LightModalProvider} from '../../../contexts/LightModalContext';
import {LightCard} from './components/LightCard';
import Typography from '@mui/material/Typography';
import {BrightnessSlider} from './components/BrightnessSlider';
import {useRoomContext} from '../../../contexts/RoomContext';
import {HassEntityWithService} from '@hakit/core';
import {AttributesDisplay} from '../../display/AttributesDisplay';
import {
  lightHasColor,
  lightHasColorTemp,
  lightHasEffect,
  lightsHasBrightness,
  lightsHasColor,
  lightsHasColorTemp,
  lightsHasEffect,
} from '../../../utils/entity/light';
import Box from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';

type LightModalProps = Omit<ModalProps, 'children'>;

enum LightTab {
  ON_OFF = 'on-off',
  COLOR = 'color',
  COLOR_TEMP = 'color_temp',
  EFFECT = 'effect',
}

export function LightModal(props: LightModalProps) {
  const {...modalProps} = props;
  const [tab, setTab] = useState(LightTab.COLOR);
  const {lightEntities} = useRoomContext();
  const theme = useTheme();

  const entities = lightEntities.filter(
    (entity): entity is HassEntityWithService<'light'> => entity !== undefined
  );

  const hasEffect = lightsHasEffect(entities);
  const hasBrightness = lightsHasBrightness(entities);
  const hasColorTemp = lightsHasColorTemp(entities);
  const hasColor = lightsHasColor(entities);

  //TODO only onoff light

  function moveToSupportedTab(entities: HassEntityWithService<'light'>[]) {
    if (lightsHasColor(entities)) {
      setTab(LightTab.COLOR);
      return;
    }
    if (lightsHasColorTemp(entities)) {
      setTab(LightTab.COLOR_TEMP);
      return;
    }
    if (lightsHasEffect(entities)) {
      setTab(LightTab.EFFECT);
      return;
    }
    setTab(LightTab.ON_OFF);
  }

  useEffect(() => {
    moveToSupportedTab(entities);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasColor, hasColorTemp, hasEffect]);

  return (
    <Modal
      {...modalProps}
      action={
        <Stack
          direction="row"
          borderRadius={1}
          border={theme => `1px solid ${theme.palette.divider}`}
          spacing={1}
          p={1}
        >
          <AttributesDisplay
            attributes={entities.map(entity => entity.attributes)}
          />
        </Stack>
      }
    >
      <LightModalProvider entities={entities}>
        <Stack spacing={2} sx={{overflowX: 'hidden', overflowY: 'auto'}}>
          <Stack
            direction="row"
            width="500px"
            component={motion.div}
            transition={{
              mass: 0.4,
            }}
            initial={false}
            animate={{
              x:
                {
                  [LightTab.ON_OFF]: 0,
                  [LightTab.COLOR]: 1,
                  [LightTab.COLOR_TEMP]: hasColor ? 2 : 1,
                  [LightTab.EFFECT]:
                    (hasColor ? 2 : 1) + (hasColorTemp ? 1 : 0),
                }[tab] *
                  -100 +
                '%',
            }}
          >
            <OnOffTab />
            {hasColor && <ColorTab />}
            {hasColorTemp && <ColorTempTab />}
            {hasEffect && <EffectTab />}
          </Stack>
          {(hasColor || hasColorTemp || hasEffect) && (
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
                {hasColor && (
                  <ToggleButton value={LightTab.COLOR} key="buttonColor">
                    <ColorWheelIcon />
                  </ToggleButton>
                )}
                {hasColorTemp && (
                  <ToggleButton value={LightTab.COLOR_TEMP} key="buttonTemp">
                    <ColorTempWheelIcon />
                  </ToggleButton>
                )}
                {hasEffect && (
                  <ToggleButton
                    value={LightTab.EFFECT}
                    key="buttonEffect"
                    disabled
                  >
                    <AutoAwesomeIcon />
                  </ToggleButton>
                )}
              </ToggleButtonGroup>
              {hasBrightness && <BrightnessSlider />}
            </Stack>
          )}
          <Stack spacing={1}>
            <Typography variant="h6" display="flex" gap={1}>
              Lumières
              <Box color="text.secondary">
                {entities.length > 1 && entities.length}
              </Box>
            </Typography>
            <Stack
              direction="row"
              gap={2}
              p={1}
              overflow="auto"
              maxWidth="500px"
            >
              {entities.map(entity => (
                <LightCard
                  key={entity.entity_id}
                  entity={entity}
                  controllableByCurrentTab={{
                    [LightTab.ON_OFF]: () => true,
                    [LightTab.COLOR]: lightHasColor,
                    [LightTab.COLOR_TEMP]: lightHasColorTemp,
                    [LightTab.EFFECT]: lightHasEffect,
                  }[tab](entity)}
                  onMoveToControllerTab={() => moveToSupportedTab([entity])}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </LightModalProvider>
    </Modal>
  );
}
