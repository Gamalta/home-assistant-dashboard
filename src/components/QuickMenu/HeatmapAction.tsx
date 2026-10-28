import ThermostatIcon from '@mui/icons-material/ThermostatRounded';
import SpeedDialAction, {
  type SpeedDialActionProps,
} from '@mui/material/SpeedDialAction';
import {useAppContext} from '../../contexts/AppContext';

// SpeedDial injecte ses props (open, delay, slotProps…) dans ses enfants.
type HeatmapActionProps = SpeedDialActionProps & {
  onToggle: () => void;
};

export function HeatmapAction(props: HeatmapActionProps) {
  const {onToggle, slotProps, ...actionProps} = props;
  const {configuration, setConfiguration} = useAppContext();
  const active = configuration.heatmapShader;

  return (
    <SpeedDialAction
      {...actionProps}
      icon={<ThermostatIcon />}
      onClick={() => {
        setConfiguration(prev => ({
          ...prev,
          heatmapShader: !prev.heatmapShader,
        }));
        onToggle();
      }}
      slotProps={{
        ...slotProps,
        fab: {
          // Garde la ref posée par SpeedDial pour la navigation au clavier.
          ...slotProps?.fab,
          role: 'menuitemcheckbox',
          'aria-checked': active,
          sx: active
            ? {bgcolor: 'primary.main', color: 'primary.contrastText'}
            : undefined,
        },
        tooltip: {title: 'Température', open: true, placement: 'right'},
      }}
    />
  );
}
