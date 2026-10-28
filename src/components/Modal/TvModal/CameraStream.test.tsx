import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {CameraStream} from './CameraStream';

vi.mock('@hakit/core', async importOriginal => ({
  ...(await importOriginal()),
  useEntity: () => ({
    attributes: {entity_picture: '/api/camera_proxy/camera.tv?token=abc'},
  }),
  useHass: (selector: (state: object) => unknown) =>
    selector({helpers: {joinHassUrl: (path: string) => `https://ha${path}`}}),
}));

describe('CameraStream', () => {
  it('affiche le flux MJPEG de la caméra', () => {
    render(<CameraStream cameraEntityId="camera.tv" alt="Image de la TV" />);

    expect(screen.getByRole('img', {name: 'Image de la TV'})).toHaveAttribute(
      'src',
      'https://ha/api/camera_proxy_stream/camera.tv?token=abc',
    );
  });

  it('ferme le flux quand l’image disparaît', () => {
    const {unmount} = render(
      <CameraStream cameraEntityId="camera.tv" alt="Image de la TV" />,
    );
    const image = screen.getByRole('img', {name: 'Image de la TV'});

    unmount();

    expect(image).not.toHaveAttribute('src');
  });
});
