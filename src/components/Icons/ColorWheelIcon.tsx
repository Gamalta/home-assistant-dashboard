import SvgIcon, {SvgIconProps} from '@mui/material/SvgIcon';

export function ColorWheelIcon(props: SvgIconProps) {
  return (
    <SvgIcon
      viewBox="0 0 24 24"
      sx={{
        backgroundImage: 'url(color_wheel.png)',
        backgroundSize: 'cover',
        borderRadius: '50%',
      }}
      {...props}
    />
  );
}
