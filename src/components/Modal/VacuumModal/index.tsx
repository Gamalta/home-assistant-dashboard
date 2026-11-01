import {useEntity} from '@hakit/core';
import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {Modal, ModalProps} from '..';
import {
  cleaningModeLabel,
  suctionLevelLabel,
  type VacuumEntityIds,
} from '../../../utils/entity/vacuum';
import {BatteryDisplay} from '../../display/BatteryDisplay';
import {SelectToggle} from '../../display/SelectToggle';
import {Consumables} from './Consumables';
import {VacuumAlerts} from './VacuumAlerts';
import {VacuumControls} from './VacuumControls';
import {VacuumMap} from './VacuumMap';
import {VacuumStatus} from './VacuumStatus';

type VacuumModalProps = Omit<ModalProps, 'children'> & {
  ids: VacuumEntityIds;
};

export function VacuumModal(props: VacuumModalProps) {
  const {ids, ...modalProps} = props;
  const vacuum = useEntity(ids.vacuum, {returnNullIfNotFound: true});
  const [rooms, setRooms] = useState<number[]>([]);

  const battery = vacuum?.attributes.battery;
  const toggleRoom = (room: number) =>
    setRooms(rooms =>
      rooms.includes(room) ? rooms.filter(r => r !== room) : [...rooms, room],
    );

  return (
    <Modal
      {...modalProps}
      action={
        battery !== undefined && (
          <BatteryDisplay
            type="text"
            batteryLevel={battery}
            batteryState={
              vacuum?.attributes.charging ? 'Charging' : 'Not Charging'
            }
          />
        )
      }
    >
      <Stack
        direction={{xs: 'column', sm: 'row'}}
        spacing={3}
        sx={{mt: -2, alignItems: {xs: 'center', sm: 'normal'}}}
      >
        <Stack
          spacing={2}
          sx={{alignItems: 'center', width: {xs: '100%', sm: 380}}}
        >
          <VacuumMap ids={ids} selected={rooms} onToggle={toggleRoom} />
          <Consumables entityId={ids.vacuum} />
        </Stack>
        <Stack spacing={2} sx={{width: {xs: '100%', sm: 300}}}>
          <VacuumAlerts ids={ids} />
          <VacuumStatus ids={ids} />
          <SelectToggle
            entityId={ids.cleaningMode}
            label="Mode"
            optionLabel={cleaningModeLabel}
          />
          <SelectToggle
            entityId={ids.suctionLevel}
            label="Aspiration"
            optionLabel={suctionLevelLabel}
          />
          <VacuumControls
            ids={ids}
            rooms={rooms}
            onClean={() => setRooms([])}
          />
        </Stack>
      </Stack>
    </Modal>
  );
}
