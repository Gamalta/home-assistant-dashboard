import {useEntity} from '@hakit/core';
import Alert from '@mui/material/Alert';
import type {VacuumEntityIds} from '../../../utils/entity/vacuum';

type VacuumAlertsProps = {
  ids: VacuumEntityIds;
};

const options = {returnNullIfNotFound: true} as const;
const NO_ERROR = ['no_error', 'unknown', 'unavailable'];

// dreame-vacuum met le texte de l'erreur dans les attributs, dans la langue de
// Home Assistant. Les réservoirs et le sac de la station y passent aussi.
export function VacuumAlerts(props: VacuumAlertsProps) {
  const {ids} = props;
  const vacuum = useEntity(ids.vacuum, options);
  const error = useEntity(ids.error, options);

  return (
    <>
      {vacuum?.state === 'unavailable' && (
        <Alert severity="warning" variant="filled">
          Aspirateur hors ligne
        </Alert>
      )}
      {error && !NO_ERROR.includes(error.state) && (
        <Alert severity="error" variant="filled">
          {error.attributes.description ?? error.state}
        </Alert>
      )}
    </>
  );
}
