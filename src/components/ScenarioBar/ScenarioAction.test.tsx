import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ScenarioAction} from './ScenarioAction';

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

describe('ScenarioAction', () => {
  beforeEach(() => {
    script.current = {
      attributes: {friendly_name: 'Départ', icon: 'mdi:exit-run'},
      service: {turnOn: vi.fn()},
    };
  });

  it('lance le script d’un appui sur son libellé toujours visible', () => {
    const onLaunch = vi.fn();
    render(
      <ScenarioAction
        open
        scriptEntityId="script.depart"
        onLaunch={onLaunch}
      />,
    );

    fireEvent.click(screen.getByRole('menuitem', {name: 'Départ'}));

    expect(script.current?.service.turnOn).toHaveBeenCalledTimes(1);
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it('ne s’affiche pas sans le script dans Home Assistant', () => {
    script.current = null;
    render(
      <ScenarioAction open scriptEntityId="script.depart" onLaunch={vi.fn()} />,
    );

    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });
});
