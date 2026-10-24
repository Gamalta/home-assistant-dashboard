import Stack from '@mui/material/Stack';
import {useLightModalContext} from '../../../../contexts/LightModalContext';
import {lightHasEffect} from '../../../../utils/entity/light';
import {EffectList} from '../components/EffectList';

export function EffectTab() {
  const {entities, activeEntityIds} = useLightModalContext();
  const activeEntities = entities.filter(
    entity =>
      activeEntityIds.includes(entity.entity_id) && lightHasEffect(entity),
  );
  const effects = [
    ...new Set(
      activeEntities.flatMap(entity => entity.attributes.effect_list ?? []),
    ),
  ];

  return (
    <Stack sx={{maxWidth: '500px', minWidth: '500px', p: 2}}>
      <Stack
        spacing={2}
        // Même hauteur que la roue des couleurs, pour ne pas agrandir la modale.
        sx={{
          height: '30vh',
          minHeight: '200px',
          maxHeight: '320px',
          overflowY: 'auto',
        }}
      >
        <EffectList
          effects={effects}
          activeEffects={activeEntities.map(entity => entity.attributes.effect)}
          onSelect={effect =>
            activeEntities
              .filter(entity => entity.attributes.effect_list?.includes(effect))
              .forEach(entity => entity.service.turnOn({serviceData: {effect}}))
          }
        />
      </Stack>
    </Stack>
  );
}
