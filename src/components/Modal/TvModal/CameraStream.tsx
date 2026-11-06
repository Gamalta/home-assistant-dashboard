import {EntityName, FilterByDomain, useEntity, useHass} from '@hakit/core';
import Box from '@mui/material/Box';
import type {SxProps} from '@mui/material/styles';
import {RefObject, useCallback} from 'react';

type CameraStreamProps = {
  cameraEntityId: FilterByDomain<EntityName, 'camera'>;
  alt: string;
  ref?: RefObject<HTMLImageElement | null>;
  sx?: SxProps;
};

// Le flux MJPEG de la caméra, en direct. Chrome garde la connexion ouverte
// après le retrait de l'image : on retire sa source pour la fermer. La source
// se pose au rattachement, que StrictMode rejoue après un détachement.
export function CameraStream(props: CameraStreamProps) {
  const {cameraEntityId, alt, ref, sx} = props;
  const camera = useEntity(cameraEntityId, {returnNullIfNotFound: true});
  const joinHassUrl = useHass(state => state.helpers.joinHassUrl);
  const picture = camera?.attributes.entity_picture;
  const src =
    picture &&
    joinHassUrl(
      picture.replace('/api/camera_proxy/', '/api/camera_proxy_stream/'),
    );
  const attach = useCallback(
    (image: HTMLImageElement | null) => {
      if (ref) ref.current = image;
      if (!image || !src) return;
      image.src = src;
      return () => image.removeAttribute('src');
    },
    [ref, src],
  );

  if (!src) return null;

  return <Box component="img" ref={attach} alt={alt} sx={sx} />;
}
