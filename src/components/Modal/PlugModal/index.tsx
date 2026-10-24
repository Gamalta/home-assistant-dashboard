import type {HassEntityWithService} from '@hakit/core';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import TuneIcon from '@mui/icons-material/TuneRounded';
import ButtonBase from '@mui/material/ButtonBase';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import {Modal, ModalProps} from '..';
import type {PlugConfigType} from '../../../configs/house';
import {
  DEFAULT_STANDBY_THRESHOLD,
  formatPower,
  PLUG_STATUS_LABELS,
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
        <Stack spacing={3} sx={{alignItems: 'center'}}>
          <Tooltip title={ledHint} placement="right" describeChild>
            {/* La fiche qui se branche suffit comme retour : pas d'onde. */}
            <ButtonBase
              aria-label="Prise"
              aria-pressed={on}
              disableRipple
              onClick={() => plug.service.toggle()}
            >
              <PlugView status={status} />
            </ButtonBase>
          </Tooltip>
          <Stack spacing={0.5} sx={{alignItems: 'center'}}>
            <Typography variant="h4">{PLUG_STATUS_LABELS[status]}</Typography>
            {on && power !== null && (
              <Typography variant="h5" color="textSecondary">
                {formatPower(power)}
              </Typography>
            )}
          </Stack>
          <FormControlLabel
            label="⚡ Marche"
            labelPlacement="start"
            control={
              <Switch checked={on} onChange={() => plug.service.toggle()} />
            }
            sx={{
              alignSelf: 'stretch',
              m: 0,
              pl: 2,
              py: 1,
              justifyContent: 'space-between',
              bgcolor: 'background.tertiary',
              borderRadius: 1,
            }}
          />
        </Stack>
      )}
    </Modal>
  );
}
