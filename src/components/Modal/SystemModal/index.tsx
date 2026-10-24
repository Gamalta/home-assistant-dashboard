import {Modal, ModalProps} from '..';
import Stack from '@mui/material/Stack';
import {SystemInfoDisplay} from './SystemInfoDisplay';
import {LightingStyleRow} from './LightingStyleRow';
import {OptionRow} from './OptionRow';
import {BenchmarkRow} from './BenchmarkRow';
import {InfoRow} from './InfoRow';
import {SideBarConfigType} from '../../../configs/sidebar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import {useAppContext} from '../../../contexts/AppContext';
import {useHouseContext} from '../../../contexts/HouseContext';
import {SystemGraphDisplay} from './SystemGraphDisplay';
import {UpdatesInfo} from './UpdatesInfo';
import {BackupInfo} from './BackupInfo';
import {TabletInfo} from './TabletInfo';
import {ScreensaverRow} from './ScreensaverRow';

type SystemModalProps = Omit<ModalProps, 'children'> & {
  systemConfig: SideBarConfigType['system'];
};

export function SystemModal(props: SystemModalProps) {
  const {systemConfig, ...modalProps} = props;
  const {configuration, webGLSupported, webGPUSupported, rendererInfo} =
    useAppContext();
  const {houseConfig} = useHouseContext();
  const house = houseConfig?.house;
  const is3d = webGLSupported && !!house?.model;

  return (
    <Modal {...modalProps}>
      <Stack direction="row" spacing={3}>
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
            <Typography variant="subtitle2" color="textSecondary">
              Affichage
            </Typography>
            <BenchmarkRow />
            <LightingStyleRow disabled={!is3d} />
            <OptionRow
              label="Murs transparents"
              option="hideWallsShader"
              disabled={!is3d}
            />
            <OptionRow label="Ombres" option="shadows" disabled={!is3d} />
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
            <ScreensaverRow />
            {is3d && configuration.debug && (
              <>
                <InfoRow label="GPU" value={rendererInfo.gpu ?? '—'} />
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
              </>
            )}
          </Stack>
        </Stack>
        <Stack spacing={1} sx={{width: 300}}>
          <SystemInfoDisplay
            label="Internet"
            sensor={systemConfig?.internetEntityId}
            formatEntity={entity =>
              entity.state === 'on' ? 'Connecté' : 'Coupé'
            }
            isWarning={entity => entity.state !== 'on'}
          />
          <UpdatesInfo />
          <BackupInfo systemConfig={systemConfig} />
          <TabletInfo systemConfig={systemConfig} />
        </Stack>
      </Stack>
    </Modal>
  );
}
