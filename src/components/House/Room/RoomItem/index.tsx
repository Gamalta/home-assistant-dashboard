import {RoomItemConfigType} from '../../../../configs/house';
import {RoomBattery} from './RoomBattery';
import {RoomClimate} from './RoomClimate';
import {RoomDesktop} from './RoomDesktop';
import {RoomLight} from './RoomLight';
import {RoomOutlet} from './RoomOutlet';
import {RoomPrinter3d} from './RoomPrinter3d';
import {RoomShutter} from './RoomShutter';
import {RoomSmoke} from './RoomSmoke';
import {RoomTemperature} from './RoomTemperature';

type RoomItemProps = {
  id: string;
  itemConfig: RoomItemConfigType;
  // Étiquette de la scène 3D, ou tuile de la version mobile.
  variant?: ItemVariant;
};

export type ItemVariant = 'label' | 'tile';

export function RoomItem(props: RoomItemProps) {
  const {id, itemConfig, variant = 'label'} = props;

  switch (itemConfig.type) {
    case 'light':
      return <RoomLight id={id} lightConfig={itemConfig} variant={variant} />;
    case 'climate':
      return (
        <RoomClimate id={id} climateConfig={itemConfig} variant={variant} />
      );
    case 'temperature':
      return (
        <RoomTemperature id={id} tempConfig={itemConfig} variant={variant} />
      );
    case 'shutter':
      return (
        <RoomShutter id={id} shutterConfig={itemConfig} variant={variant} />
      );
    case 'desktop':
      return (
        <RoomDesktop id={id} desktopConfig={itemConfig} variant={variant} />
      );
    case 'outlet':
      return <RoomOutlet id={id} outletConfig={itemConfig} variant={variant} />;
    case 'printer3d':
      return <RoomPrinter3d id={id} printer3dConfig={itemConfig} variant={variant} />;
    case 'battery':
      return <RoomBattery id={id} batteryConfig={itemConfig} variant={variant} />;
    case 'smoke':
      return <RoomSmoke id={id} smokeConfig={itemConfig} variant={variant} />;
    default:
      return <></>;
  }
}
