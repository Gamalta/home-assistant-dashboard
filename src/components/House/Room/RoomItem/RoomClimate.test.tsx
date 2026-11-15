import {useHass} from '@hakit/core';
import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it} from 'vitest';
import {HassConnect} from '../../../../mock/HassConnectMock';
import {entities} from '../../../../mock/mocks/mockEntities';
import {RoomClimate} from './RoomClimate';

// Le mock chauffe la cuisine à 25 °C ; il y fait 20 °C.
const renderClimate = () =>
  render(
    <HassConnect hassUrl="">
      <RoomClimate
        id="climate"
        climateConfig={{
          type: 'climate',
          climateEntityId: 'climate.kitchen',
          position: {x: 0, y: 0, z: 0},
        }}
        variant="label"
      />
    </HassConnect>,
  );

describe('RoomClimate', () => {
  beforeEach(() => useHass.setState({entities}));

  it('affiche la température mesurée et la consigne en indice', async () => {
    renderClimate();
    const label = await screen.findByRole('button', {
      name: '20°, consigne 25°',
    });
    expect(label.querySelector('sub')).toHaveTextContent('/25°');
  });

  it('n’affiche pas de consigne quand la climatisation est arrêtée', async () => {
    useHass.setState({
      entities: {
        ...entities,
        'climate.kitchen': {...entities['climate.kitchen'], state: 'off'},
      },
    });
    renderClimate();
    expect(await screen.findByRole('button', {name: '20°'})).toBeVisible();
  });
});
