import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import type {EnergyShortcutConfigType} from '../../../configs/sidebar';
import {EnergyLoad} from './EnergyLoad';

vi.mock('@hakit/core', () => ({
  useEntity: (entityId: string) =>
    ({
      'sensor.puissance': {
        state: '1500',
        attributes: {unit_of_measurement: 'VA'},
      },
      'sensor.isousc': {state: '30', attributes: {unit_of_measurement: 'A'}},
    })[entityId] ?? null,
}));

const config: EnergyShortcutConfigType = {
  type: 'energy',
  powerEntityId: 'sensor.puissance',
  tariffPeriodEntityId: 'sensor.ptec',
  peakIndexEntityId: 'sensor.index_hp',
  offPeakIndexEntityId: 'sensor.index_hc',
  prices: {peak: 0.25, offPeak: 0.2},
};

describe('EnergyLoad', () => {
  it('affiche la charge si l’intensité souscrite est configurée', () => {
    render(
      <EnergyLoad
        shortcutConfig={{...config, subscribedCurrentEntityId: 'sensor.isousc'}}
      />,
    );

    expect(screen.getByText('1,5 kVA sur 6 kVA')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', {name: 'Charge'})).toHaveAttribute(
      'aria-valuenow',
      '25',
    );
  });

  it('n’affiche que la puissance sans intensité souscrite', () => {
    render(<EnergyLoad shortcutConfig={config} />);

    expect(screen.getByText('1,5 kVA')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
