import type {HassEntityWithService} from '@hakit/core';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNewRounded';
import TuneIcon from '@mui/icons-material/TuneRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {Modal, ModalProps} from '..';
import type {PlugConfigType} from '../../../configs/house';
import {
  DEFAULT_STANDBY_THRESHOLD,
  formatPower,
  plugStatus,
} from '../../../utils/entity/plug';
import {PlugView} from './PlugView';
import {PowerHistory} from './PowerHistory';

type PlugModalProps = Omit<ModalProps, 'children'> & {
  plug: HassEntityWithService<'switch'>;
  power: number | null;
  plugConfig: PlugConfigType;
};

export function PlugModal(props: PlugModalProps) {
  const {plug, power, plugConfig, ...modalProps} = props;
  const [tab, setTab] = useState<'control' | 'history'>('control');
  const on = plug.state === 'on';
  const {standbyThreshold = DEFAULT_STANDBY_THRESHOLD} = plugConfig;
  const status = plugStatus(on, power, standbyThreshold);
  const ledHint = {
    on: 'Voyant bleu : allumée',
    standby: `Voyant orange : en veille, moins de ${formatPower(standbyThreshold)}`,
    off: 'Voyant gris : éteinte',
  }[status];

  return (
    <Modal
      {...modalProps}
      action={
        plugConfig.powerEntityId &&
        {
          control: (
            <IconButton
              aria-label="Historique"
              onClick={() => setTab('history')}
            >
              <AssessmentIcon />
            </IconButton>
          ),
          history: (
            <IconButton aria-label="Réglage" onClick={() => setTab('control')}>
              <TuneIcon />
            </IconButton>
          ),
        }[tab]
      }
    >
      {tab === 'history' && plugConfig.powerEntityId ? (
        <PowerHistory entityId={plugConfig.powerEntityId} />
      ) : (
        <Stack spacing={3} sx={{px: 1}}>
          {/* La fiche qui se branche suffit comme retour : pas d'onde. */}
          <ButtonBase
            aria-label="Prise"
            aria-pressed={on}
            disableRipple
            onClick={() => plug.service.toggle()}
          >
            <PlugView status={status} ledHint={ledHint} />
          </ButtonBase>
          {/* Mêmes actions que la modale des volets. */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'background.tertiary',
              borderRadius: 1,
            }}
          >
            <IconButton
              aria-label="Allumer"
              sx={{borderRadius: 1}}
              onClick={() => plug.service.turnOn()}
            >
              ⚡
            </IconButton>
            <Divider orientation="vertical" sx={{height: '25px'}} />
            <IconButton
              aria-label="Éteindre"
              sx={{borderRadius: 1}}
              onClick={() => plug.service.turnOff()}
            >
              <PowerSettingsNewIcon />
            </IconButton>
          </Stack>
        </Stack>
      )}
    </Modal>
  );
}
