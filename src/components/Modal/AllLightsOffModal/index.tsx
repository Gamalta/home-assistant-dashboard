import {type HassEntityWithService, useService} from '@hakit/core';
import PowerIcon from '@mui/icons-material/PowerSettingsNewRounded';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Modal, ModalProps} from '..';
import type {AllLightsOffActionConfigType} from '../../../configs/sidebar';

type AllLightsOffModalProps = Omit<ModalProps, 'children'> & {
  lights: HassEntityWithService<'light'>[];
  scriptEntityId: AllLightsOffActionConfigType['scriptEntityId'];
};

export function AllLightsOffModal(props: AllLightsOffModalProps) {
  const {lights, scriptEntityId, onClose, ...modalProps} = props;
  const lightService = useService('light');
  const scriptService = useService('script');

  const turnAllOff = () => {
    if (scriptEntityId) scriptService.turnOn({target: scriptEntityId});
    else lightService.turnOff({target: lights.map(light => light.entity_id)});
    onClose();
  };

  return (
    <Modal {...modalProps} onClose={onClose}>
      <Stack spacing={2} sx={{minWidth: 260}}>
        {lights.length ? (
          <Stack component="ul" spacing={0.5} sx={{m: 0, pl: 2}}>
            {lights.map(light => (
              <Typography component="li" key={light.entity_id}>
                {light.attributes.friendly_name ?? light.entity_id}
              </Typography>
            ))}
          </Stack>
        ) : (
          <Typography color="textSecondary">Aucune lumière allumée.</Typography>
        )}
        <Button
          variant="contained"
          startIcon={<PowerIcon />}
          disabled={!scriptEntityId && !lights.length}
          onClick={turnAllOff}
        >
          Éteindre
        </Button>
      </Stack>
    </Modal>
  );
}
