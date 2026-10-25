import {type EntityName, type FilterByDomain, useEntity} from '@hakit/core';
import SpeedDialAction, {
  type SpeedDialActionProps,
} from '@mui/material/SpeedDialAction';
import {useIcon} from '../../hooks/useIcon';

// SpeedDial injecte ses props (open, delay, slotProps…) dans ses enfants.
type ScenarioActionProps = SpeedDialActionProps & {
  scriptEntityId: FilterByDomain<EntityName, 'script'>;
  onLaunch: () => void;
};

export function ScenarioAction(props: ScenarioActionProps) {
  const {scriptEntityId, onLaunch, slotProps, ...actionProps} = props;
  const script = useEntity(scriptEntityId, {returnNullIfNotFound: true});
  const icon = useIcon(script?.attributes.icon ?? 'mdi:script-text-outline');

  if (!script) return null;

  return (
    <SpeedDialAction
      {...actionProps}
      icon={icon}
      onClick={() => {
        script.service.turnOn();
        onLaunch();
      }}
      slotProps={{
        ...slotProps,
        // Libellé toujours visible : pas de survol sur la tablette.
        tooltip: {
          title: script.attributes.friendly_name,
          open: true,
          placement: 'right',
        },
      }}
    />
  );
}
