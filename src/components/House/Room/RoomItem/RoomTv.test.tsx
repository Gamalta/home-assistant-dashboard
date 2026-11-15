import {useHass} from '@hakit/core';
import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {HassConnect} from '../../../../mock/HassConnectMock';
import {entities} from '../../../../mock/mocks/mockEntities';
import {RoomTv} from './RoomTv';

// L'ambilight de la démo est éteint, en capture vidéo.
async function openTvModal() {
  render(
    <HassConnect hassUrl="">
      <RoomTv
        id="tv"
        tvConfig={{
          type: 'tv',
          lightEntityId: 'light.tv_ambilight',
          ledLayout: {top: 16, right: 9, bottom: 16, left: 9},
          position: {x: 0, y: 0, z: 0},
        }}
        variant="label"
      />
    </HassConnect>,
  );
  const tv = await screen.findByRole('button', {name: 'TV'});
  fireEvent.mouseDown(tv);
  // Le contenu n'apparaît qu'à la fin de l'animation d'ouverture.
  await screen.findByRole('switch', {name: 'Ambilight'});
  fireEvent.mouseUp(tv);
}

const button = (name: string) => screen.getByRole('button', {name});
const image = () => screen.queryByRole('img', {name: 'Image de la TV'});

describe('RoomTv', () => {
  beforeEach(() => useHass.setState({entities}));

  it('en couleur fixe, montre la couleur en cours sans le flux de l’image', async () => {
    // jsdom ne dessine pas : le halo n'est vérifié qu'en E2E.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    await openTvModal();
    expect(image()).toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch', {name: 'Ambilight'}));
    fireEvent.click(button('Couleur'));
    fireEvent.click(button('Rouge'));

    expect(button('Rouge')).toHaveAttribute('aria-pressed', 'true');
    expect(button('Bleu')).toHaveAttribute('aria-pressed', 'false');
    expect(image()).not.toBeInTheDocument();

    fireEvent.click(button('Vidéo'));
    expect(image()).toBeInTheDocument();
  });
});
