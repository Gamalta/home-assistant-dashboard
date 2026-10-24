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
import type {OutletConfigType} from '../../../configs/house';
import {
  DEFAULT_STANDBY_THRESHOLD,
  formatPower,
  outletStatus,
} from '../../../utils/entity/outlet';
import {OutletView} from './OutletView';
import {PowerHistory} from './PowerHistory';

type OutletModalProps = Omit<ModalProps, 'children'> & {
  outlet: HassEntityWithService<'switch'>;
  power: number | null;
  outletConfig: OutletConfigType;
};

export function OutletModal(props: OutletModalProps) {
  const {outlet, power, outletConfig, ...modalProps} = props;
  const [tab, setTab] = useState<'control' | 'history'>('control');
  const on = outlet.state === 'on';
  const {standbyThreshold = DEFAULT_STANDBY_THRESHOLD} = outletConfig;
  const status = outletStatus(on, power, standbyThreshold);
  const ledHint = {
    on: 'Voyant bleu : allumée',
    standby: `Voyant orange : en veille, moins de ${formatPower(standbyThreshold)}`,
    off: 'Voyant gris : éteinte',
  }[status];

  return (
    <Modal
      {...modalProps}
      action={
        outletConfig.powerEntityId &&
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
      {tab === 'history' && outletConfig.powerEntityId ? (
        <PowerHistory entityId={outletConfig.powerEntityId} />
      ) : (
        <Stack spacing={3} sx={{px: 1}}>
          {/* La fiche qui se branche suffit comme retour : pas d'onde. */}
          <ButtonBase
            aria-label="Prise"
            aria-pressed={on}
            disableRipple
            onClick={() => outlet.service.toggle()}
          >
            <OutletView status={status} ledHint={ledHint} />
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
              onClick={() => outlet.service.turnOn()}
            >
              ⚡
            </IconButton>
            <Divider orientation="vertical" sx={{height: '25px'}} />
            <IconButton
              aria-label="Éteindre"
              sx={{borderRadius: 1}}
              onClick={() => outlet.service.turnOff()}
            >
              <PowerSettingsNewIcon />
            </IconButton>
          </Stack>
        </Stack>
      )}
    </Modal>
  );
}
