import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {AppleEmoji} from './AppleEmoji';

describe('AppleEmoji', () => {
  it('affiche l’image d’Apple, décrite par l’emoji', () => {
    render(<AppleEmoji emoji="☕" size={40} />);
    expect(screen.getByRole('img', {name: '☕'})).toHaveAttribute(
      'src',
      expect.stringMatching(/\/2615\.png$/),
    );
  });

  it('se rabat sur l’emoji du système si l’image ne charge pas', () => {
    const {rerender} = render(<AppleEmoji emoji="☕" size={40} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('☕')).toBeInTheDocument();

    rerender(<AppleEmoji emoji="🍵" size={40} />);
    expect(screen.getByRole('img', {name: '🍵'})).toBeInTheDocument();
  });
});
