import {EntityName, FilterByDomain, useEntity} from '@hakit/core';
import {useDialogContext} from '../../contexts/DialogContext';
import {LightModal} from './LightModal';
import {LightCard} from './lightCard';

type LightGroupCardProps = {
  entityGroup: FilterByDomain<EntityName, 'light'>;
  lights: FilterByDomain<EntityName, 'light'>[];
  icon?: React.ReactNode;
};

export function LightGroupCard(props: LightGroupCardProps) {
  const {entityGroup, lights, icon} = props;

  const entity = useEntity(entityGroup);
  const entities = lights.map(light => useEntity(light));
  const {open, setContent} = useDialogContext();

  return (
    <LightCard
      entity={entity}
      icon={icon}
      onClick={() => {
        setContent(<LightModal entityGroup={entity} entities={entities} />);
        open();
      }}
    />
  );
}
