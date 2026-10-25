import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ScenarioButton} from './ScenarioButton';

const {script} = vi.hoisted(() => ({
  script: {
    current: null as null | {
      attributes: {friendly_name: string; icon: string};
      service: {turnOn: () => void};
    },
  },
}));

vi.mock('@hakit/core', async importOriginal => ({
  ...(await importOriginal()),
  useEntity: () => script.current,
}));

describe('ScenarioButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    script.current = {
      attributes: {friendly_name: 'Départ', icon: 'mdi:exit-run'},
      service: {turnOn: vi.fn()},
    };
  });
  afterEach(() => vi.useRealTimers());

  it('lance le script d’un appui et le confirme un instant', () => {
    render(<ScenarioButton scriptEntityId="script.depart" />);

    const button = screen.getByRole('button', {name: 'Départ'});
    fireEvent.click(button);

    expect(script.current?.service.turnOn).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('CheckRoundedIcon')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1500));
    expect(screen.queryByTestId('CheckRoundedIcon')).not.toBeInTheDocument();
  });

  it('ne s’affiche pas sans le script dans Home Assistant', () => {
    script.current = null;
    render(<ScenarioButton scriptEntityId="script.depart" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
