import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {QuickMenu} from '.';

const {sideBar} = vi.hoisted(() => ({
  sideBar: {current: {} as {scenarios?: string[]}},
}));

vi.mock('../../contexts/HouseContext', () => ({
  useHouseContext: () => ({houseConfig: {sideBar: sideBar.current}}),
}));

vi.mock('@hakit/core', async importOriginal => ({
  ...(await importOriginal()),
  useEntity: () => ({
    attributes: {friendly_name: 'Départ', icon: 'mdi:exit-run'},
    service: {turnOn: vi.fn()},
  }),
}));

describe('QuickMenu', () => {
  beforeEach(() => {
    sideBar.current = {scenarios: ['script.leave_home']};
  });

  it('garde le menu ouvert quand la souris quitte le bouton après un appui', () => {
    render(<QuickMenu />);
    const dial = screen.getByRole('button', {name: 'Menu rapide'});

    fireEvent.click(dial);
    fireEvent.mouseLeave(dial);

    expect(dial).toHaveAttribute('aria-expanded', 'true');
  });

  it('apparaît avec la seule action Température dans une maison sans scénario', () => {
    sideBar.current = {};
    render(<QuickMenu />);
    fireEvent.click(screen.getByRole('button', {name: 'Menu rapide'}));

    expect(
      screen.getByRole('menuitemcheckbox', {name: 'Température'}),
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });
});
