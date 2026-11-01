import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {AppProvider} from '../../contexts/AppContext';
import {HeatmapAction} from './HeatmapAction';
import {VacuumMapAction} from './VacuumMapAction';

describe('VacuumMapAction', () => {
  afterEach(() => localStorage.clear());

  it('bascule le plan de nettoyage au sol, à la place des températures', () => {
    // Hors du SpeedDial, chaque action a besoin d'un id pour nommer son libellé.
    render(
      <AppProvider>
        <HeatmapAction id="heatmap" open onToggle={vi.fn()} />
        <VacuumMapAction id="vacuum-map" open onToggle={vi.fn()} />
      </AppProvider>,
    );
    const vacuum = screen.getByRole('menuitemcheckbox', {name: 'Aspirateur'});
    const temperature = screen.getByRole('menuitemcheckbox', {
      name: 'Température',
    });

    fireEvent.click(vacuum);
    expect(vacuum).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(vacuum);
    expect(vacuum).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(temperature);
    fireEvent.click(vacuum);
    expect(vacuum).toHaveAttribute('aria-checked', 'true');
    expect(temperature).toHaveAttribute('aria-checked', 'false');
    expect(JSON.parse(localStorage.getItem('graphics-options')!)).toMatchObject(
      {vacuumMapShader: true, heatmapShader: false},
    );

    fireEvent.click(temperature);
    expect(vacuum).toHaveAttribute('aria-checked', 'false');
  });
});
