import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type MortgageLegendProps = {
  /** `color` : couleur de la palette, comme celle des séries du graphique. */
  items: {label: string; color: string}[];
};

export function MortgageLegend(props: MortgageLegendProps) {
  const {items} = props;

  return (
    <Stack direction="row" sx={{flexWrap: 'wrap', columnGap: 2, rowGap: 0.5}}>
      {items.map(item => (
        <Stack
          key={item.label}
          direction="row"
          spacing={1}
          sx={{alignItems: 'center'}}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: `${item.color}.main`,
            }}
          />
          <Typography variant="body2" color="textSecondary">
            {item.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
