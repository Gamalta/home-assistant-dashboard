import {Modal, ModalProps} from '..';
import {ShutterConfigType} from '../../../configs/house';
import {useEntity} from '@hakit/core';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpwardRounded';
import StopIcon from '@mui/icons-material/StopRounded';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownwardRounded';
import Stack from '@mui/material/Stack';
import {useEffect, useRef, useState} from 'react';
import {
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import {AttributesDisplay} from '../../display/AttributesDisplay';

type DesktopModalProps = Omit<ModalProps, 'children'> & {
  shutterConfig: ShutterConfigType;
};

export function ShutterModal(props: DesktopModalProps) {
  const {shutterConfig, onClose, ...modalProps} = props;

  const entity = useEntity(shutterConfig.shutterEntityId, {
    returnNullIfNotFound: true,
  });
  const position = 100 - (entity?.attributes.current_position ?? 0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const controls = useDragControls();

  const motionValue = useMotionValue(0);
  const percent = useTransform(
    motionValue,
    [0, containerRef.current?.getBoundingClientRect().height ?? 100],
    [0, 100]
  );
  const [coverPosition, setCoverPosition] = useState(position);
  const [targetPosition, setTargetPosition] = useState(position);
  const [isDragging, setDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    if (!entity) return;
    setCoverPosition(position);
    setTargetPosition(position);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  useEffect(() => {
    if (coverPosition === targetPosition) return;

    const interval = setInterval(() => {
      setCoverPosition(prev => {
        const diff = targetPosition - prev;
        const step = 0.5;

        if (Math.abs(diff) <= step) {
          clearInterval(interval);
          return targetPosition;
        }

        return prev + step * Math.sign(diff);
      });
    }, 100);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPosition]);

  //TODO adapt modal to supported_feature

  return (
    <Modal
      {...modalProps}
      onClose={onClose}
      action={
        <Stack
          direction="row"
          borderRadius={1}
          border={theme => `1px solid ${theme.palette.divider}`}
          spacing={1}
          p={1}
        >
          <AttributesDisplay attributes={[entity?.attributes ?? {}]} />
        </Stack>
      }
    >
      <Stack spacing={3} px={1}>
        <Stack
          width="200px"
          height="197px"
          pl="11px"
          pr="11.5px"
          pt="22.5px"
          pb="9px"
          position="relative"
          sx={{
            backgroundImage: 'url("shutter/shutter_base.png")',
            backgroundSize: 'cover',
          }}
          onPointerDown={event => controls.start(event, {snapToCursor: true})}
          onPointerUp={() => {
            if (hasDragged) return;
            setDragging(false);
            setTargetPosition(percent.get());
            entity?.service.setCoverPosition({
              position: Math.abs(100 - percent.get()),
            });
          }}
        >
          <Stack
            ref={containerRef}
            position="relative"
            width="100%"
            height="100%"
          >
            <motion.img
              draggable={false}
              src="shutter/shutter_blind.png"
              style={{
                position: 'absolute',
                width: '100%',
                top: 0,
                height: motionValue,
                objectFit: 'cover',
                objectPosition: 'bottom',
                opacity: 1,
                touchAction: 'none',
                userSelect: 'none',
                maskImage: isDragging
                  ? `linear-gradient(
                to top,
                rgba(0, 0, 0, 1) 0px,
                rgba(0, 0, 0, 0.8) 30px,
                rgba(0, 0, 0, 0) 100%
              )`
                  : `linear-gradient(
                to top,
                rgba(0, 0, 0, 0.8) 0px,
                rgba(0, 0, 0, 0.3) 30px,
                rgba(0, 0, 0, 0) 100%
              )`,
              }}
            />
            <img
              draggable={false}
              src="shutter/shutter_blind.png"
              style={{
                position: 'absolute',
                width: '100%',
                top: 0,
                height: `${coverPosition}%`,
                transition: 'height 0.1s ease',
                objectFit: 'cover',
                objectPosition: 'bottom',
                opacity: isDragging ? 0.3 : 1,
                touchAction: 'none',
                userSelect: 'none',
              }}
            />
            <motion.div
              drag="y"
              dragControls={controls}
              dragConstraints={containerRef}
              dragElastic={0}
              dragMomentum={false}
              style={{
                touchAction: 'none',
                position: 'absolute',
                y: motionValue,
              }}
              onDragStart={() => {
                setDragging(true);
                setHasDragged(false);
              }}
              onDrag={(_, info) => {
                if (Math.abs(info.delta.y) > 2) {
                  setHasDragged(true);
                }
              }}
              onDragEnd={() => {
                setDragging(false);
                setTargetPosition(percent.get());
                entity?.service.setCoverPosition({
                  position: Math.abs(100 - percent.get()),
                });
              }}
            />
          </Stack>
        </Stack>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          bgcolor="background.tertiary"
          borderRadius={1}
          spacing={1}
        >
          <IconButton
            sx={{borderRadius: 1}}
            onClick={() => {
              setTargetPosition(0);
              motionValue.set(0);
              entity?.service.openCover();
            }}
          >
            <ArrowUpwardIcon />
          </IconButton>
          <Divider orientation="vertical" sx={{height: '25px'}} />
          <IconButton
            sx={{borderRadius: 1}}
            onClick={() => {
              setTargetPosition(coverPosition);
              motionValue.set(coverPosition);
              entity?.service.stopCover();
            }}
          >
            <StopIcon />
          </IconButton>
          <Divider orientation="vertical" sx={{height: '25px'}} />
          <IconButton
            sx={{borderRadius: 1}}
            onClick={() => {
              setTargetPosition(100);
              motionValue.set(0);
              entity?.service.closeCover();
            }}
          >
            <ArrowDownwardIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Modal>
  );
}
