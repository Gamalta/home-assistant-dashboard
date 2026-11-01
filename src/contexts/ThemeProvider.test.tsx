import {render, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {ThemeProvider} from './ThemeProvider';

describe('ThemeProvider', () => {
  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('ouvre le dashboard en thème sombre, même en journée', async () => {
    vi.useFakeTimers({toFake: ['Date']});
    vi.setSystemTime(new Date(2026, 5, 21, 12));
    render(<ThemeProvider>{null}</ThemeProvider>);

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
  });

  it('garde le thème choisi', async () => {
    localStorage.setItem('theme', 'light');
    render(<ThemeProvider>{null}</ThemeProvider>);

    await waitFor(() => expect(document.documentElement).toHaveClass('light'));
  });
});
