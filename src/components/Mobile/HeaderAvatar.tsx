import {useEntity} from '@hakit/core';
import NightlightIcon from '@mui/icons-material/NightlightRound';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type {PersonConfigType} from '../../configs/sidebar';

type HeaderAvatarProps = {
  person: PersonConfigType;
  overlap: boolean;
  // Ordre d'empilement : un avatar passe par-dessus ceux de rang inférieur.
  layer: number;
};

export function HeaderAvatar(props: HeaderAvatarProps) {
  const {person, overlap, layer} = props;
  const focused = useEntity(person.focusEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });

  return (
    <Stack
      sx={{
        position: 'relative',
        zIndex: layer,
        width: 38,
        height: 38,
        ml: overlap ? -1 : 0,
        borderRadius: '50%',
        bgcolor: 'background.tertiary',
        alignItems: 'center',
        justifyContent: 'center',
        // Détoure l'avatar du dessus ; de la couleur du fond, invisible ailleurs.
        outline: '2px solid',
        outlineColor: 'background.paper',
      }}
    >
      <Box
        component="img"
        src={person.avatar}
        alt=""
        sx={{width: 32, height: 32, objectFit: 'contain'}}
      />
      {focused?.state === 'on' && (
        <NightlightIcon
          aria-label="Mode concentration"
          sx={{
            position: 'absolute',
            top: -4,
            right: -4,
            fontSize: 16,
            p: '2px',
            borderRadius: '50%',
            color: '#5F19EB',
            bgcolor: 'background.paper',
          }}
        />
      )}
    </Stack>
  );
}
