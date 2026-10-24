import {EntityName, FilterByDomain, useEntity} from '@hakit/core';
import Typography from '@mui/material/Typography';
import {
  alignHistories,
  formatTime,
  isHistoryLoading,
} from '../../../utils/chart';
import {formatPower, parsePower} from '../../../utils/entity/outlet';
import {Chart} from '../../Charts/Chart';

type PowerHistoryProps = {
  entityId: FilterByDomain<EntityName, 'sensor'>;
};

// Composant à part : l'historique n'est demandé qu'à l'ouverture de l'onglet.
export function PowerHistory(props: PowerHistoryProps) {
  const {entityId} = props;
  const entity = useEntity(entityId, {
    returnNullIfNotFound: true,
    historyOptions: {disable: false, hoursToShow: 24},
  });
  if (!entity) return null;

  // Un pas de 5 min garde les pics courts, fréquents sur une prise.
  const {
    x,
    data: [power],
  } = alignHistories([entity.history?.entityHistory ?? []], 5 * 60 * 1000);
  const current = parsePower(entity.state);

  return (
    <Chart
      bleed
      loading={isHistoryLoading(entity.history)}
      x={x}
      min={0}
      formatX={formatTime}
      series={[
        {
          id: 'power',
          label: 'Puissance',
          data: power,
          color: 'warning',
          step: true,
          format: formatPower,
        },
      ]}
      // Taille de l'onglet réglage (illustration, barre d'actions, marges) : la modale garde sa taille.
      sx={{height: 409, width: 316}}
    >
      <Typography variant="h4">
        {current === null ? '—' : formatPower(current)}
      </Typography>
    </Chart>
  );
}
