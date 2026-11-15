import {fireEvent, render, screen, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {AppProvider} from '../contexts/AppContext';
import {heatmapGradient} from '../rendering/shaders/HeatmapGroundMaterial/common';
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

  it('montre les températures et les couleurs du sol, selon l’échelle choisie', () => {
    render(
      <AppProvider>
        <HeatmapScaleRow disabled={false} />
        <HeatmapLegend />
      </AppProvider>,
    );
    const legend = screen.getByRole('region', {
      name: 'Légende des températures',
    });
    const gradient = screen.getByTestId('heatmap-gradient');
    expect(legend).toHaveTextContent('19 °C');
    expect(legend).toHaveTextContent('21 °C');
    // Échelle « Équilibrée » de 18 à 22 °C : le sol en couvre le milieu.
    expect(gradient).toHaveStyle({
      backgroundImage: heatmapGradient(0.25, 0.75),
    });

    fireEvent.mouseDown(
      screen.getByRole('combobox', {name: 'Échelle des températures'}),
    );
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'Douce (8 °C)',
      }),
    );

    expect(legend).toHaveTextContent('19 °C');
    expect(legend).toHaveTextContent('21 °C');
    // De 16 à 24 °C, le sol se resserre sur le vert et le jaune.
    expect(gradient).toHaveStyle({
      backgroundImage: heatmapGradient(0.375, 0.625),
    });
  });
});
