import type {HassEntityWithService} from '@hakit/core';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
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
  const on = plug.state === 'on';

  return (
    <Modal {...modalProps}>
      <Stack spacing={2} sx={{width: 360}}>
        <Stack
          direction="row"
          sx={{justifyContent: 'space-between', alignItems: 'center'}}
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
        {plugConfig.powerEntityId && (
          <PowerHistory entityId={plugConfig.powerEntityId} />
        )}
      </Stack>
    </Modal>
  );
}
