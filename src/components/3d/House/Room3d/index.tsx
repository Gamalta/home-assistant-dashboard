import type * as THREE from 'three';
import {Room} from '../../../House/Room';
import {RoomProvider} from '../../../../contexts/RoomContext';
import {HouseConfigType} from '../../../../configs/house';
import {RoomItem3d} from './RoomItem3d';
import {useAppContext} from '../../../../contexts/AppContext';
import {isLabelShown} from '../../../../utils/labelCategories';

type RoomProps = {
  room: HouseConfigType['rooms'][0];
  model: THREE.Object3D;
};

const heatmapDisplay = ['climate', 'temperature'];

export function Room3d(props: RoomProps) {
  const {room, model} = props;
  const {configuration} = useAppContext();

  const cleanedRoom = {
    ...room,
    items: (room.items ?? []).filter(
      item =>
        !configuration.heatmapShader || heatmapDisplay.includes(item.type),
    ),
  };
  // Le filtre ne retire que les étiquettes : les lumières 3D restent pilotées.
  const labelledRoom = {
    ...cleanedRoom,
    items: cleanedRoom.items.filter(item =>
      isLabelShown(item.type, configuration.hiddenCategories),
    ),
  };

  return (
    <RoomProvider>
      <Room room={labelledRoom} />
      {cleanedRoom.items.map((item, id) => (
        <RoomItem3d key={`item-3d-${id}`} itemConfig={item} model={model} />
      ))}
    </RoomProvider>
  );
}
