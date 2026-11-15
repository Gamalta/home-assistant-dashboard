import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useState, type PointerEvent} from 'react';
import {useAppContext} from '../contexts/AppContext';
import {useHouseContext} from '../contexts/HouseContext';
import {useHeatmapPoints} from '../hooks/useHeatmapPoints';
import {
  HEATMAP_SCALES,
  getTemperatureRange,
  heatmapColor,
  heatmapGradient,
} from '../rendering/shaders/HeatmapGroundMaterial/common';

const format = (temperature: number) =>
  `${temperature.toLocaleString('fr', {maximumFractionDigits: 1})} °C`;

/**
 * Couleurs de la carte des températures, en bas de la vue 3D, montée avec la
 * carte. Comme le sol, elle va du capteur le plus froid au plus chaud, avec
 * leurs couleurs sur l'échelle choisie. Survoler le dégradé, ou le toucher,
 * donne la température de chaque couleur.
 */
export function HeatmapLegend() {
  const {configuration} = useAppContext();
  const {houseConfig} = useHouseContext();
  const rooms = houseConfig?.house.rooms ?? [];
  const points = useHeatmapPoints(rooms.filter(room => !room.outdoor));
  const [ratio, setRatio] = useState<number>();

  if (!points.length) return null;
  const {minTemp, maxTemp} = getTemperatureRange(
    points,
    HEATMAP_SCALES[configuration.heatmapScale],
  );
  const temperatures = points.map(point => point.temperature);
  const low = Math.min(...temperatures);
  const high = Math.max(...temperatures);
  const onScale = (temperature: number) =>
    (temperature - minTemp) / (maxTemp - minTemp);
  const at = (ratio: number) => low + ratio * (high - low);
  const point = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setRatio(Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1));
  };

  return (
    <Paper
      component="section"
      aria-label="Légende des températures"
      elevation={6}
      sx={{
        // Sur téléphone, en tête du carrousel des pièces qui couvre le bas.
        position: {sm: 'absolute'},
        bottom: {sm: 16},
        left: {sm: '50%'},
        transform: {sm: 'translateX(-50%)'},
        alignSelf: 'center',
        width: 'min(360px, calc(100% - 32px))',
        px: 2,
        py: 1.5,
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{alignItems: 'center'}}>
        <Typography variant="caption">{format(low)}</Typography>
        <Box
          data-testid="heatmap-gradient"
          onPointerDown={point}
          onPointerMove={point}
          // Au doigt, la température reste affichée une fois l'appui levé.
          onPointerLeave={event =>
            event.pointerType !== 'touch' && setRatio(undefined)
          }
          sx={{
            position: 'relative',
            flex: 1,
            height: 12,
            borderRadius: 6,
            background: heatmapGradient(onScale(low), onScale(high)),
            cursor: 'crosshair',
            // Glisser le doigt parcourt l'échelle au lieu de faire défiler.
            touchAction: 'none',
          }}
        >
          {ratio !== undefined && (
            <Box
              sx={{
                position: 'absolute',
                left: `${ratio * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '3px solid white',
                boxShadow: 2,
                bgcolor: heatmapColor(onScale(at(ratio))),
                pointerEvents: 'none',
              }}
            >
              <Typography
                variant="caption"
                role="status"
                sx={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  px: 1,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {format(at(ratio))}
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="caption">{format(high)}</Typography>
      </Stack>
    </Paper>
  );
}
