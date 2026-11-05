import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {AppProvider} from '../../../contexts/AppContext';
import {labelCategories} from '../../../utils/labelCategories';
import {CategoryRow} from './CategoryRow';

const category = (id: string) => labelCategories.find(c => c.id === id)!;

describe('CategoryRow', () => {
  afterEach(() => localStorage.clear());

  it('coupe par défaut les appareils sur pile, pas les volets', () => {
    render(
      <AppProvider>
        <CategoryRow category={category('battery')} />
        <CategoryRow category={category('shutter')} />
      </AppProvider>,
    );

    expect(
      screen.getByRole('switch', {name: 'Appareils sur pile'}),
    ).not.toBeChecked();
    expect(screen.getByRole('switch', {name: 'Volets'})).toBeChecked();
  });

  it('mémorise le choix de l’utilisateur', () => {
    render(
      <AppProvider>
        <CategoryRow category={category('battery')} />
      </AppProvider>,
    );
    const toggle = screen.getByRole('switch', {name: 'Appareils sur pile'});

    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    expect(JSON.parse(localStorage.getItem('graphics-options')!)).toMatchObject(
      {shownCategories: {battery: true}},
    );
  });
});
