import {useEntities} from '@hakit/core';
import PowerIcon from '@mui/icons-material/PowerSettingsNewRounded';
import Typography from '@mui/material/Typography';
import {useState} from 'react';
import type {AllLightsOffShortcutConfigType} from '../../../configs/sidebar';
import {useHouseContext} from '../../../contexts/HouseContext';
import {getHouseLightIds} from '../../../utils/house';
import {AllLightsOffModal} from '../../Modal/AllLightsOffModal';
import {ShortcutCard} from './ShortcutCard';

type AllLightsOffShortcutProps = {
  id: string;
  shortcutConfig: AllLightsOffShortcutConfigType;
};

export function AllLightsOffShortcut(props: AllLightsOffShortcutProps) {
  const {id, shortcutConfig} = props;
  const [open, setOpen] = useState(false);
  const {houseConfig} = useHouseContext();

  const lights = useEntities(
    houseConfig ? getHouseLightIds(houseConfig.house) : [],
    {returnNullIfNotFound: true, historyOptions: {disable: true}},
  );
  const lightsOn = lights.filter(light => light?.state === 'on');
  const count = lightsOn.length;

  return (
    <>
      <ShortcutCard
        id={id}
        icon={<PowerIcon />}
        label="Tout éteindre"
        onClick={() => setOpen(true)}
      >
        <Typography component="span">
          {count
            ? `${count} allumée${count > 1 ? 's' : ''}`
            : 'Tout est éteint'}
        </Typography>
      </ShortcutCard>
      <AllLightsOffModal
        id={id}
        open={open}
        onClose={() => setOpen(false)}
        title="Tout éteindre"
        lights={lightsOn}
        scriptEntityId={shortcutConfig.scriptEntityId}
      />
    </>
  );
}
