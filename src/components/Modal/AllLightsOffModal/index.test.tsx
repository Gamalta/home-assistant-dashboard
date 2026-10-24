import type {HassEntityWithService} from '@hakit/core';
import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AllLightsOffModal} from '.';

const {turnOffLights, runScript} = vi.hoisted(() => ({
  turnOffLights: vi.fn(),
  runScript: vi.fn(),
}));

vi.mock('@hakit/core', () => ({
  useService: (domain: string) =>
    domain === 'light' ? {turnOff: turnOffLights} : {turnOn: runScript},
}));

const light = (entityId: string, name: string) =>
  ({
    entity_id: entityId,
    attributes: {friendly_name: name},
  }) as HassEntityWithService<'light'>;

const lights = [
  light('light.salon', 'Salon'),
  light('light.cuisine', 'Cuisine'),
];

describe('AllLightsOffModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('éteint les lumières allumées en un seul appel', async () => {
    const onClose = vi.fn();
    render(
      <AllLightsOffModal
        open
        onClose={onClose}
        lights={lights}
        scriptEntityId={undefined}
      />,
    );

    expect(await screen.findByText('Salon')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Éteindre'}));

    expect(turnOffLights).toHaveBeenCalledWith({
      target: ['light.salon', 'light.cuisine'],
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('lance le script configuré à la place', async () => {
    render(
      <AllLightsOffModal
        open
        onClose={() => {}}
        lights={lights}
        scriptEntityId="script.tout_eteindre"
      />,
    );

    fireEvent.click(await screen.findByRole('button', {name: 'Éteindre'}));

    expect(runScript).toHaveBeenCalledWith({target: 'script.tout_eteindre'});
    expect(turnOffLights).not.toHaveBeenCalled();
  });

  it('désactive le bouton sans lumière allumée ni script', async () => {
    render(
      <AllLightsOffModal
        open
        onClose={() => {}}
        lights={[]}
        scriptEntityId={undefined}
      />,
    );

    expect(
      await screen.findByText('Aucune lumière allumée.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Éteindre'})).toBeDisabled();
  });
});
