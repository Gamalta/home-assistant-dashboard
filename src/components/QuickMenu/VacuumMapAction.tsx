import SpeedDialAction, {
  type SpeedDialActionProps,
} from '@mui/material/SpeedDialAction';
import {useAppContext} from '../../contexts/AppContext';
import {RobotVacuumIcon} from '../Icons/RobotVacuumIcon';

// SpeedDial injecte ses props (open, delay, slotProps…) dans ses enfants.
type VacuumMapActionProps = SpeedDialActionProps & {
  onToggle: () => void;
};

export function VacuumMapAction(props: VacuumMapActionProps) {
  const {onToggle, slotProps, ...actionProps} = props;
  const {configuration, setConfiguration} = useAppContext();
  const active = configuration.vacuumMapShader;

  return (
    <SpeedDialAction
      {...actionProps}
      icon={<RobotVacuumIcon />}
      onClick={() => {
        // Une seule carte à la fois sur le sol.
        setConfiguration(prev => ({
          ...prev,
          vacuumMapShader: !prev.vacuumMapShader,
          heatmapShader: false,
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
        tooltip: {title: 'Aspirateur', open: true, placement: 'right'},
      }}
    />
  );
}
