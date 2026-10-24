import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {DistanceDisplay} from './DistanceDisplay';

describe('DistanceDisplay', () => {
  it('affiche la distance en kilomètres', () => {
    render(<DistanceDisplay type="text" distance={46200} />);

    expect(screen.getByText('46.20 Km')).toBeInTheDocument();
  });

  it('privilégie la maison au travail', () => {
    render(<DistanceDisplay type="text" distance={0} atHome atWork />);

    expect(screen.getByText('A la maison')).toBeInTheDocument();
    expect(screen.queryByText('Au travail')).not.toBeInTheDocument();
  });

  it("donne le texte comme libellé de l'icône", () => {
    render(<DistanceDisplay distance={1500} atWork />);

    expect(screen.getByLabelText('Au travail')).toBeInTheDocument();
  });
});
