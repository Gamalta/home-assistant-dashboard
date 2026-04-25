import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface PetCardProps {
  pets?: [string, string];
}

export function PetCard(props: PetCardProps) {
  const {pets} = props;
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{bgcolor: 'background.tertiary', borderRadius: 1, p: 1, alignItems: 'center', justifyContent: 'space-evenly'}}
    >
      <Stack sx={{alignItems: 'center'}}>
        <Box src="pet/zephyr.png" component="img" height="75px" width="75px" />
        <Typography variant="subtitle2" color="primary.main">
          {pets?.[0]}
        </Typography>
      </Stack>
      <Stack sx={{alignItems: 'center'}}>
        <Box src="pet/ulysse.png" component="img" height="75px" width="75px" />
        <Typography variant="subtitle2" color="primary.main">
          {pets?.[1]}
        </Typography>
      </Stack>
    </Stack>
  );
}
