import Stack from '@mui/material/Stack';
import {useHouseContext} from '../../contexts/HouseContext';
import {Room} from './Room';
import {useCallback, useEffect, useState} from 'react';
import Alert from '@mui/material/Alert';
import {CircularProgress} from '@mui/material';

export function House() {
  const {config} = useHouseContext();
  const houseConfig = config?.house;
  const [nightOpacity, setNightOpacity] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [baseImageRef, setBaseImageRef] = useState<HTMLImageElement | null>(
    null
  );
  const [imageSize, setImageSize] = useState({width: 0, height: 0});

  useEffect(() => {
    const updateOpacity = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 8) {
        setNightOpacity(1 - (hour - 6) / 2);
      } else if (hour >= 8 && hour < 16) {
        setNightOpacity(0);
      } else if (hour >= 16 && hour < 18) {
        setNightOpacity((hour - 16) / 2);
      } else if (hour >= 18 || hour < 6) {
        setNightOpacity(1);
      }
    };

    updateOpacity();
    const interval = setInterval(updateOpacity, 60000);

    return () => clearInterval(interval);
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleResize = useCallback(async () => {
    if (!baseImageRef) return;
    if (!baseImageRef.naturalWidth || !baseImageRef.naturalHeight) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    const naturalWidth = baseImageRef.naturalWidth;
    const naturalHeight = baseImageRef.naturalHeight;
    const aspectRatio = naturalWidth / naturalHeight;
    const {width, height} = baseImageRef.getBoundingClientRect();
    if (width / height > aspectRatio) {
      setImageSize({width: height * aspectRatio, height});
    } else {
      setImageSize({width, height: width / aspectRatio});
    }
  }, [baseImageRef]);

  useEffect(() => {
    if (!baseImageRef) return;
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(baseImageRef);

    return () => resizeObserver.unobserve(baseImageRef);
  }, [baseImageRef, handleResize]);

  if (!houseConfig) {
    if (showLoading) {
      return (
        <Stack height="100%" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Stack>
      );
    } else {
      return (
        <Stack height="100%" justifyContent="center" alignItems="center">
          <Alert severity="error" variant="filled">
            Impossible de charger la configuration.
          </Alert>
        </Stack>
      );
    }
  }

  return (
    <Stack
      height="100%"
      overflow="hidden"
      position="relative"
      alignItems="center"
      sx={{
        '& img': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transition: 'opacity 1s',
          objectFit: 'contain',
        },
      }}
    >
      <img
        ref={baseImageRef => setBaseImageRef(baseImageRef)}
        src={houseConfig.day_floor_plan}
      />
      <img src={houseConfig.night_floor_plan} style={{opacity: nightOpacity}} />
      <Stack
        position="relative"
        top="50%"
        width={imageSize.width}
        height={imageSize.height}
        sx={{
          transform: 'translateY(-50%)',
        }}
      >
        {houseConfig.rooms.map(room => (
          <Room key={room.id} room={room} />
        ))}
      </Stack>
    </Stack>
  );
}
