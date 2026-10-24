import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {MediaPlayerFeature} from '../../../utils/entity/media';
import {MediaShortcut} from './MediaShortcut';

const {player} = vi.hoisted(() => ({
  player: {
    entity_id: 'media_player.tv',
    state: 'playing',
    attributes: {} as Record<string, unknown>,
    service: {
      mediaPlay: vi.fn(),
      mediaPause: vi.fn(),
      mediaNextTrack: vi.fn(),
    },
  },
}));

vi.mock('@hakit/core', async importOriginal => ({
  ...(await importOriginal()),
  useEntity: () => player,
  useHass: (selector: (state: object) => unknown) =>
    selector({helpers: {joinHassUrl: (path: string) => path}}),
}));

const renderCard = () =>
  render(
    <MediaShortcut
      id="media"
      shortcutConfig={{type: 'media', mediaPlayerEntityId: 'media_player.tv'}}
    />,
  );

describe('MediaShortcut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    player.state = 'playing';
    player.attributes = {
      friendly_name: 'TV du séjour',
      media_title: 'My Way',
      media_artist: 'Calvin Harris',
      entity_picture: '/cover.svg',
      supported_features:
        MediaPlayerFeature.PAUSE | MediaPlayerFeature.NEXT_TRACK,
    };
  });

  it('affiche la pochette, le titre et l’artiste du média en cours', () => {
    const {container} = renderCard();

    expect(screen.getByText('TV du séjour')).toBeInTheDocument();
    expect(screen.getByText('My Way')).toBeInTheDocument();
    expect(screen.getByText('Calvin Harris')).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', '/cover.svg');
  });

  it('met en pause et passe au suivant sans ouvrir la modale', () => {
    renderCard();

    fireEvent.click(screen.getByRole('button', {name: 'Pause'}));
    fireEvent.click(screen.getByRole('button', {name: 'Suivant'}));

    expect(player.service.mediaPause).toHaveBeenCalled();
    expect(player.service.mediaNextTrack).toHaveBeenCalled();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('ouvre sa modale d’un appui sur la carte', async () => {
    renderCard();

    fireEvent.click(screen.getByRole('button', {name: /^TV du séjour/}));

    expect(
      await screen.findByRole('heading', {name: 'TV du séjour'}),
    ).toBeInTheDocument();
  });

  it('indique un lecteur éteint, sans commandes', () => {
    player.state = 'off';
    renderCard();

    expect(screen.getByText('Éteint')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Pause'}),
    ).not.toBeInTheDocument();
  });
});
