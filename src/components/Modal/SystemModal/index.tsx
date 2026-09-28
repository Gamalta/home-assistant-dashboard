import {Modal, ModalProps} from '..';
import Stack from '@mui/material/Stack';
import {SystemInfoDisplay} from './SystemInfoDisplay';
import {SystemGraphDisplay} from './SystemGraphDisplay';
import {SideBarConfigType} from '../../../configs/sidebar';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import {useState} from 'react';
import {
  ConfigurationOptions,
  useAppContext,
} from '../../../contexts/AppContext';
import {useHouseContext} from '../../../contexts/HouseContext';

type SystemModalProps = Omit<ModalProps, 'children'> & {
  systemConfig: SideBarConfigType['system'];
};

type OptionRowProps = {
  label: string;
  option: keyof ConfigurationOptions;
  disabled?: boolean;
};

function OptionRow(props: OptionRowProps) {
  const {label, option, disabled} = props;
  const {configuration, setConfiguration} = useAppContext();

  return (
    <Stack
      direction="row"
      sx={{justifyContent: 'space-between', alignItems: 'center'}}
    >
      <Typography color={disabled ? 'text.disabled' : undefined}>
        {label}
      </Typography>
      <Switch
        checked={configuration[option]}
        disabled={disabled}
        onChange={event =>
          setConfiguration(prev => ({...prev, [option]: event.target.checked}))
        }
      />
    </Stack>
  );
}

/** Lance le banc de mesure intégré à la vue 3D (voir components/3d/Benchmark). */
function BenchmarkRow() {
  const [result, setResult] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    const benchmark = window.__dashboardBenchmark;
    if (!benchmark) return;
    setRunning(true);
    const rest = await benchmark(60);
    const motion = await benchmark(60, Math.min(1, window.devicePixelRatio));
    setResult(
      `repos ${rest.msPerFrame} ms (${rest.fps} img/s, ×${rest.pixelRatio}) · ` +
        `mouvement ${motion.msPerFrame} ms (${motion.fps} img/s, ×${motion.pixelRatio})`,
    );
    setRunning(false);
  };

  return (
    <Stack spacing={0.5}>
      <Button variant="outlined" disabled={running} onClick={run}>
        {running ? 'Mesure en cours…' : 'Mesurer les performances'}
      </Button>
      {result && <Typography variant="caption">{result}</Typography>}
    </Stack>
  );
}

function InfoRow(props: {label: string; value: string | number}) {
  return (
    <Stack
      direction="row"
      sx={{justifyContent: 'space-between', alignItems: 'center'}}
    >
      <Typography>{props.label}</Typography>
      <Typography>{props.value}</Typography>
    </Stack>
  );
}

export function SystemModal(props: SystemModalProps) {
  const {systemConfig, ...modalProps} = props;
  const {configuration, webGLSupported, webGPUSupported, rendererInfo} =
    useAppContext();
  const {houseConfig} = useHouseContext();
  const house = houseConfig?.house;
  const can3d = webGLSupported && !!house?.model;
  const can2d = !!house?.floorPlan;
  const is3d = can3d && (configuration.view3d || !can2d);

  return (
    <Modal {...modalProps}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          {(systemConfig?.graphs ?? []).map(graph => (
            <SystemGraphDisplay key={graph.label} graphConfig={graph} />
          ))}
        </Stack>
        <Stack spacing={1}>
          <SystemInfoDisplay
            label="Lancé depuis:"
            sensor={systemConfig?.uptimeEntityId}
            formatEntity={entity => entity.custom.relativeTime}
          />
          <SystemInfoDisplay
            label="Alimentation:"
            sensor={systemConfig?.powerStatusEntityId}
            formatEntity={entity =>
              entity.state === 'off' ? 'Suffisant' : 'Insuffisante'
            }
          />
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">
            Affichage
          </Typography>
          <OptionRow
            label="Vue 3D"
            option="view3d"
            disabled={!can3d || !can2d}
          />
          <OptionRow
            label="Murs transparents"
            option="hideWallsShader"
            disabled={!is3d}
          />
          <OptionRow
            label="Carte des températures"
            option="heatmapShader"
            disabled={!is3d}
          />
          <OptionRow
            label="WebGPU"
            option="webGPU"
            disabled={!is3d || !webGPUSupported}
          />
          <OptionRow label="Debug" option="debug" disabled={!is3d} />
          {is3d && configuration.debug && (
            <>
              <InfoRow
                label="Textures max"
                value={rendererInfo.maxTextures ?? '—'}
              />
              <InfoRow
                label="Triangles"
                value={
                  rendererInfo.triangles < 0
                    ? '—'
                    : rendererInfo.triangles.toLocaleString('fr-FR')
                }
              />
              <BenchmarkRow />
            </>
          )}
        </Stack>
      </Stack>
    </Modal>
  );
}
