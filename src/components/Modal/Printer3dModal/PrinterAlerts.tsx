import {useEntity} from '@hakit/core';
import Alert from '@mui/material/Alert';
import type {Printer3dEntityIds} from '../../../utils/entity/printer3d';

type PrinterAlertsProps = {
  ids: Printer3dEntityIds;
};

const options = {returnNullIfNotFound: true} as const;

// ha-bambulab met le texte de l'erreur dans les attributs, dans la langue de Home Assistant.
export function PrinterAlerts(props: PrinterAlertsProps) {
  const {ids} = props;
  const online = useEntity(ids.online, options);
  const printError = useEntity(ids.printError, options);
  const hmsErrors = useEntity(ids.hmsErrors, options);

  return (
    <>
      {online?.state === 'off' && (
        <Alert severity="warning" variant="filled">
          Imprimante hors ligne
        </Alert>
      )}
      {printError?.state === 'on' && (
        <Alert severity="error" variant="filled">
          Erreur d'impression : {printError.attributes.error ?? 'inconnue'}
        </Alert>
      )}
      {hmsErrors?.state === 'on' && (
        <Alert severity="error" variant="filled">
          Erreur HMS : {hmsErrors.attributes['1-Error'] ?? 'inconnue'}
        </Alert>
      )}
    </>
  );
}
