import {useEntity} from '@hakit/core';
import type {SmokeConfigType} from '../configs/house';
import {smokeStatus} from '../utils/entity/smoke';

const options = {returnNullIfNotFound: true} as const;

export function useSmokeDetector(config: SmokeConfigType) {
  const smoke = useEntity(config.smokeEntityId, options);
  const heat = useEntity(config.heatEntityId ?? 'unknown', options);
  const battery = useEntity(config.batteryEntityId ?? 'unknown', options);
  const batteryLow = useEntity(config.batteryLowEntityId ?? 'unknown', options);
  const tamper = useEntity(config.tamperEntityId ?? 'unknown', options);

  const status = smokeStatus({
    smoke: smoke?.state,
    heat: heat?.state,
    battery: battery?.state,
    batteryLow: batteryLow?.state,
    tamper: tamper?.state,
  });
  return {status, smoke, heat, battery, batteryLow, tamper};
}
