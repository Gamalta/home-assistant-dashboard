import {render, screen, waitFor, within} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {EnergyShortcutConfigType} from '../../../configs/sidebar';
import {dayStart} from '../../../utils/energy';
import {EnergyModalContent} from './EnergyModalContent';

type State = {state: string; attributes: {unit_of_measurement?: string}};

const {states, connection} = vi.hoisted(() => ({
  states: {} as Record<string, State>,
  connection: {sendMessagePromise: vi.fn()},
}));

vi.mock('@hakit/core', () => ({
  useEntity: (entityId: string) => states[entityId] ?? null,
  useHass: (selector: (store: {connection: unknown}) => unknown) =>
    selector({connection}),
}));
// jsdom ne mesure pas le SVG : le graphe est vérifié en E2E.
vi.mock('./EnergyHistoryChart', () => ({EnergyHistoryChart: () => null}));

const config: EnergyShortcutConfigType = {
  type: 'energy',
  powerEntityId: 'sensor.puissance',
  tariffPeriodEntityId: 'sensor.ptec',
  peakIndexEntityId: 'sensor.index_hp',
  offPeakIndexEntityId: 'sensor.index_hc',
  prices: {peak: 0.25, offPeak: 0.2},
};

const yesterday = (change: number, state: number) => [
  {start: dayStart(new Date(), -1), change, state},
];

describe('EnergyModalContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(states, {
      'sensor.puissance': {
        state: '1500',
        attributes: {unit_of_measurement: 'VA'},
      },
      'sensor.index_hp': {
        state: '1002',
        attributes: {unit_of_measurement: 'kWh'},
      },
      'sensor.index_hc': {
        state: '501000',
        attributes: {unit_of_measurement: 'Wh'},
      },
      'sensor.isousc': {state: '30', attributes: {unit_of_measurement: 'A'}},
    });
    connection.sendMessagePromise.mockResolvedValue({
      'sensor.index_hp': yesterday(4, 1000),
      'sensor.index_hc': yesterday(5, 500),
    });
  });

  it('affiche la consommation et le coût du jour et de la veille', async () => {
    render(<EnergyModalContent shortcutConfig={config} />);

    const today = screen.getByRole('region', {name: 'Aujourd’hui'});
    expect(await within(today).findByText(/^0,70\s€$/)).toBeInTheDocument();
    expect(
      within(today).getByText('Heures pleines : 2 kWh'),
    ).toBeInTheDocument();
    expect(
      within(today).getByText('Heures creuses : 1 kWh'),
    ).toBeInTheDocument();

    const before = screen.getByRole('region', {name: 'Hier'});
    expect(within(before).getByText(/^2,00\s€$/)).toBeInTheDocument();
    expect(
      within(before).getByText('Heures pleines : 4 kWh'),
    ).toBeInTheDocument();

    expect(connection.sendMessagePromise).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'recorder/statistics_during_period',
        statistic_ids: ['sensor.index_hp', 'sensor.index_hc'],
        period: 'day',
        units: {energy: 'kWh'},
      }),
    );
  });

  it('affiche des tirets sans statistiques', async () => {
    connection.sendMessagePromise.mockResolvedValue({});
    render(<EnergyModalContent shortcutConfig={config} />);
    await waitFor(() =>
      expect(connection.sendMessagePromise).toHaveBeenCalled(),
    );

    const today = screen.getByRole('region', {name: 'Aujourd’hui'});
    expect(within(today).getByText('—')).toBeInTheDocument();
    expect(within(today).getByText('Heures pleines : —')).toBeInTheDocument();
  });

  it('affiche la charge si l’intensité souscrite est configurée', async () => {
    const {rerender} = render(<EnergyModalContent shortcutConfig={config} />);
    await screen.findByText(/^0,70\s€$/);
    expect(screen.queryByText(/^Charge/)).not.toBeInTheDocument();

    rerender(
      <EnergyModalContent
        shortcutConfig={{...config, subscribedCurrentEntityId: 'sensor.isousc'}}
      />,
    );
    expect(
      screen.getByText('Charge : 1,5 kVA sur 6 kVA souscrits'),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar', {name: 'Charge'})).toHaveAttribute(
      'aria-valuenow',
      '25',
    );
  });
});
