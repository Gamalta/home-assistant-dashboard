import {useEntity} from '@hakit/core';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {SideBarConfigType} from '../../../configs/sidebar';
import {isUnplugged} from '../../../utils/system';
import {SystemInfoDisplay} from './SystemInfoDisplay';

// États et chargeurs de l'application Companion Android.
const BATTERY_STATES: Record<string, string> = {
  charging: 'En charge',
  discharging: 'Ne charge pas',
  not_charging: 'Charge en pause',
  full: 'Chargée',
};
const CHARGER_TYPES: Record<string, string> = {
  ac: 'Secteur',
  usb: 'USB',
  wireless: 'Sans fil',
  dock: 'Station',
  none: 'Aucun',
};

type TabletInfoProps = {
  systemConfig: SideBarConfigType['system'];
};

export function TabletInfo(props: TabletInfoProps) {
  const {systemConfig} = props;
  const level = useEntity(
    systemConfig?.tabletBatteryLevelEntityId ?? 'unknown',
    {returnNullIfNotFound: true},
  );
  if (!level) return null;

  return (
    <>
      <Divider />
      <Typography variant="subtitle2" color="text.secondary">
        Tablette murale
      </Typography>
      <SystemInfoDisplay
        label="Batterie"
        sensor={systemConfig?.tabletBatteryLevelEntityId}
        formatEntity={entity => `${entity.state} %`}
      />
      <SystemInfoDisplay
        label="Charge"
        sensor={systemConfig?.tabletBatteryStateEntityId}
        formatEntity={entity => BATTERY_STATES[entity.state] ?? entity.state}
        isWarning={entity => isUnplugged(entity.state)}
      />
      <SystemInfoDisplay
        label="Chargeur"
        sensor={systemConfig?.tabletChargerTypeEntityId}
        formatEntity={entity => CHARGER_TYPES[entity.state] ?? entity.state}
      />
    </>
  );
}
