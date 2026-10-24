import {EntityName, FilterByDomain, useEntity} from '@hakit/core';
import Stack from '@mui/material/Stack';
import {
  AreaPlot,
  ChartsContainer,
  ChartsTooltip,
  LinePlot,
} from '@mui/x-charts';
import {formatPower, parsePower} from '../../../utils/entity/plug';

type PowerHistoryProps = {
  entityId: FilterByDomain<EntityName, 'sensor'>;
};

// Composant à part : l'historique n'est demandé qu'à l'ouverture de la modale.
export function PowerHistory(props: PowerHistoryProps) {
  const {entityId} = props;
  const history = useEntity(entityId, {
    returnNullIfNotFound: true,
    historyOptions: {disable: false, hoursToShow: 24},
  })?.history;

  const dataset = (history?.entityHistory ?? []).flatMap(data => {
    const power = parsePower(data.s);
    return power === null ? [] : [{timestamp: data.lu * 1000, power}];
  });
  if (dataset.length < 2) return null;

  return (
    <Stack
      role="img"
      aria-label="Puissance des dernières 24 h"
      sx={{
        height: 150,
        bgcolor: 'background.tertiary',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <ChartsContainer
        margin={0}
        dataset={dataset}
        series={[
          {
            type: 'line',
            dataKey: 'power',
            label: 'Puissance',
            curve: 'stepAfter',
            area: true,
            color: 'orange',
            valueFormatter: value => (value === null ? '' : formatPower(value)),
          },
        ]}
        xAxis={[
          {
            dataKey: 'timestamp',
            scaleType: 'time',
            height: 0,
            valueFormatter: (value: number) =>
              new Date(value).toLocaleTimeString('fr', {
                hour: '2-digit',
                minute: '2-digit',
              }),
          },
        ]}
        yAxis={[{width: 0, min: 0}]}
      >
        <AreaPlot opacity={0.2} />
        <LinePlot />
        <ChartsTooltip />
      </ChartsContainer>
    </Stack>
  );
}
