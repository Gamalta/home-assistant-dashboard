import Box from '@mui/material/Box';
import Slider, {SliderProps} from '@mui/material/Slider';
import Stack from '@mui/material/Stack';

export function ShutterSlider(props: SliderProps) {
  return (
    <Stack
      width="200px"
      height="197px"
      pl="11px"
      pr="11.5px"
      pt="22.5px"
      pb="9px"
      sx={{
        backgroundImage: 'url("shutter/shutter_base.png")',
        backgroundSize: 'cover',
      }}
    >
      <Slider
        orientation="vertical"
        sx={{
          boxSizing: 'border-box',
          height: '100%',
          width: '100%',
          p: 0,
          borderRadius: 0,
          '& .MuiSlider-rail': {
            display: 'none',
          },
          '& .MuiSlider-thumb': {
            display: 'none',
          },
        }}
        slots={{
          track: ({style}) => (
            <>
              <img
                src="shutter/shutter_blind.png"
                style={{
                  top: 0,
                  position: 'absolute',
                  objectFit: 'cover',
                  objectPosition: 'bottom',
                  width: '100%',
                  height: `calc(100% - ${style.height})`,
                }}
              />
              <Box
                height={`min(15px, calc(100% - ${style.height}))`}
                width="100%"
                position="absolute"
                sx={{
                  background:
                    'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.0))',
                }}
              />
            </>
          ),
        }}
        {...props}
      />
    </Stack>
  );
}
