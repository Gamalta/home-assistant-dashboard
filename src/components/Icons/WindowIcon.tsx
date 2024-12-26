import SvgIcon, {SvgIconProps} from '@mui/material/SvgIcon';

export function WindowIcon(props: SvgIconProps) {
  return (
    <SvgIcon
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
    >
      <path
        d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640 q0 33-23.5 56.5T720-80H240Zm0-440h160v-80h160v40h-160v40h320v-280H240v280Zm0 80v280h480v-280H240Zm0280h480-480Z"
        transform="rotate(90 480 -480)"
      />
    </SvgIcon>
  );
}
