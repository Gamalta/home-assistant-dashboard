import type {HassEntityWithService} from '@hakit/core';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import TuneIcon from '@mui/icons-material/TuneRounded';
import ButtonBase from '@mui/material/ButtonBase';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import {Modal, ModalProps} from '..';
import type {PlugConfigType} from '../../../configs/house';
import {
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
  const status = plugStatus(on, power, plugConfig.standbyThreshold);

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
        <Stack direction="row" spacing={3}>
          {/* La fiche qui se branche suffit comme retour : pas d'onde. */}
          <ButtonBase
            aria-label="Prise"
            aria-pressed={on}
            disableRipple
            onClick={() => plug.service.toggle()}
          >
            <PlugView status={status} />
          </ButtonBase>
          <Stack spacing={3} sx={{width: 300, justifyContent: 'center'}}>
            <Stack spacing={0.5}>
              <Typography variant="h4">{PLUG_STATUS_LABELS[status]}</Typography>
              {on && power !== null && (
                <Typography variant="h5" color="textSecondary">
                  {formatPower(power)}
                </Typography>
              )}
            </Stack>
            <FormControlLabel
              label="Marche"
              labelPlacement="start"
              control={
                <Switch checked={on} onChange={() => plug.service.toggle()} />
              }
              sx={{
                m: 0,
                pl: 2,
                py: 1,
                justifyContent: 'space-between',
                bgcolor: 'background.tertiary',
                borderRadius: 1,
              }}
            />
          </Stack>
        </Stack>
      )}
    </Modal>
  );
}
