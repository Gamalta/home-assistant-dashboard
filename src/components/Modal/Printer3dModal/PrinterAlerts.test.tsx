import {useEntity} from '@hakit/core';
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {printer3dEntityIds} from '../../../utils/entity/printer3d';
import {PrinterAlerts} from './PrinterAlerts';

// Le mock de la démo n'a pas d'erreur : on simule les entités ici.
vi.mock('@hakit/core', () => ({useEntity: vi.fn()}));

const ids = printer3dEntityIds('p1s_test');

function withStates(states: Record<string, [string, object?]>) {
  vi.mocked(useEntity).mockImplementation(((id: string) =>
    states[id]
      ? {state: states[id][0], attributes: states[id][1] ?? {}}
      : null) as typeof useEntity);
}

describe('PrinterAlerts', () => {
  it('signale une erreur d’impression avec son texte', () => {
    withStates({
      [ids.online]: ['on'],
      [ids.printError]: ['on', {code: '0300_4000', error: 'Buse bouchée'}],
    });
    render(<PrinterAlerts ids={ids} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Erreur d'impression : Buse bouchée",
    );
  });

  it('signale une erreur HMS', () => {
    withStates({
      [ids.hmsErrors]: ['on', {'1-Error': 'Plateau trop chaud', Count: 1}],
    });
    render(<PrinterAlerts ids={ids} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Erreur HMS : Plateau trop chaud',
    );
  });

  it('signale une imprimante hors ligne', () => {
    withStates({[ids.online]: ['off']});
    render(<PrinterAlerts ids={ids} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Imprimante hors ligne',
    );
  });

  it('ne montre rien quand l’imprimante va bien', () => {
    withStates({
      [ids.online]: ['on'],
      [ids.printError]: ['off'],
      [ids.hmsErrors]: ['off'],
    });
    render(<PrinterAlerts ids={ids} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
