import SvgIcon, {SvgIconProps} from '@mui/material/SvgIcon';

export function TemperatureWheelIcon(props: SvgIconProps) {
  return (
    <SvgIcon
      viewBox="0 0 24 24"
      sx={{
        backgroundImage:
          'linear-gradient(0deg, rgb(166, 209, 255) 0%, rgb(255, 255, 255) 50%, rgb(255, 160, 0) 100%)',
        borderRadius: '50%',
      }}
      {...props}
    />
  );
}
