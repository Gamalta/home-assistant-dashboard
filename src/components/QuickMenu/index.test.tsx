import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {QuickMenu} from '.';

const {sideBar, rooms} = vi.hoisted(() => ({
  sideBar: {
    current: {} as {scenarios?: string[]; energy?: object},
  },
  rooms: {current: [] as {items: {type: string}[]}[]},
}));

vi.mock('../../contexts/HouseContext', () => ({
  useHouseContext: () => ({
    houseConfig: {sideBar: sideBar.current, house: {rooms: rooms.current}},
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
  beforeEach(() => {
    sideBar.current = {scenarios: ['script.leave_home']};
    rooms.current = [];
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
    expect(
      screen.queryByRole('menuitemcheckbox', {name: 'Aspirateur'}),
    ).not.toBeInTheDocument();
  });

  it('propose l’entrée Énergie quand le compteur est configuré', () => {
    sideBar.current = {energy: {}};
    render(<QuickMenu />);
    fireEvent.click(screen.getByRole('button', {name: 'Menu rapide'}));

    expect(screen.getByRole('menuitem', {name: 'Énergie'})).toBeInTheDocument();
  });

  it('propose le plan de l’aspirateur quand la maison en a un', () => {
    rooms.current = [{items: [{type: 'vacuum'}]}];
    render(<QuickMenu />);
    fireEvent.click(screen.getByRole('button', {name: 'Menu rapide'}));

    expect(
      screen.getByRole('menuitemcheckbox', {name: 'Aspirateur'}),
    ).toBeInTheDocument();
  });
});
