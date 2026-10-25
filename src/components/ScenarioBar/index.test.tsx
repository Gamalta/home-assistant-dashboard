import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {ScenarioBar} from '.';

vi.mock('../../contexts/HouseContext', () => ({
  useHouseContext: () => ({
    houseConfig: {sideBar: {scenarios: ['script.depart']}},
  }),
}));

vi.mock('@hakit/core', async importOriginal => ({
  ...(await importOriginal()),
  useEntity: () => ({
    attributes: {friendly_name: 'Départ', icon: 'mdi:exit-run'},
    service: {turnOn: vi.fn()},
  }),
}));

describe('ScenarioBar', () => {
  it('garde le menu ouvert quand la souris quitte le bouton après un appui', () => {
    render(<ScenarioBar />);
    const dial = screen.getByRole('button', {name: 'Scénarios'});

    fireEvent.click(dial);
    fireEvent.mouseLeave(dial);

    expect(dial).toHaveAttribute('aria-expanded', 'true');
  });
});
