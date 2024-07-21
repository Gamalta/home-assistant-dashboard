import Button from '@mui/material/Button';
import {BrightnessIcon} from '../../../../Icons/BrightnessIcon';
import {useState} from 'react';
import Popover from '@mui/material/Popover';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import {useLightModalContext} from '../../../../../contexts/LightModalContext';
import Typography from '@mui/material/Typography';

export function BrightnessSlider() {
  const [sliderAnchor, setSliderAnchor] = useState<HTMLButtonElement | null>(
    null
  );
  const {entities, activeEntityIds} = useLightModalContext();
  const activeEntities = entities.filter(entity =>
    activeEntityIds.includes(entity.entity_id)
  );
  const [brightness, setBrightness] = useState(
    activeEntities.length > 0 ? activeEntities[0].custom.brightnessValue : 100
  );

  const handleSliderMove = (_: Event, newBrightness: number | number[]) =>
    setBrightness(newBrightness as number);

  return (
    <>
      <Stack position="relative">
        <BrightnessDisplay brightness={brightness} />
        <Button
          variant="outlined"
          color="inherit"
          onClick={event => setSliderAnchor(event.currentTarget)}
          sx={{height: '100%', overflow: 'hidden', border: '0px'}}
        >
          <BrightnessIcon />
          <Stack
            position="absolute"
            bottom={0}
            width="100%"
            height={`${brightness}%`}
            sx={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 100%)',
            }}
          />
        </Button>
      </Stack>
      <Popover
        open={sliderAnchor !== null}
        anchorEl={sliderAnchor}
        onClose={() => setSliderAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{'& .MuiPopover-paper': {overflow: 'visible'}}}
      >
        <Stack position="relative" width="64px">
          <Slider
            value={brightness}
            onChange={handleSliderMove}
            onChangeCommitted={(_, value) => {
              activeEntities.forEach(entity =>
                entity.service.turnOn({
                  brightness: Math.round(((value as number) * 255) / 100),
                })
              );
            }}
            orientation="vertical"
            sx={{
              height: '150px',
              width: '100%',
              padding: 0,
              overflow: 'hidden',
              '& .MuiSlider-track': {
                width: '100%',
                color: 'transparent',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 100%)',
              },
              '& .MuiSlider-thumb, .MuiSlider-rail': {
                opacity: 0,
              },
            }}
          />
        </Stack>
        <BrightnessDisplay brightness={brightness} />
        <BrightnessIcon
          sx={{
            position: 'absolute',
            bottom: '11px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '24px',
            height: '24px',
          }}
        />
      </Popover>
    </>
  );
}

function BrightnessDisplay({brightness}: {brightness: number}) {
  return (
    <Typography
      variant="body2"
      position="absolute"
      bottom="100%"
      width="100%"
      textAlign="center"
    >
      {brightness} %
    </Typography>
  );
}
