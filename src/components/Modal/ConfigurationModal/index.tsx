import {Modal, ModalProps} from '..';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useAppContext} from '../../../contexts/AppContext';
import {useHouseContext} from '../../../contexts/HouseContext';
import {useIsMobile} from '../../../hooks/useIsMobile';
import {houseLabelCategories} from '../../../utils/labelCategories';
import {BenchmarkRow} from './BenchmarkRow';
import {CategoryRow} from './CategoryRow';
import {InfoRow} from './InfoRow';
import {OptionRow} from './OptionRow';
import {ScreensaverRow} from './ScreensaverRow';

type ConfigurationModalProps = Omit<ModalProps, 'children'>;

export function ConfigurationModal(props: ConfigurationModalProps) {
  const {
    configuration,
    webGLSupported,
    webGPUSupported,
    rendererInfo,
    setLightingTrial,
  } = useAppContext();
  const {houseConfig} = useHouseContext();
  const mobile = useIsMobile();
  const house = houseConfig?.house;
  const is3d = webGLSupported && !!house?.model;

  return (
    <Modal {...props}>
      <Stack direction={{xs: 'column', sm: 'row'}} spacing={3}>
        <Stack spacing={1} sx={{width: {xs: '100%', sm: 300}}}>
          <Typography variant="subtitle2" color="textSecondary">
            Affichage
          </Typography>
          <BenchmarkRow />
          <Button
            variant="outlined"
            disabled={!is3d}
            onClick={() => {
              setLightingTrial(true);
              props.onClose();
            }}
          >
            Essayer l'éclairage selon l'heure
          </Button>
          <OptionRow
            label="Murs transparents"
            option="hideWallsShader"
            disabled={!is3d}
          />
          <OptionRow label="Ombres" option="shadows" disabled={!is3d} />
          <OptionRow
            label="WebGPU"
            option="webGPU"
            disabled={!is3d || !webGPUSupported}
          />
          <OptionRow label="Debug" option="debug" disabled={!is3d} />
          {!mobile && <ScreensaverRow />}
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
        <Stack spacing={1} sx={{width: {xs: '100%', sm: 300}}}>
          <Typography variant="subtitle2" color="textSecondary">
            Étiquettes
          </Typography>
          <OptionRow
            label="Batteries uniquement"
            option="batteriesOnly"
            disabled={!is3d}
          />
          <Divider />
          {houseLabelCategories(house?.rooms ?? []).map(category => (
            <CategoryRow
              key={category.id}
              category={category}
              disabled={!is3d || configuration.batteriesOnly}
            />
          ))}
        </Stack>
      </Stack>
    </Modal>
  );
}
