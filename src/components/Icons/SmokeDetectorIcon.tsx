import SvgIcon, {SvgIconProps} from '@mui/material/SvgIcon';

type SmokeDetectorIconProps = SvgIconProps & {
  ledColor?: string;
};

// Détecteur au plafond, vu de côté, avec son voyant.
export function SmokeDetectorIcon(props: SmokeDetectorIconProps) {
  const {ledColor, ...iconProps} = props;

  return (
    <SvgIcon {...iconProps} viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="2" rx="1" />
      <path fillRule="evenodd" d="M4 7h16v1a8 8 0 0 1-16 0Zm4 4.5h8v1.2H8Z" />
      {ledColor && <circle cx="12" cy="14" r="1.8" fill={ledColor} />}
    </SvgIcon>
  );
}
