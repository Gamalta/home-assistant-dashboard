import HouseIcon from '@mui/icons-material/HouseRounded';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {MortgageShortcutConfigType} from '../../../configs/sidebar';
import {mortgageStatus} from '../../../utils/mortgage';
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

  return (
    <>
      <ShortcutCard
        id={id}
        icon={<HouseIcon />}
        label={label}
        onClick={() => setOpen(true)}
      >
        <Typography component="span">
          {`${Math.floor(status.repaidRatio * 100)} % remboursé`}
        </Typography>
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
