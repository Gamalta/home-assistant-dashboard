import {useEntity} from '@hakit/core';
import Stack from '@mui/material/Stack';
import {lightExtraEntityIds} from '../../../../utils/entity/light';
import {EntitySelect} from './EntitySelect';
import {EntitySlider} from './EntitySlider';

type LightExtrasProps = {
  lightEntityId: string;
};

// Réglages d'effet propres à l'appareil, affichés seulement s'ils existent.
export function LightExtras(props: LightExtrasProps) {
  const {lightEntityId} = props;
  const ids = lightExtraEntityIds(lightEntityId);
  const options = {returnNullIfNotFound: true} as const;
  const preset = useEntity(ids.preset, options);
  const playlist = useEntity(ids.playlist, options);
  const palette = useEntity(ids.palette, options);
  const speed = useEntity(ids.speed, options);
  const effectSpeed = useEntity(ids.effectSpeed, options);
  const intensity = useEntity(ids.intensity, options);
  const anySpeed = speed ?? effectSpeed;

  return (
    <>
      {(preset || playlist || palette) && (
        <Stack direction="row" spacing={1} sx={{pt: 1}}>
          {preset && <EntitySelect entity={preset} label="Préréglage" />}
          {playlist && <EntitySelect entity={playlist} label="Playlist" />}
          {palette && <EntitySelect entity={palette} label="Palette" />}
        </Stack>
      )}
      {anySpeed && <EntitySlider entity={anySpeed} label="Vitesse" />}
      {intensity && <EntitySlider entity={intensity} label="Intensité" />}
    </>
  );
}
