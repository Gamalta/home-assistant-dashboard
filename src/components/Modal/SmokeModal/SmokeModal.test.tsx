import {useEntity} from '@hakit/core';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import type {SmokeConfigType} from '../../../configs/house';
import {SmokeModal} from '.';

// La démo a un bouton de test, l'appartement non : on simule les deux cas ici.
vi.mock('@hakit/core', () => ({useEntity: vi.fn()}));

const press = vi.fn();
const entity = (state: string) => ({
  state,
  attributes: {},
  last_updated: '2026-10-24T10:00:00Z',
  custom: {relativeTime: 'il y a 5 minutes'},
  service: {press},
});
const config: SmokeConfigType = {
  type: 'smoke',
  smokeEntityId: 'binary_sensor.test_smoke',
  position: {x: 0, y: 0, z: 0},
};

function renderModal(smokeConfig: SmokeConfigType) {
  vi.mocked(useEntity).mockImplementation(
    ((id: string) =>
      ({
        'binary_sensor.test_smoke': entity('off'),
        'button.test_selftest': entity('unknown'),
      })[id] ?? null) as typeof useEntity,
  );
  render(
    <SmokeModal
      open
      title="Détecteur de fumée"
      onClose={() => {}}
      smokeConfig={smokeConfig}
    />,
  );
}

describe('SmokeModal', () => {
  it('appuie sur le bouton de test configuré', async () => {
    renderModal({...config, testEntityId: 'button.test_selftest'});

    fireEvent.click(await screen.findByRole('button', {name: 'Tester'}));
    expect(press).toHaveBeenCalledOnce();
  });

  it('n’affiche pas « Tester » sans entité de test', async () => {
    renderModal(config);

    expect(await screen.findByText('Aucune fumée')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Tester'}),
    ).not.toBeInTheDocument();
  });
});
