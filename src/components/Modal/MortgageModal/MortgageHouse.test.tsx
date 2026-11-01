import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {MortgageHouse} from './MortgageHouse';

describe('MortgageHouse', () => {
  it('remplit la maison à hauteur de la part remboursée', () => {
    render(<MortgageHouse ratio={0.25} />);

    const house = screen.getByRole('img', {name: '25 % remboursé'});
    // Du bas des murs (182) au faîte du toit (22).
    expect(house.querySelector('rect')).toHaveAttribute('y', '142');
  });

  it('n’affiche 100 % qu’une fois tout le capital remboursé', () => {
    render(<MortgageHouse ratio={0.999} />);

    expect(screen.getByText('99 %')).toBeInTheDocument();
  });
});
