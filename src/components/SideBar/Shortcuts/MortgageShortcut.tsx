import HouseIcon from '@mui/icons-material/HouseRounded';
import {useState} from 'react';
import type {MortgageShortcutConfigType} from '../../../configs/sidebar';
import {mortgageStatus} from '../../../utils/mortgage';
import {MortgageModal} from '../../Modal/MortgageModal';
import {ShortcutTile} from './ShortcutTile';

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
      <ShortcutTile
        id={id}
        icon={<HouseIcon />}
        label={label}
        value={`${Math.floor(status.repaidRatio * 100)} % remboursé`}
        onClick={() => setOpen(true)}
      />
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
