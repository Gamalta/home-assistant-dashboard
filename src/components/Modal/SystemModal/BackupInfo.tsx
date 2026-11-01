import {useEntity} from '@hakit/core';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {SideBarConfigType} from '../../../configs/sidebar';
import {formatRelative, hasBackupFailed} from '../../../utils/system';
import {SystemInfoDisplay} from './SystemInfoDisplay';

type BackupInfoProps = {
  systemConfig: SideBarConfigType['system'];
};

export function BackupInfo(props: BackupInfoProps) {
  const {systemConfig} = props;
  const last = useEntity(systemConfig?.lastBackupEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  const attempt = useEntity(
    systemConfig?.lastBackupAttemptEntityId ?? 'unknown',
    {returnNullIfNotFound: true},
  );
  const manager = useEntity(systemConfig?.backupStateEntityId ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  if (!last) return null;

  return (
    <>
      <Divider />
      <Typography variant="subtitle2" color="textSecondary">
        Sauvegardes
      </Typography>
      <SystemInfoDisplay
        label="Dernière réussie"
        sensor={systemConfig?.lastBackupEntityId}
        formatEntity={entity => formatRelative(entity.state) ?? 'Aucune'}
      />
      {attempt &&
        hasBackupFailed(last.state, attempt.state, manager?.state) && (
          <Typography variant="body2" color="error">
            Échec de la dernière tentative ({formatRelative(attempt.state)})
          </Typography>
        )}
      <SystemInfoDisplay
        label="Prochaine"
        sensor={systemConfig?.nextBackupEntityId}
        formatEntity={entity => formatRelative(entity.state) ?? 'Non planifiée'}
      />
    </>
  );
}
