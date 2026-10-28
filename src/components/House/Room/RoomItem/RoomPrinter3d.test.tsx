import {useHass} from '@hakit/core';
import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it} from 'vitest';
import {HassConnect} from '../../../../mock/HassConnectMock';
import {entities} from '../../../../mock/mocks/mockEntities';
import {RoomPrinter3d} from './RoomPrinter3d';

// Le mock de la démo, dont les boutons modifient l'état simulé : chaque test
// part de l'impression en cours, à 42 %.
async function openPrinterModal() {
  render(
    <HassConnect hassUrl="">
      <RoomPrinter3d
        id="printer"
        printer3dConfig={{
          type: 'printer3d',
          prefix: 'p1s_demo',
          position: {x: 0, y: 0, z: 0},
        }}
        variant="label"
      />
    </HassConnect>,
  );
  fireEvent.click(await screen.findByRole('button', {name: 'Imprimante 3D'}));
  // Le contenu n'apparaît qu'à la fin de l'animation d'ouverture.
  await screen.findByText('En cours');
}

const button = (name: string) => screen.getByRole('button', {name});

describe('RoomPrinter3d', () => {
  beforeEach(() => useHass.setState({entities}));

  it('pilote la lumière de la chambre et la vitesse', async () => {
    await openPrinterModal();
    const light = button('Lumière de la chambre');

    expect(light).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(light);
    expect(light).toHaveAttribute('aria-pressed', 'false');

    expect(button('Sport')).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button('Sport'));
    expect(button('Sport')).toHaveAttribute('aria-pressed', 'true');
  });

  it('met l’impression en pause puis la reprend', async () => {
    await openPrinterModal();

    fireEvent.click(button('Pause'));
    expect(screen.getByText('En pause')).toBeInTheDocument();

    fireEvent.click(button('Reprendre'));
    expect(screen.getByText('En cours')).toBeInTheDocument();
  });

  it('arrête l’impression après confirmation', async () => {
    await openPrinterModal();

    fireEvent.click(button('Arrêter'));
    expect(button("Confirmer l'arrêt")).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Pause'})).toBeNull();
    fireEvent.click(button('Annuler'));
    expect(button('Pause')).toBeInTheDocument();
    expect(screen.getByText('En cours')).toBeInTheDocument();

    fireEvent.click(button('Arrêter'));
    fireEvent.click(button("Confirmer l'arrêt"));
    expect(screen.getByText('Interrompue')).toBeInTheDocument();
    expect(button('Imprimante 3D')).not.toHaveTextContent('%');
  });
});
