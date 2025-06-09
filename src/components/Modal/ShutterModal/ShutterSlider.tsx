import Stack from '@mui/material/Stack';
import {
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';

type ShutterSliderProps = {
  value: number;
  onChange: (percent: number) => void;
};

export function ShutterSlider(props: ShutterSliderProps) {
  const {value, onChange} = props;

  const motionValue = useMotionValue(0);
  const [height, setHeight] = useState(0);
  const [isDragging, setDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const percent = useTransform(
    motionValue,
    [0, containerRef.current?.getBoundingClientRect().height ?? 100],
    [0, 100]
  );

  useEffect(() => {
    if (containerRef.current) {
      const coverPosition = Math.abs(100 - value);
      const containerHeight =
        containerRef.current.getBoundingClientRect().height;
      const initialY = (coverPosition / 100) * containerHeight;
      motionValue.set(initialY);
      setHeight(coverPosition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current, value]);

  const controls = useDragControls();

  return (
    <>
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
          const percentDiff = Math.abs(height - percent.get());
          setAnimationDuration((2 / 10) * percentDiff);
          setHeight(percent.get());
          onChange(Math.abs(100 - percent.get()));
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
              height: `${height}%`,
              transition: `height ${animationDuration}s ease`,
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
              const percentDiff = Math.abs(height - percent.get());
              setAnimationDuration((2 / 10) * percentDiff);
              setHeight(percent.get());
              onChange(Math.abs(100 - percent.get()));
            }}
          />
        </Stack>
      </Stack>
    </>
  );
}
