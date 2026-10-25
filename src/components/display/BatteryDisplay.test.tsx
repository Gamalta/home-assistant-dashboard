import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {BatteryDisplay} from './BatteryDisplay';

describe('BatteryDisplay', () => {
  // Les icônes MUI n'ont pas de nom accessible : on passe par leur data-testid.
  it('affiche une batterie à moitié pleine entre 30 et 49 %', () => {
    render(<BatteryDisplay batteryLevel={40} />);

    expect(screen.getByTestId('Battery50RoundedIcon')).toBeInTheDocument();
  });
});
