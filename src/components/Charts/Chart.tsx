import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useTheme, type SxProps, type Theme} from '@mui/material/styles';
import {BarPlot} from '@mui/x-charts/BarChart';
import {
  ChartsAxisHighlight,
  chartsAxisHighlightClasses,
} from '@mui/x-charts/ChartsAxisHighlight';
import {ChartsClipPath} from '@mui/x-charts/ChartsClipPath';
import {ChartsContainer} from '@mui/x-charts/ChartsContainer';
import {ChartsTooltip, chartsTooltipClasses} from '@mui/x-charts/ChartsTooltip';
import {AreaPlot, LineHighlightPlot, LinePlot} from '@mui/x-charts/LineChart';
import {useId, type ReactNode} from 'react';
import {chartDomain, stackValues} from '../../utils/chart';

export type ChartSeries = {
  id: string;
  label: string;
  data: (number | null)[];
  format: (value: number) => string;
  /** Couleur de la palette (`'warning'`, `'info'`…), qui suit le thème, ou couleur CSS. */
  color?: string;
  /**
   * Sans variante, la série est principale : aire en dégradé, ou barre ; plusieurs s'empilent.
   * `line` : mesure secondaire, trait fin sur sa propre échelle.
   * `comparison` : période précédente, en pointillés atténués, sur l'échelle principale.
   */
  variant?: 'line' | 'comparison';
  /** Trace en escalier, pour une valeur qui change par paliers. */
  step?: boolean;
};

type ChartProps = {
  /** Abscisses en millisecondes : une date, ou le début d'une période en barres. */
  x: number[];
  series: ChartSeries[];
  formatX: (x: number) => string;
  /** Barres plutôt qu'aires, pour des totaux par période (kWh par jour). */
  bars?: boolean;
  min?: number;
  max?: number;
  loading?: boolean;
  /** Étend l'aire jusqu'aux bords de la modale. */
  bleed?: boolean;
  /** Valeur actuelle et légende, affichées par-dessus le graphique. */
  children?: ReactNode;
  sx?: SxProps<Theme>;
};

export function Chart(props: ChartProps) {
  const {x, series, formatX, bars, min, max, loading, bleed, children, sx} =
    props;
  const theme = useTheme();
  const id = useId();
  const palette = (theme.vars ?? theme).palette;

  const mains = series.filter(item => !item.variant);
  const empty = series.every(item => item.data.every(value => value == null));
  const mainDomain = chartDomain(
    [
      ...stackValues(mains.map(item => item.data)),
      ...series
        .filter(item => item.variant === 'comparison')
        .flatMap(item => item.data),
    ],
    // Une barre qui ne part pas de zéro trompe sur les proportions.
    {min: min ?? (bars ? 0 : undefined), max},
  );
  // Avec les variables CSS du thème, les couleurs suivent le mode clair ou sombre.
  const paletteColors: Partial<Record<string, string>> = {
    primary: palette.primary.main,
    error: palette.error.main,
    warning: palette.warning.main,
    info: palette.info.main,
    success: palette.success.main,
  };
  const colorOf = (item: ChartSeries) => {
    if (item.color) return paletteColors[item.color] ?? item.color;
    return item.variant === 'comparison'
      ? palette.text.secondary
      : palette.primary.main;
  };
  const variantOf = (seriesId: string | number) =>
    series.find(item => item.id === seriesId)?.variant;
  const gradientId = (seriesId: string | number) => `${id}-${seriesId}`;

  return (
    <Box sx={[{position: 'relative'}, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Box
        role="img"
        aria-label={series.map(item => item.label).join(', ')}
        sx={{
          position: 'absolute',
          inset: bleed ? theme.spacing(0, -4, -4) : 0,
        }}
      >
        {loading || empty ? (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading ? 'Chargement…' : 'Aucune donnée'}
          </Typography>
        ) : (
          <ChartsContainer
            margin={0}
            series={series.map(item => ({
              type: bars && !item.variant ? 'bar' : 'line',
              id: item.id,
              label: item.label,
              data: item.data,
              color: colorOf(item),
              stack: item.variant ? undefined : 'main',
              area: !bars && !item.variant,
              curve: item.step ? 'stepAfter' : 'monotoneX',
              showMark: false,
              shape: 'circle' as const,
              yAxisId: item.variant === 'line' ? item.id : 'main',
              valueFormatter: (value: number | null) =>
                value === null ? null : item.format(value),
            }))}
            xAxis={[
              {
                id: 'x',
                data: x,
                scaleType: bars ? 'band' : 'time',
                height: 0,
                valueFormatter: formatX,
              },
            ]}
            yAxis={[
              {id: 'main', width: 0, ...mainDomain},
              ...series
                .filter(item => item.variant === 'line')
                .map(item => ({
                  id: item.id,
                  width: 0,
                  ...chartDomain(item.data),
                })),
            ]}
            sx={{
              [`& .${chartsAxisHighlightClasses.root}`]: {
                stroke: palette.text.secondary,
                strokeDasharray: 'none',
              },
            }}
          >
            <defs>
              {mains.map(item => (
                <linearGradient
                  key={item.id}
                  id={gradientId(item.id)}
                  // Une aire descend jusqu'à zéro, sous le domaine : on dégrade sur la hauteur du graphique.
                  gradientUnits={bars ? 'objectBoundingBox' : 'userSpaceOnUse'}
                  x2="0"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor={colorOf(item)}
                    stopOpacity={bars ? 0.9 : 0.5}
                  />
                  <stop
                    offset="100%"
                    stopColor={colorOf(item)}
                    stopOpacity={bars ? 0.45 : 0}
                  />
                </linearGradient>
              ))}
            </defs>
            <ChartsAxisHighlight x={bars ? 'band' : 'line'} />
            <g clipPath={`url(#${id}-clip)`}>
              {bars ? (
                <BarPlot
                  borderRadius={6}
                  slotProps={{
                    bar: ({seriesId}) => ({
                      fill: `url(#${gradientId(seriesId)})`,
                    }),
                  }}
                />
              ) : (
                <AreaPlot
                  slotProps={{
                    area: ({seriesId}) => ({
                      fill: `url(#${gradientId(seriesId)})`,
                      // L'éclaircissement par défaut fausserait la couleur du thème.
                      filter: undefined,
                    }),
                  }}
                />
              )}
              <LinePlot
                slotProps={{
                  line: ({seriesId}) => ({
                    strokeWidth: variantOf(seriesId) ? 2 : 3,
                    strokeLinecap: 'round',
                    strokeDasharray:
                      variantOf(seriesId) === 'comparison' ? '6 6' : undefined,
                    opacity: variantOf(seriesId) ? 0.8 : 1,
                  }),
                }}
              />
            </g>
            <LineHighlightPlot
              slotProps={{
                lineHighlight: {
                  r: 6,
                  stroke: palette.background.paper,
                  strokeWidth: 2,
                },
              }}
            />
            <ChartsClipPath id={`${id}-clip`} />
            <ChartsTooltip
              trigger="axis"
              sx={{
                [`& .${chartsTooltipClasses.paper}`]: {
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                },
                [`& .${chartsTooltipClasses.cell}`]: {
                  typography: 'body1',
                  py: 0.5,
                },
                [`& .${chartsTooltipClasses.valueCell}`]: {fontWeight: 600},
              }}
            />
          </ChartsContainer>
        )}
      </Box>
      <Stack
        sx={{
          position: 'relative',
          height: '100%',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        {children}
      </Stack>
    </Box>
  );
}
