import {useWeather} from '@hakit/core';
import {Modal, ModalProps} from '../..';
import Stack from '@mui/material/Stack';

type WeatherModalProps = Omit<ModalProps, 'children'> & {
  weather: ReturnType<typeof useWeather>;
  icon: string;
};

export function WeatherModal(props: WeatherModalProps) {
  const {weather, icon, ...modalProps} = props;

  console.log('weather', weather);

  return (
    <Modal {...modalProps}>
      <Stack>
        <img
          src={icon}
          style={{
            height: '100px',
            width: '100px',
            objectFit: 'contain',
          }}
        />
        <Stack>
          <Stack>
            <span>{weather.state}</span>
            <span>{weather.attributes.temperature}°C</span>
          </Stack>
          <span>{weather.attributes.humidity}%</span>
        </Stack>
      </Stack>
    </Modal>
  );
}
