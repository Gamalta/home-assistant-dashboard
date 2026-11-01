import {useEntity} from '@hakit/core';
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {vacuumEntityIds} from '../../../utils/entity/vacuum';
import {VacuumAlerts} from './VacuumAlerts';

// Le mock de la démo n'a pas d'erreur : on simule les entités ici.
vi.mock('@hakit/core', () => ({useEntity: vi.fn()}));

const ids = vacuumEntityIds('dreame_test');

function withStates(states: Record<string, [string, object?]>) {
  vi.mocked(useEntity).mockImplementation(((id: string) =>
    states[id]
      ? {state: states[id][0], attributes: states[id][1] ?? {}}
      : null) as typeof useEntity);
}

describe('VacuumAlerts', () => {
  it('signale une erreur avec son texte', () => {
    withStates({
      [ids.vacuum]: ['docked'],
      [ids.error]: [
        'clean_tank_level',
        {description: "Remplissez le réservoir d'eau propre."},
      ],
    });
    render(<VacuumAlerts ids={ids} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Remplissez le réservoir d'eau propre.",
    );
  });

  it('signale un aspirateur hors ligne', () => {
    withStates({[ids.vacuum]: ['unavailable'], [ids.error]: ['unavailable']});
    render(<VacuumAlerts ids={ids} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Aspirateur hors ligne',
    );
  });

  it('ne montre rien quand l’aspirateur va bien', () => {
    withStates({[ids.vacuum]: ['cleaning'], [ids.error]: ['no_error']});
    render(<VacuumAlerts ids={ids} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
