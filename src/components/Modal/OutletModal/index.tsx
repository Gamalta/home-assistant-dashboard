import type {HassEntityWithService} from '@hakit/core';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNewRounded';
import TuneIcon from '@mui/icons-material/TuneRounded';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import {Modal, ModalProps} from '..';
import type {OutletConfigType} from '../../../configs/house';
import {formatPower} from '../../../utils/entity/outlet';
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

  return (
    <Modal
      {...modalProps}
      action={
        outletConfig.powerEntityId && (
          // Cadre des actions, comme les autres modales.
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              borderRadius: 1,
              border: theme => `1px solid ${theme.palette.divider}`,
              p: 1,
            }}
          >
            {
              {
                // L'onglet Consommation affiche déjà la puissance, en grand.
                control: (
                  <>
                    {on && power !== null && (
                      <Typography color="textSecondary">
                        {formatPower(power)}
                      </Typography>
                    )}
                    <IconButton
                      aria-label="Historique"
                      sx={{p: 0}}
                      onClick={() => setTab('history')}
                    >
                      <AssessmentIcon />
                    </IconButton>
                  </>
                ),
                history: (
                  <IconButton
                    aria-label="Réglage"
                    sx={{p: 0}}
                    onClick={() => setTab('control')}
                  >
                    <TuneIcon />
                  </IconButton>
                ),
              }[tab]
            }
          </Stack>
        )
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
            <OutletView on={on} />
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
              aria-label="Marche"
              aria-pressed={on}
              sx={{borderRadius: 1, ...(on && {color: 'primary.main'})}}
              onClick={() => outlet.service.toggle()}
            >
              <PowerSettingsNewIcon />
            </IconButton>
          </Stack>
        </Stack>
      )}
    </Modal>
  );
}
