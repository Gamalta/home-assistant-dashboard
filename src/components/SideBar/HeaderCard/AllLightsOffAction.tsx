import {useEntities} from '@hakit/core';
import PowerIcon from '@mui/icons-material/PowerSettingsNewRounded';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import {motion} from 'framer-motion';
import {useState} from 'react';
import type {AllLightsOffActionConfigType} from '../../../configs/sidebar';
import {useHouseContext} from '../../../contexts/HouseContext';
import {getHouseLightIds} from '../../../utils/house';
import {AllLightsOffModal} from '../../Modal/AllLightsOffModal';

type AllLightsOffActionProps = {
  id: string;
  actionConfig: AllLightsOffActionConfigType;
};

export function AllLightsOffAction(props: AllLightsOffActionProps) {
  const {id, actionConfig} = props;
  const [open, setOpen] = useState(false);
  const {houseConfig} = useHouseContext();

  const lights = useEntities(
    houseConfig ? getHouseLightIds(houseConfig.house) : [],
    {returnNullIfNotFound: true, historyOptions: {disable: true}},
  );
  const lightsOn = lights.filter(light => light?.state === 'on');
  const count = lightsOn.length;
  const status = count
    ? `${count} allumée${count > 1 ? 's' : ''}`
    : 'tout est éteint';

  return (
    <>
      <motion.div layoutId={id}>
        <IconButton
          aria-label={`Tout éteindre, ${status}`}
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: 'background.tertiary',
            color: count ? 'primary.main' : 'text.secondary',
          }}
        >
          <Badge badgeContent={count} color="primary">
            <PowerIcon />
          </Badge>
        </IconButton>
      </motion.div>
      <AllLightsOffModal
        id={id}
        open={open}
        onClose={() => setOpen(false)}
        title="Tout éteindre"
        lights={lightsOn}
        scriptEntityId={actionConfig.scriptEntityId}
      />
    </>
  );
}
