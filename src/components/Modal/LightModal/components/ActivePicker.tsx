import Stack from '@mui/material/Stack';
import {AnimatePresence, motion, useMotionValue} from 'framer-motion';
import {HassEntityWithService} from '@hakit/core';
import {getContainerPosition, getWheelPosition} from '../../../../utils/color';
import {useLightModalContext} from '../../../../contexts/LightModalContext';
import {
  ColorWheel,
  useColorPicker,
  WheelMode,
} from '../../../../hooks/useColorPicker';
import {useEffect} from 'react';
import {Typography} from '@mui/material';

type ActivePickerProps = {
  mode: WheelMode;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  entities: HassEntityWithService<'light'>[];
};

export function ActivePicker(props: ActivePickerProps) {
  const {mode, canvasRef, entities} = props;

  const {
    entities: allEntities,
    activeEntityIds,
    setActiveEntityIds,
    hoverEntity,
    setHoverEntity,
  } = useLightModalContext();
  const {
    color,
    setColor,
    getNeerEntity,
    getCoordFromColorWheel,
    getColorFromCoordWheel,
    setEntitiesColor,
  } = useColorPicker(canvasRef.current, mode);

  const motionXValue = useMotionValue(0);
  const motionYValue = useMotionValue(0);
  const activeEntities = entities.filter(entity =>
    activeEntityIds.includes(entity.entity_id)
  );
  //TODO remove entity has no color (onoff, brightness, color_temp)
  //TODO link entities with same color

  const handleDrag = () => {
    if (!canvasRef.current) return;
    const {x, y} = getWheelPosition(
      canvasRef.current,
      motionXValue.get(),
      motionYValue.get()
    );

    let newX = x;
    let newY = y;

    const distance = Math.hypot(x, y);
    if (Math.abs(distance) > 1) {
      const angle = Math.atan2(y, x);
      const constrainedX = Math.cos(angle);
      const constrainedY = Math.sin(angle);
      const {x: containerX, y: containerY} = getContainerPosition(
        canvasRef.current,
        constrainedX,
        constrainedY
      );
      newX = constrainedX;
      newY = constrainedY;
      motionXValue.set(containerX);
      motionYValue.set(containerY);
    }

    const newColor = getColorFromCoordWheel(newX, newY);
    setColor(newColor);

    const neerEntity = getNeerEntity(
      motionXValue.get(),
      motionYValue.get(),
      allEntities.filter(entity => !activeEntityIds.includes(entity.entity_id))
    );
    setHoverEntity(neerEntity?.entity_id);
  };

  const handleDragEnd = () => {
    if (!canvasRef.current) return;
    const {x, y} = getWheelPosition(
      canvasRef.current,
      motionXValue.get(),
      motionYValue.get()
    );
    const newColor = getColorFromCoordWheel(x, y);
    setColor(newColor);

    if (hoverEntity) {
      setActiveEntityIds(activeEntities => [hoverEntity, ...activeEntities]);
    }

    setEntitiesColor(activeEntities, newColor);
  };

  useEffect(() => {
    if (activeEntities.length === 0) return;
    let color: ColorWheel<WheelMode> | undefined;
    if (mode === 'color') {
      color = activeEntities[0].attributes.rgb_color;
    } else {
      color = activeEntities[0].attributes.color_temp_kelvin;
    }
    if (color) {
      const {x, y} = getCoordFromColorWheel(color);
      setColor(color);
      motionXValue.set(x);
      motionYValue.set(y);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntities]);

  return (
    <AnimatePresence>
      {entities.length > 0 && (
        <motion.div
          exit={{opacity: 0}}
          animate={{opacity: 1}}
          initial={{opacity: 0}}
          whileTap={{scale: 1.1, zIndex: 10, cursor: 'grabbing'}}
          whileHover={{scale: 0.9, zIndex: 10, cursor: 'grab'}}
          style={{
            x: motionXValue,
            y: motionYValue,
            position: 'absolute',
            top: '0',
            left: '0',
            width: '0',
            height: '0',
            transform: 'translate(-50%, -50%)',
          }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          drag={true}
          dragMomentum={false}
        >
          <Stack
            width="32px"
            height="32px"
            borderRadius="50%"
            border="2px solid black"
            boxSizing="border-box"
            justifyContent="center"
            alignItems="center"
            boxShadow="0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15)"
            sx={{
              backgroundColor: `rgb(${color.join(',')})`,
              transform: 'translate(-16px, -38px) rotate(45deg)',
              borderBottomRightRadius: 0,
            }}
          >
            {activeEntities.length > 1 && (
              <Typography
                sx={{
                  color: 'black',
                  transform: 'rotate(-45deg)',
                }}
              >
                {activeEntities.length}
              </Typography>
            )}
          </Stack>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
