import type {ServiceArgs} from './types';

// Attributs du média seulement : le lecteur garde son nom, ses fonctions et son volume.
const tracks = (now: string) => ({
  first: {
    attributes: {
      media_duration: 219,
      media_position: 1.819,
      media_position_updated_at: now,
      media_title: 'My Way',
      media_artist: 'Calvin Harris',
      app_name: 'YouTube Music',
      entity_picture: 'media/demo_cover.svg',
    },
    context: {
      id: '1',
      user_id: null,
      parent_id: null,
    },
  },
  second: {
    attributes: {
      media_duration: 199,
      media_position: 1.005,
      media_position_updated_at: now,
      media_title: 'Human',
      media_artist: "Rag'n'Bone Man",
      media_album_name: 'Human',
      app_name: 'YouTube',
      entity_picture: 'media/demo_cover.svg',
    },
    context: {
      id: '2',
      user_id: null,
      parent_id: null,
    },
  },
});

export function mediaPlayerUpdates({
  now,
  target: _target,
  service,
  serviceData,
  setEntities,
}: ServiceArgs<'mediaPlayer'>) {
  const dates = {
    last_changed: now,
    last_updated: now,
  };
  const targets = typeof _target === 'string' ? [_target] : _target;
  targets.forEach(target => {
    switch (service) {
      case 'mediaPlay':
        return setEntities(entities => ({
          ...entities,
          [target]: {
            ...entities[target],
            ...dates,
            state: 'playing',
          },
        }));
      case 'turnOn':
      case 'turn_on':
        return setEntities(entities => ({
          ...entities,
          [target]: {
            ...entities[target],
            ...tracks(now).first,
            ...dates,
            state: 'playing',
            attributes: {
              ...entities[target].attributes,
              ...tracks(now).first.attributes,
            },
          },
        }));
      case 'turnOff':
      case 'turn_off':
        return setEntities(entities => ({
          ...entities,
          [target]: {
            ...entities[target],
            ...dates,
            state: 'off',
          },
        }));
      case 'mediaPause':
        return setEntities(entities => ({
          ...entities,
          [target]: {
            ...entities[target],
            ...dates,
            state: 'paused',
          },
        }));
      case 'mediaPreviousTrack':
      case 'mediaNextTrack': {
        return setEntities(entities => {
          const entity = entities[target];
          const id = entity.context.id;
          const next = id === '1' ? 'second' : 'first';
          return {
            ...entities,
            [target]: {
              ...entities[target],
              ...tracks(now)[next],
              ...dates,
              state: 'playing',
              attributes: {
                ...entities[target].attributes,
                ...tracks(now)[next].attributes,
              },
            },
          };
        });
      }
      case 'mediaSeek':
        return setEntities(entities => ({
          ...entities,
          [target]: {
            ...entities[target],
            ...dates,
            attributes: {
              ...entities[target].attributes,
              media_position: (
                serviceData as ServiceArgs<
                  'mediaPlayer',
                  'mediaSeek'
                >['serviceData']
              )?.seek_position,
              media_position_updated_at: now,
            },
          },
        }));
      case 'volumeSet':
      case 'volumeMute':
      case 'selectSource':
        return setEntities(entities => ({
          ...entities,
          [target]: {
            ...entities[target],
            ...dates,
            attributes: {
              ...entities[target].attributes,
              ...(serviceData ?? {}),
            },
          },
        }));
      case 'volumeUp':
      case 'volumeDown':
        return setEntities(entities => ({
          ...entities,
          [target]: {
            ...entities[target],
            ...dates,
            attributes: {
              ...entities[target].attributes,
              volume_level:
                entities[target].attributes.volume_level +
                (service === 'volumeUp' ? 0.1 : -0.1),
            },
          },
        }));
    }
  });
}
