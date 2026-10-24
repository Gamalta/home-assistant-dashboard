import {HassEntityWithService} from '@hakit/core';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type EntitySliderProps = {
  entity: HassEntityWithService<'number'>;
  label: string;
};

export function EntitySlider(props: EntitySliderProps) {
  const {entity, label} = props;

  return (
    <Stack direction="row" spacing={2} sx={{alignItems: 'center', px: 1}}>
      <Typography sx={{minWidth: '80px'}}>{label}</Typography>
      <Slider
        // Remonté à chaque nouvel état : il suit Home Assistant sans bouger pendant le geste.
        key={entity.state}
        aria-label={label}
        defaultValue={Number(entity.state)}
        min={entity.attributes.min}
        max={entity.attributes.max}
        step={entity.attributes.step}
        valueLabelDisplay="auto"
        onChangeCommitted={(_, value) =>
          entity.service.setValue({serviceData: {value: String(value)}})
        }
      />
    </Stack>
  );
}
