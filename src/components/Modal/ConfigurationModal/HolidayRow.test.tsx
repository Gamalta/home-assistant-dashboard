import {fireEvent, render, screen, within} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {AppProvider} from '../../../contexts/AppContext';
import {HolidayRow} from './HolidayRow';

describe('HolidayRow', () => {
  afterEach(() => localStorage.clear());

  it('suit les dates des fêtes par défaut, et mémorise un choix forcé', () => {
    render(
      <AppProvider>
        <HolidayRow />
      </AppProvider>,
    );
    const mode = screen.getByRole('combobox', {name: 'Mode fêtes'});
    expect(mode).toHaveTextContent('Du 1er déc. au 6 janv.');

    fireEvent.mouseDown(mode);
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'Toujours',
      }),
    );
    expect(mode).toHaveTextContent('Toujours');
    expect(JSON.parse(localStorage.getItem('graphics-options')!)).toMatchObject(
      {holidayMode: 'on'},
    );
  });
});
