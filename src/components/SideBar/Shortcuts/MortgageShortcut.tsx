import HouseIcon from '@mui/icons-material/HouseRounded';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {MortgageShortcutConfigType} from '../../../configs/sidebar';
import {formatEuros, mortgageStatus} from '../../../utils/mortgage';
import {MortgageModal} from '../../Modal/MortgageModal';
import {ShortcutCard} from './ShortcutCard';

type MortgageShortcutProps = {
  id: string;
  shortcutConfig: MortgageShortcutConfigType;
};

export function MortgageShortcut(props: MortgageShortcutProps) {
  const {id, shortcutConfig} = props;
  const [open, setOpen] = useState(false);
  const label = shortcutConfig.label ?? 'Crédit';
  const status = mortgageStatus(shortcutConfig, new Date());
  const repaid = Math.floor(status.repaidRatio * 100);

  return (
    <>
      <ShortcutCard
        id={id}
        icon={<HouseIcon />}
        label={label}
        onClick={() => setOpen(true)}
      >
        <Stack spacing={1}>
          <Stack>
            <Typography variant="h4" component="span">
              {formatEuros(status.remainingPrincipal)}
            </Typography>
            <Typography variant="body2" component="span" color="textSecondary">
              Capital restant dû
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={repaid} />
          <Typography variant="body2" component="span" color="textSecondary">
            {repaid} % remboursé
          </Typography>
        </Stack>
      </ShortcutCard>
      <MortgageModal
        id={id}
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        mortgage={shortcutConfig}
        status={status}
      />
    </>
  );
}
