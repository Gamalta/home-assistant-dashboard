import {type EntityName, type FilterByDomain, useEntity} from '@hakit/core';
import CheckIcon from '@mui/icons-material/CheckRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';
import {useIcon} from '../../hooks/useIcon';

type ScenarioButtonProps = {
  scriptEntityId: FilterByDomain<EntityName, 'script'>;
};

export function ScenarioButton(props: ScenarioButtonProps) {
  const {scriptEntityId} = props;
  const script = useEntity(scriptEntityId, {returnNullIfNotFound: true});
  const icon = useIcon(script?.attributes.icon ?? 'mdi:script-text-outline');
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    if (!launched) return;
    const timeout = setTimeout(() => setLaunched(false), 1500);
    return () => clearTimeout(timeout);
  }, [launched]);

  if (!script) return null;

  return (
    <ButtonBase
      onClick={() => {
        script.service.turnOn();
        setLaunched(true);
      }}
      sx={{
        flexDirection: 'column',
        gap: 0.5,
        width: 72,
        py: 1,
        borderRadius: 2,
        color: launched ? 'primary.main' : 'text.secondary',
      }}
    >
      {launched ? <CheckIcon /> : icon}
      <Typography variant="caption" noWrap sx={{maxWidth: '100%'}}>
        {script.attributes.friendly_name}
      </Typography>
    </ButtonBase>
  );
}
