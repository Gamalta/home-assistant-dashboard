import Stack from '@mui/material/Stack';
import {AnimatePresence, motion} from 'framer-motion';
import {useLightModalContext} from '../../../../contexts/LightModalContext';
import {HassEntityWithService, temperature2rgb} from '@hakit/core';
import {useEffect, useMemo, useState} from 'react';
import {
  getCoordFromColor,
  getCoordFromColorTemp,
} from '../../../../utils/color';
import {ColorWheel, WheelMode} from '../../../../hooks/useColorPicker';

type PickerProps = {
  mode: WheelMode;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  entity: HassEntityWithService<'light'>;
};

export function Picker(props: PickerProps) {
  const {mode, canvasRef, entity} = props;
  const canvas = canvasRef.current;
  const {setActiveEntityIds, hoverEntity} = useLightModalContext();
  const [position, setPosition] = useState({x: 0, y: 0});
  const hovered = hoverEntity === entity.entity_id;
  const color = useMemo<[number, number, number]>(
    () =>
      mode === 'color'
        ? entity.attributes.rgb_color ?? [255, 255, 255]
        : temperature2rgb(entity.attributes.color_temp_kelvin ?? 4333),
    [mode, entity]
  );

  useEffect(() => {
    let color: ColorWheel<WheelMode> | undefined;
    if (mode === 'color') {
      color = entity.attributes.rgb_color;
    } else {
      color = entity.attributes.color_temp_kelvin;
    }
    if (color) {
      let position = {x: 0, y: 0};
      if (mode === 'color') {
        position = getCoordFromColor(canvas, color as ColorWheel<'color'>);
      } else {
        position = getCoordFromColorTemp(
          canvas,
          color as ColorWheel<'temperature'>
        );
      }
      setPosition(position);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  useEffect(() => {
    if (!entity || !canvas) return;
    const {x, y} = getCoordFromColor(canvas, color);
    setPosition({x, y});
  }, [color, entity, canvas]);

  return (
    <AnimatePresence>
      <Stack
        component={motion.div}
        exit={{opacity: 0}}
        animate={{opacity: 1}}
        initial={{opacity: 0, transform: 'translate(-50%, -50%)'}}
        onClick={() => setActiveEntityIds([entity.entity_id])}
        position="absolute"
        width="32px"
        height="32px"
        top={position.y}
        left={position.x}
      >
        <Stack
          m="4px"
          width="24px"
          height="24px"
          borderRadius="50%"
          border={`${hovered ? '3px' : '2px'} solid black`}
          boxShadow="0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15)"
          bgcolor={`rgb(${color.join(',')})`}
          sx={{
            '&:hover': {
              border: '2px solid white',
            },
          }}
        />
      </Stack>
    </AnimatePresence>
  );
}
