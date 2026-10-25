import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {QuickMenu} from '.';

vi.mock('../../contexts/HouseContext', () => ({
  useHouseContext: () => ({
    houseConfig: {sideBar: {scenarios: ['script.leave_home']}},
  }),
}));

vi.mock('@hakit/core', async importOriginal => ({
  ...(await importOriginal()),
  useEntity: () => ({
    attributes: {friendly_name: 'Départ', icon: 'mdi:exit-run'},
    service: {turnOn: vi.fn()},
  }),
}));

describe('QuickMenu', () => {
  it('garde le menu ouvert quand la souris quitte le bouton après un appui', () => {
    render(<QuickMenu />);
    const dial = screen.getByRole('button', {name: 'Menu rapide'});

    fireEvent.click(dial);
    fireEvent.mouseLeave(dial);

    expect(dial).toHaveAttribute('aria-expanded', 'true');
  });
});
