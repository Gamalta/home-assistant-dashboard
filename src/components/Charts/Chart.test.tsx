import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Chart} from './Chart';

const series = (data: (number | null)[]) => [
  {id: 'temperature', label: 'Température', data, format: String},
  {
    id: 'humidity',
    label: 'Humidité',
    data,
    variant: 'line' as const,
    format: String,
  },
];

describe('Chart', () => {
  it('affiche la valeur actuelle par-dessus le graphique', () => {
    render(
      <Chart x={[0, 1]} series={series([20, 21])} formatX={String}>
        <span>21 °C</span>
      </Chart>,
    );

    expect(screen.getByText('21 °C')).toBeInTheDocument();
    expect(
      screen.getByRole('img', {name: 'Température, Humidité'}),
    ).toBeInTheDocument();
  });

  it('indique le chargement de l’historique', () => {
    render(<Chart loading x={[]} series={series([])} formatX={String} />);

    expect(screen.getByText('Chargement…')).toBeInTheDocument();
  });

  it('indique l’absence de données', () => {
    render(<Chart x={[0, 1]} series={series([null, null])} formatX={String} />);

    expect(screen.getByText('Aucune donnée')).toBeInTheDocument();
  });
});
