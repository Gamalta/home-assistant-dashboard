import {EntityName, FilterByDomain, useEntity, useHass} from '@hakit/core';
import Box from '@mui/material/Box';
import {useEffect, useRef, useState} from 'react';

const REFRESH_MS = 2000;

type AmbilightPreviewProps = {
  cameraEntityId: FilterByDomain<EntityName, 'camera'>;
};

// Une image fixe, redemandée 2 s après la précédente, et seulement tant que la
// modale est ouverte : jamais de flux MJPEG continu, trop lourd pour la tablette.
export function AmbilightPreview(props: AmbilightPreviewProps) {
  const {cameraEntityId} = props;
  const camera = useEntity(cameraEntityId, {returnNullIfNotFound: true});
  const joinHassUrl = useHass(state => state.helpers.joinHassUrl);
  const [time, setTime] = useState(Date.now);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const picture = camera?.attributes.entity_picture;
  if (!picture) return null;

  const url = joinHassUrl(picture);
  const scheduleRefresh = () => {
    timer.current = window.setTimeout(() => setTime(Date.now()), REFRESH_MS);
  };

  return (
    <Box
      component="img"
      alt="Aperçu des LED"
      src={`${url}${url.includes('?') ? '&' : '?'}time=${time}`}
      onLoad={scheduleRefresh}
      onError={scheduleRefresh}
      sx={{width: '100%', height: '24px', borderRadius: 1, objectFit: 'fill'}}
    />
  );
}
