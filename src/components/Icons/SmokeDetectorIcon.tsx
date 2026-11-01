import SvgIcon, {SvgIconProps} from '@mui/material/SvgIcon';

type SmokeDetectorIconProps = SvgIconProps & {
  ledColor?: string;
};

// Détecteur carré vu de dessous : ses grilles, son bouton et son voyant.
export function SmokeDetectorIcon(props: SmokeDetectorIconProps) {
  const {ledColor, ...iconProps} = props;

  return (
    <SvgIcon {...iconProps} viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm3.25 2.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5Zm0 11.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5ZM5.5 10.75v2.5a.75.75 0 0 0 1.5 0v-2.5a.75.75 0 0 0-1.5 0Zm11.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5a.75.75 0 0 0-1.5 0ZM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 1.25a3.25 3.25 0 1 1 0 6.5 3.25 3.25 0 0 1 0-6.5Z"
      />
      {ledColor && <circle cx="12" cy="12" r="2" fill={ledColor} />}
    </SvgIcon>
  );
}
