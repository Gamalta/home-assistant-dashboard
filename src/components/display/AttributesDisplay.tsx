import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';
import Divider from '@mui/material/Divider';
import {Fragment} from 'react/jsx-runtime';

type AttributesDisplayProps = {
  type?: 'icon' | 'text';
  attributes?: {[key: string]: string}[];
};

export function AttributesDisplay(props: AttributesDisplayProps) {
  const {type = 'icon', attributes} = props;

  if (type === 'icon')
    return (
      <Stack sx={{position: 'relative'}}>
        <Tooltip
          title={
            <Stack sx={{justifyContent: 'center', padding: 1}}>
              {attributes?.map((entity, index) => (
                <Fragment key={`${index}`}>
                  {Object.entries(entity).map(([key, value]) => (
                    <Stack
                      direction="row"
                      sx={{gap: 2, justifyContent: 'space-between'}}
                      key={`${index}-${key}`}
                    >
                      <Typography>{key}:</Typography>
                      <Typography color="text.secondary">
                        {value ? value.toString() : '--'}
                      </Typography>
                    </Stack>
                  ))}
                  {index + 1 !== attributes.length && <Divider sx={{my: 1}} />}
                </Fragment>
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
      <Stack direction="column" sx={{justifyContent: 'center'}}>
        {attributes?.map((entity, index) => (
          <Fragment key={`${index}`}>
            {Object.entries(entity).map(([key, value]) => (
              <Stack
                direction="row"
                sx={{justifyContent: 'space-between', gap: 2}}
                key={`${index}-${key}`}
              >
                <Typography>{key}:</Typography>
                <Typography color="text.secondary">{value}</Typography>
              </Stack>
            ))}
            {index + 1 !== attributes.length && <Divider sx={{my: 1}} />}
          </Fragment>
        ))}
      </Stack>
    );
  return null;
}
