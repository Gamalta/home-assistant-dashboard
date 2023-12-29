import {EntityName, FilterByDomain} from '@hakit/core';
import {useDialogContext} from '../../contexts/DialogContext';
import {LightModal} from './LightModal';
import {LightCard} from './lightCard';

type LightGroupCardProps = {
  entityGroup: FilterByDomain<EntityName, 'light'>;
  entities: FilterByDomain<EntityName, 'light'>[];
  icon?: React.ReactNode;
};

export function LightGroupCard(props: LightGroupCardProps) {
  const {entityGroup, entities, icon} = props;

  const {open, setContent} = useDialogContext();

  return (
    <LightCard
      entity={entityGroup}
      icon={icon}
      onClick={() => {
        setContent(
          <LightModal entityGroup={entityGroup} entities={entities} />
        );
        open();
      }}
    />
  );
}
