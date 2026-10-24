import type {HassEntityWithService} from '@hakit/core';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import TuneIcon from '@mui/icons-material/TuneRounded';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import {Modal, ModalProps} from '..';
import type {PlugConfigType} from '../../../configs/house';
import {formatPower, plugStateLabel} from '../../../utils/entity/plug';
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
        <Stack
          direction="row"
          sx={{
            width: 360,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Stack>
            {on && power !== null && (
              <Typography variant="h4">{formatPower(power)}</Typography>
            )}
            <Typography variant="h6" color="textSecondary">
              {plugStateLabel(on, power, plugConfig.standbyThreshold)}
            </Typography>
          </Stack>
          <Switch
            checked={on}
            onChange={() => plug.service.toggle()}
            slotProps={{input: {'aria-label': 'Marche'}}}
          />
        </Stack>
      )}
    </Modal>
  );
}
