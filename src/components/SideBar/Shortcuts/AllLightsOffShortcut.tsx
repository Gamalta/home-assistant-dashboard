import {useEntities} from '@hakit/core';
import PowerIcon from '@mui/icons-material/PowerSettingsNewRounded';
import {useState} from 'react';
import type {AllLightsOffShortcutConfigType} from '../../../configs/sidebar';
import {useHouseContext} from '../../../contexts/HouseContext';
import {getHouseLightIds} from '../../../utils/house';
import {AllLightsOffModal} from '../../Modal/AllLightsOffModal';
import {ShortcutTile} from './ShortcutTile';

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
      <ShortcutTile
        id={id}
        icon={<PowerIcon />}
        label="Tout éteindre"
        value={
          count ? `${count} allumée${count > 1 ? 's' : ''}` : 'Tout est éteint'
        }
        onClick={() => setOpen(true)}
      />
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
