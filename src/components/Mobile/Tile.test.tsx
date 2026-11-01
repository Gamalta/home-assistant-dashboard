import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Tile} from './Tile';

describe('Tile', () => {
  it('affiche le nom et l’état de l’équipement', () => {
    render(<Tile icon={null} name="Plafonnier" state="80 %" />);

    const tile = screen.getByRole('button', {name: /Plafonnier/});
    expect(tile).toHaveTextContent('80 %');
  });

  it('transmet l’état basculé et l’appui', () => {
    const onClick = vi.fn();
    render(
      <Tile
        icon={null}
        name="Prise TV"
        state="85 W"
        active
        aria-pressed
        onClick={onClick}
      />,
    );

    const tile = screen.getByRole('button', {name: /Prise TV/});
    tile.click();
    expect(tile).toHaveAttribute('aria-pressed', 'true');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('relaie le toucher à un interrupteur natif caché, qui fait vibrer l’iPhone', () => {
    const onClick = vi.fn();
    const {container} = render(
      <Tile icon={null} name="Plafonnier" state="Éteinte" onClick={onClick} />,
    );
    const input = container.querySelector('input')!;

    // Le doigt touche le label qui couvre la tuile.
    container.querySelector('label')!.click();

    expect(input).toHaveAttribute('switch');
    expect(input).toBeChecked();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('désactive un équipement indisponible', () => {
    render(<Tile icon={null} name="Volet" state="Indisponible" unavailable />);

    expect(screen.getByRole('button', {name: /Volet/})).toBeDisabled();
  });
});
