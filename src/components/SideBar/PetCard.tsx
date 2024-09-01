import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function PetCard() {
  return (
    <Stack
      direction="row"
      spacing={2}
      bgcolor="background.tertiary"
      borderRadius={1}
      p={1}
      alignItems="center"
      justifyContent="space-evenly"
    >
      <Stack alignItems="center">
        <Box src="pet/zephyr.png" component="img" height="75px" width="75px" />
        <Typography variant="subtitle2" color="primary.main">
          Zéphyr
        </Typography>
      </Stack>
      <Stack alignItems="center">
        <Box src="pet/ulysse.png" component="img" height="75px" width="75px" />
        <Typography variant="subtitle2" color="primary.main">
          Ulysse
        </Typography>
      </Stack>
    </Stack>
  );
}
