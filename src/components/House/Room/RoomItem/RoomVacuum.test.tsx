import {useHass} from '@hakit/core';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {HassConnect} from '../../../../mock/HassConnectMock';
import {entities} from '../../../../mock/mocks/mockEntities';
import {vacuumEntityIds} from '../../../../utils/entity/vacuum';
import {RoomVacuum} from './RoomVacuum';

const ids = vacuumEntityIds('dreame_demo');

// Le mock de la démo, dont les services modifient l'état simulé : chaque test
// part du séjour en cours de lavage, à 45 %.
async function openVacuumModal() {
  render(
    <HassConnect hassUrl="">
      <RoomVacuum
        id="vacuum"
        vacuumConfig={{
          type: 'vacuum',
          prefix: 'dreame_demo',
          position: {x: 0, y: 0, z: 0},
        }}
        variant="label"
      />
    </HassConnect>,
  );
  fireEvent.click(await screen.findByRole('button', {name: 'Aspirateur'}));
  // Le contenu n'apparaît qu'à la fin de l'animation d'ouverture.
  const map = await screen.findByRole('img', {name: 'Plan de nettoyage'});
  // jsdom ne charge pas les images : les pièces se placent sur sa taille.
  Object.defineProperties(map, {
    naturalWidth: {value: 640},
    naturalHeight: {value: 548},
  });
  fireEvent.load(map);
}

const button = (name: string) => screen.getByRole('button', {name});

describe('RoomVacuum', () => {
  beforeEach(() => useHass.setState({entities}));
  afterEach(() => vi.useRealTimers());

  it('met le nettoyage en pause puis le reprend', async () => {
    await openVacuumModal();
    expect(button('Aspirateur')).toHaveTextContent('45%');

    fireEvent.click(button('Pause'));
    expect(screen.getByText('En pause')).toBeInTheDocument();

    fireEvent.click(button('Reprendre'));
    expect(screen.getByText('Aspiration et lavage')).toBeInTheDocument();
  });

  it('change le mode et la puissance', async () => {
    await openVacuumModal();

    fireEvent.click(button('Laver'));
    expect(button('Laver')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button('Turbo'));
    expect(button('Turbo')).toHaveAttribute('aria-pressed', 'true');
    expect(button('Standard')).toHaveAttribute('aria-pressed', 'false');
  });

  it('renvoie l’aspirateur à sa station', async () => {
    await openVacuumModal();
    vi.useFakeTimers();

    fireEvent.click(button('Rentrer'));
    expect(screen.getByText('Retour à la station')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Pause'})).toBeNull();

    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('En charge')).toBeInTheDocument();
    expect(button('Tout nettoyer')).toBeInTheDocument();
  });

  it('choisit des pièces sur le plan puis lance leur nettoyage', async () => {
    const vacuum = entities[ids.vacuum];
    useHass.setState({
      entities: {
        ...entities,
        [ids.vacuum]: {
          ...vacuum,
          state: 'docked',
          attributes: {...vacuum.attributes, vacuum_state: 'charging'},
        },
      },
    });
    await openVacuumModal();

    fireEvent.click(button('Cuisine'));
    fireEvent.click(button('Séjour'));
    expect(button('Cuisine')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button('Séjour'));
    expect(button('Séjour')).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button('Couloir'));

    fireEvent.click(button('Nettoyer 2 pièces'));
    expect(screen.getByText('Aspiration et lavage')).toBeInTheDocument();
    expect(
      useHass.getState().entities[ids.map].attributes.active_segments,
    ).toEqual([3, 4]);
    // Pendant le nettoyage, les pièces ne se choisissent plus.
    expect(screen.queryByRole('button', {name: 'Cuisine'})).toBeNull();
  });
});
