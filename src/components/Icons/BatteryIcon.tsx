import SvgIcon, {SvgIconProps} from '@mui/material/SvgIcon';

type BatteryIconProps = SvgIconProps & {
  level: number | null;
};

// Pile dont le remplissage suit le niveau, au pour cent près.
export function BatteryIcon(props: BatteryIconProps) {
  const {level, ...iconProps} = props;
  const height = (Math.min(100, Math.max(0, level ?? 0)) / 100) * 12;

  return (
    <SvgIcon {...iconProps} viewBox="0 0 24 24">
      <rect x="10" y="2" width="4" height="3" rx="1" />
      <rect
        x="8"
        y="5"
        width="8"
        height="16"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect x="10" y={19 - height} width="4" height={height} rx="0.5" />
    </SvgIcon>
  );
}
