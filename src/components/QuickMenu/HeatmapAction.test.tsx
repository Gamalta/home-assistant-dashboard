import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {AppProvider} from '../../contexts/AppContext';
import {HeatmapAction} from './HeatmapAction';

describe('HeatmapAction', () => {
  afterEach(() => localStorage.clear());

  it('active puis coupe la carte des températures d’un appui', () => {
    const onToggle = vi.fn();
    render(
      <AppProvider>
        <HeatmapAction open onToggle={onToggle} />
      </AppProvider>,
    );
    const action = screen.getByRole('menuitemcheckbox', {name: 'Température'});
    expect(action).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(action);
    expect(action).toHaveAttribute('aria-checked', 'true');
    expect(JSON.parse(localStorage.getItem('graphics-options')!)).toMatchObject(
      {heatmapShader: true},
    );

    fireEvent.click(action);
    expect(action).toHaveAttribute('aria-checked', 'false');
    expect(onToggle).toHaveBeenCalledTimes(2);
  });
});
