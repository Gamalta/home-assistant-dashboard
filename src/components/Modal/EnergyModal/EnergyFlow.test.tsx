import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import type {EnergyConfigType} from '../../../configs/sidebar';
import {EnergyFlow} from './EnergyFlow';

vi.mock('@hakit/core', () => ({
  useEntity: (entityId: string) =>
    ({
      'sensor.puissance': {
        state: '1500',
        attributes: {unit_of_measurement: 'VA'},
      },
      'sensor.ptec': {state: 'HP..', attributes: {}},
      'sensor.isousc': {state: '30', attributes: {unit_of_measurement: 'A'}},
    })[entityId] ?? null,
}));

const config: EnergyConfigType = {
  powerEntityId: 'sensor.puissance',
  tariffPeriodEntityId: 'sensor.ptec',
  peakIndexEntityId: 'sensor.index_hp',
  offPeakIndexEntityId: 'sensor.index_hc',
  prices: {peak: 0.25, offPeak: 0.2},
};

describe('EnergyFlow', () => {
  it('fait passer le courant par le fil de la période en cours, avec son prix', () => {
    render(<EnergyFlow energyConfig={config} />);

    const current = screen.getByText('HP').closest('[aria-current]');
    expect(current).toHaveAttribute('aria-current', 'true');
    expect(current).toHaveTextContent(/^HP 0,25\s€\/kWh$/);
    expect(screen.getByText('HC').closest('[aria-current]')).toHaveAttribute(
      'aria-current',
      'false',
    );
    expect(screen.getByText(/^≈ 0,38\s€\/h$/)).toBeInTheDocument();
  });

  it('affiche la charge si l’intensité souscrite est configurée', () => {
    render(
      <EnergyFlow
        energyConfig={{...config, subscribedCurrentEntityId: 'sensor.isousc'}}
      />,
    );

    expect(screen.getByText('1,5 kVA')).toBeInTheDocument();
    expect(screen.getByText('sur 6 kVA')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', {name: 'Charge'})).toHaveAttribute(
      'aria-valuenow',
      '25',
    );
  });

  it('n’affiche que la puissance sans intensité souscrite', () => {
    render(<EnergyFlow energyConfig={config} />);

    expect(screen.getByText('1,5 kVA')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
