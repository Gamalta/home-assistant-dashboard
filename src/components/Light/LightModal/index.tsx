import {
  HassEntityWithService,
  lightSupportsColor,
  useLightColor,
} from '@hakit/core';
import {ColorPicker} from './ColorPicker';

type LightModalProps = {
  entity: HassEntityWithService<'light'>;
};

export function LightModal(props: LightModalProps) {
  const {entity} = props;
  const {attributes} = entity;
  const lightColors = useLightColor(entity);
  const supportsColor = lightSupportsColor(entity);

  return (
    <ColorPicker
      defaultColor={attributes.rgb_color ?? [0, 0, 0]}
      minKelvin={attributes.min_color_temp_kelvin}
      maxKelvin={attributes.max_color_temp_kelvin}
      lightColors={lightColors}
    />
  );
}
