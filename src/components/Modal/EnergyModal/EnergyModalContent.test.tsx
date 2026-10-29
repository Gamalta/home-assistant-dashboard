import {createTheme} from '@mui/material/styles';
import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {EnergyConfigType} from '../../../configs/sidebar';
import {getBuckets} from '../../../utils/energy';
import {EnergyModalContent} from './EnergyModalContent';

type StatisticsMessage = {
  statistic_ids: string[];
  start_time: string;
  end_time: string;
  period: 'day' | 'month';
};

// Sans ThemeProvider, MUI prend son thème par défaut.
const {palette} = createTheme();

const {connection} = vi.hoisted(() => ({
  connection: {sendMessagePromise: vi.fn()},
}));

// Index indisponibles : le jour en cours reste vide, seuls comptent les jours passés.
vi.mock('@hakit/core', () => ({
  useEntity: () => null,
  useHass: (selector: (store: {connection: unknown}) => unknown) =>
    selector({connection}),
}));

const config: EnergyConfigType = {
  powerEntityId: 'sensor.puissance',
  tariffPeriodEntityId: 'sensor.ptec',
  peakIndexEntityId: 'sensor.index_hp',
  offPeakIndexEntityId: 'sensor.index_hc',
  prices: {peak: 0.25, offPeak: 0.2},
};

// Par jour : 6 kWh en heures pleines et 4 en heures creuses en octobre, 5 et 3 les autres mois.
async function statistics(message: StatisticsMessage) {
  const {statistic_ids, start_time, end_time, period} = message;
  const buckets = getBuckets(
    {start: Date.parse(start_time), end: Date.parse(end_time)},
    period,
  ).filter(bucket => bucket.end <= Date.now());
  return Object.fromEntries(
    statistic_ids.map(id => [
      id,
      buckets.map(({start}) => {
        const october = new Date(start).getMonth() === 9;
        const peak = id === 'sensor.index_hp';
        return {start, change: october ? (peak ? 6 : 4) : peak ? 5 : 3};
      }),
    ]),
  );
}

const requests = () =>
  connection.sendMessagePromise.mock.calls.map(([message]) => {
    const {start_time, end_time, period} = message as StatisticsMessage;
    return {start: new Date(start_time), end: new Date(end_time), period};
  });

describe('EnergyModalContent', () => {
  beforeEach(() => {
    vi.useFakeTimers({toFake: ['Date']});
    vi.setSystemTime(new Date('2026-11-10T15:00'));
    connection.sendMessagePromise.mockImplementation(statistics);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('charge le mois en cours et le mois précédent jour par jour, puis l’année mois par mois', async () => {
    render(<EnergyModalContent energyConfig={config} />);
    await screen.findByText(/par rapport à octobre 2026/);

    // La veille du mois en cours donne l'index de départ du jour.
    expect(requests()).toEqual([
      {
        start: new Date('2026-10-31T00:00'),
        end: new Date('2026-12-01T00:00'),
        period: 'day',
      },
      {
        start: new Date('2026-10-01T00:00'),
        end: new Date('2026-11-01T00:00'),
        period: 'day',
      },
    ]);
    expect(connection.sendMessagePromise).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'recorder/statistics_during_period',
        statistic_ids: ['sensor.index_hp', 'sensor.index_hc'],
        types: ['change', 'state'],
        units: {energy: 'kWh'},
      }),
    );

    connection.sendMessagePromise.mockClear();
    fireEvent.click(screen.getByRole('button', {name: 'Année'}));
    await screen.findByText(/par rapport à 2025/);
    expect(requests()).toEqual([
      {
        start: new Date('2025-12-01T00:00'),
        end: new Date('2027-01-01T00:00'),
        period: 'month',
      },
      {
        start: new Date('2025-01-01T00:00'),
        end: new Date('2026-01-01T00:00'),
        period: 'month',
      },
    ]);
    expect(screen.getByRole('button', {name: 'Un an avant'})).toBeDisabled();
  });

  it('affiche le total, le coût et l’écart d’un mois écoulé avec le précédent', async () => {
    render(<EnergyModalContent energyConfig={config} />);
    fireEvent.click(screen.getByRole('button', {name: 'Période précédente'}));

    expect(await screen.findByText('310 kWh')).toBeInTheDocument();
    expect(screen.getByText(/^71,30\s€$/)).toBeInTheDocument();
    // Dans la couleur principale : on consomme plus.
    expect(
      screen.getByText(/^\+29\s% par rapport à septembre 2026$/).parentElement,
    ).toHaveStyle({color: palette.primary.main});
    const totals = screen.getByRole('region', {name: 'Totaux'});
    expect(totals).toHaveTextContent(/Mois précédent240 kWh55,50\s€/);
    // Le prix du kWh retenu pour chaque période tarifaire.
    expect(totals).toHaveTextContent(
      /Heures pleines0,25\s€\/kWh186 kWh46,50\s€/,
    );
    expect(totals).toHaveTextContent(
      /Heures creuses0,20\s€\/kWh124 kWh24,80\s€/,
    );
  });

  it('compare le mois en cours au même mois un an avant, à date égale', async () => {
    render(<EnergyModalContent energyConfig={config} />);
    await screen.findByText(/par rapport à octobre 2026/);
    const calls = connection.sendMessagePromise.mock.calls.length;

    fireEvent.click(screen.getByRole('button', {name: 'Un an avant'}));

    // 72 kWh du 1er au 9 novembre, contre 77 kWh jusqu'au 10 novembre 2025 à 15 h.
    // En vert : on consomme moins.
    expect(
      (
        await screen.findByText(
          /^−6\s% par rapport à novembre 2025, à date égale$/,
        )
      ).parentElement,
    ).toHaveStyle({color: palette.success.main});
    // Seule la période comparée est rechargée.
    expect(connection.sendMessagePromise).toHaveBeenCalledTimes(calls + 1);
    expect(requests().pop()?.start).toEqual(new Date('2025-11-01T00:00'));
  });

  it('recule et avance d’une période, sans dépasser la période en cours', async () => {
    render(<EnergyModalContent energyConfig={config} />);
    const previous = screen.getByRole('button', {name: 'Période précédente'});
    const next = screen.getByRole('button', {name: 'Période suivante'});
    expect(screen.getByText('novembre 2026')).toBeInTheDocument();
    expect(next).toBeDisabled();

    fireEvent.click(previous);
    fireEvent.click(previous);
    expect(screen.getByText('septembre 2026')).toBeInTheDocument();
    expect(next).toBeEnabled();

    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByText('novembre 2026')).toBeInTheDocument();
    expect(next).toBeDisabled();
    await screen.findByText(/par rapport à octobre 2026/);
  });

  it('affiche des tirets sans statistiques', async () => {
    connection.sendMessagePromise.mockResolvedValue({});
    render(<EnergyModalContent energyConfig={config} />);

    expect(await screen.findAllByText('—')).not.toHaveLength(0);
    expect(screen.queryByText(/par rapport à/)).not.toBeInTheDocument();
  });
});
