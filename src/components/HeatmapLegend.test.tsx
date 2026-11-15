import {fireEvent, render, screen, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {AppProvider} from '../contexts/AppContext';
import {HeatmapScaleRow} from './Modal/ConfigurationModal/HeatmapScaleRow';
import {HeatmapLegend} from './HeatmapLegend';

const sensor = (id: string, x: number) => ({
  id,
  name: id,
  position: {x, y: 2.5, z: 0},
  items: [
    {
      type: 'temperature',
      roomDisplay: true,
      temperatureEntityId: `sensor.${id}_temperature`,
    },
  ],
});

vi.mock('../contexts/HouseContext', () => ({
  useHouseContext: () => ({
    houseConfig: {house: {rooms: [sensor('bedroom', 0), sensor('kitchen', 4)]}},
  }),
}));

vi.mock('@hakit/core', () => ({
  useEntities: (ids: string[]) =>
    ids.map(entity_id => ({
      entity_id,
      state: entity_id.includes('bedroom') ? '19' : '21',
    })),
}));

describe('HeatmapLegend', () => {
  afterEach(() => localStorage.clear());

  it('suit l’échelle des températures choisie dans la modale Configuration', () => {
    render(
      <AppProvider>
        <HeatmapScaleRow disabled={false} />
        <HeatmapLegend />
      </AppProvider>,
    );
    const legend = screen.getByRole('region', {
      name: 'Légende des températures',
    });
    expect(legend).toHaveTextContent('18 °C');
    expect(legend).toHaveTextContent('22 °C');

    fireEvent.mouseDown(
      screen.getByRole('combobox', {name: 'Échelle des températures'}),
    );
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'Douce (8 °C)',
      }),
    );

    expect(legend).toHaveTextContent('16 °C');
    expect(legend).toHaveTextContent('24 °C');
  });
});
