import {renderHook, waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {useEmojiKeywords} from './useEmojiKeywords';

describe('useEmojiKeywords', () => {
  it('charge les mots-clés une fois activé et les garde ensuite', async () => {
    const {result, rerender} = renderHook(
      ({enabled}) => useEmojiKeywords(enabled),
      {initialProps: {enabled: false}},
    );
    expect(result.current).toEqual([]);

    rerender({enabled: true});
    await waitFor(() => expect(result.current.length).toBeGreaterThan(0));
    rerender({enabled: false});
    expect(result.current.length).toBeGreaterThan(0);
  });
});
