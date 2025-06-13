import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';
import Divider from '@mui/material/Divider';

type AttributesDisplayProps = {
  type?: 'icon' | 'text';
  attributes?: {[key: string]: string}[];
};

export function AttributesDisplay(props: AttributesDisplayProps) {
  const {type = 'icon', attributes} = props;

  if (type === 'icon')
    return (
      <Stack position="relative">
        <Tooltip
          title={
            <Stack justifyContent="center" padding={1}>
              {attributes?.map((entity, index) => (
                <>
                  {Object.entries(entity).map(([key, value]) => (
                    <Stack
                      gap={2}
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography>{key}:</Typography>
                      <Typography color="textSecondary">{value}</Typography>
                    </Stack>
                  ))}
                  {index + 1 !== attributes.length && <Divider sx={{my: 1}} />}
                </>
              ))}
            </Stack>
          }
        >
          <InfoIcon sx={{opacity: 0.6}} />
        </Tooltip>
      </Stack>
    );
  if (type === 'text')
    return (
      <Stack direction="column" justifyContent="center">
        {attributes?.map(entity => (
          <>
            {Object.entries(entity).map(([key, value]) => (
              <Stack gap={2} direction="row" justifyContent="space-between">
                <Typography>{key}:</Typography>
                <Typography color="textSecondary">{value}</Typography>
              </Stack>
            ))}
            <Divider />
          </>
        ))}
      </Stack>
    );
  return null;
}
