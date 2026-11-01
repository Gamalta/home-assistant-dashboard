import {render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {TrainsModal} from '.';
import type {TrainDeparture} from '../../../utils/trains';

const at = (hours: number, minutes: number) =>
  new Date(2026, 9, 24, hours, minutes);

const departures: TrainDeparture[] = [
  {
    entityId: 'sensor.sncf_a_b_train_1',
    scheduled: at(7, 42),
    expected: at(7, 47),
    delay: 5,
    arrival: at(8, 22),
    train: 'TER 87654',
    platform: 'B',
    cancelled: false,
  },
  {
    entityId: 'sensor.sncf_a_b_train_2',
    scheduled: at(8, 12),
    expected: at(8, 12),
    delay: 0,
    cancelled: true,
  },
];

describe('TrainsModal', () => {
  it('liste les départs avec l’heure réelle, le retard, la voie et l’arrivée', async () => {
    render(
      <TrainsModal
        open
        onClose={() => {}}
        title="Vers le travail"
        departures={departures}
      />,
    );

    const [late, cancelled] = await screen.findAllByRole('listitem');
    expect(late).toHaveTextContent('07:47');
    expect(within(late).getByText('07:42').tagName).toBe('S');
    expect(late).toHaveTextContent('+5 min');
    expect(late).toHaveTextContent('Voie B');
    expect(late).toHaveTextContent('TER 87654 · arrivée 08:22');
    expect(cancelled).toHaveTextContent('08:12supprimé');
  });

  it('indique l’absence de départ', async () => {
    render(<TrainsModal open onClose={() => {}} departures={[]} />);

    expect(await screen.findByText('Aucun départ prévu.')).toBeInTheDocument();
  });
});
