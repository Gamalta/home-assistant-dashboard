import {useHass} from '@hakit/core';
import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it} from 'vitest';
import {HassConnect} from '../../../../mock/HassConnectMock';
import {entities} from '../../../../mock/mocks/mockEntities';
import {RoomOutlet} from './RoomOutlet';

// Le mock allume « Prise bureau », qui consomme 85,4 W.
const renderOutlet = () =>
  render(
    <HassConnect hassUrl="">
      <RoomOutlet
        id="outlet"
        outletConfig={{
          type: 'outlet',
          switchEntityId: 'switch.desk_outlet',
          powerEntityId: 'sensor.desk_outlet_power',
          position: {x: 0, y: 0, z: 0},
        }}
      />
    </HassConnect>,
  );

// useLongPress ouvre la modale quand le bouton reste enfoncé plus de 300 ms.
async function openOutletModal() {
  renderOutlet();
  const outlet = await screen.findByRole('button', {name: 'Prise bureau'});
  fireEvent.mouseDown(outlet);
  // Le contenu n'apparaît qu'à la fin de l'animation d'ouverture.
  const illustration = await screen.findByRole('button', {name: 'Prise'});
  fireEvent.mouseUp(outlet);
  return illustration;
}

describe('RoomOutlet', () => {
  beforeEach(() => useHass.setState({entities}));

  it('bascule la prise d’un appui court', async () => {
    renderOutlet();
    const outlet = await screen.findByRole('button', {name: 'Prise bureau'});
    expect(outlet).toHaveAttribute('aria-pressed', 'true');

    fireEvent.mouseDown(outlet);
    fireEvent.mouseUp(outlet);
    expect(outlet).toHaveAttribute('aria-pressed', 'false');

    fireEvent.mouseDown(outlet);
    fireEvent.mouseUp(outlet);
    expect(outlet).toHaveAttribute('aria-pressed', 'true');
  });

  it('bascule la prise en touchant l’illustration', async () => {
    const illustration = await openOutletModal();

    fireEvent.click(illustration);
    expect(illustration).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(illustration);
    expect(illustration).toHaveAttribute('aria-pressed', 'true');
  });

  it('affiche la consommation dans un second onglet', async () => {
    await openOutletModal();

    fireEvent.click(screen.getByRole('button', {name: 'Historique'}));
    const chart = await screen.findByRole('img', {name: 'Puissance'});
    expect(chart.querySelectorAll('.MuiLineChart-line')).toHaveLength(1);
    // Espace insécable entre la valeur et l'unité.
    expect(screen.getByRole('heading', {name: /^85\sW$/})).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Réglage'}));
    expect(screen.queryByRole('img', {name: 'Puissance'})).toBeNull();
    expect(screen.getByRole('button', {name: 'Marche'})).toBeInTheDocument();
  });
});
