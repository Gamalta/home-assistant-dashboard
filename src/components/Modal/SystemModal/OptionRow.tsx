import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import {
  ConfigurationOptions,
  useAppContext,
} from '../../../contexts/AppContext';

type OptionRowProps = {
  label: string;
  option: Exclude<
    keyof ConfigurationOptions,
    'screensaverMinutes' | 'hiddenCategories'
  >;
  disabled?: boolean;
};

export function OptionRow(props: OptionRowProps) {
  const {label, option, disabled} = props;
  const {configuration, setConfiguration} = useAppContext();

  return (
    <Stack
      direction="row"
      sx={{justifyContent: 'space-between', alignItems: 'center'}}
    >
      <Typography color={disabled ? 'textDisabled' : undefined}>
        {label}
      </Typography>
      <Switch
        checked={configuration[option]}
        disabled={disabled}
        onChange={event =>
          setConfiguration(prev => ({...prev, [option]: event.target.checked}))
        }
      />
    </Stack>
  );
}
