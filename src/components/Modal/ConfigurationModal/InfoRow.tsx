import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type InfoRowProps = {
  label: string;
  value: string | number;
};

export function InfoRow(props: InfoRowProps) {
  const {label, value} = props;

  return (
    <Stack
      direction="row"
      sx={{justifyContent: 'space-between', alignItems: 'center'}}
    >
      <Typography>{label}</Typography>
      <Typography>{value}</Typography>
    </Stack>
  );
}
