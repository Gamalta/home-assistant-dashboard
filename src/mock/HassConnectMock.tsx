import {useEffect, type ReactNode} from 'react';
import type {
  HassEntities,
  HassConfig,
  Auth,
  HaWebSocket,
  MessageBase,
} from 'home-assistant-js-websocket';
import {Connection} from 'home-assistant-js-websocket';
import type {
  DomainService,
  SnakeOrCamelDomains,
  CallServiceArgs,
  ServiceResponse,
  AuthUser,
  InternalStore,
} from '@hakit/core';
import {
  useHass,
  updateLocales,
  locales,
  NumberFormat,
  TimeFormat,
  DateFormat,
  FirstWeekday,
  TimeZone,
} from '@hakit/core';
import {entities as ENTITIES} from './mocks/mockEntities';
import fakeApi from './mocks/fake-call-service';
import type {ServiceArgs} from './mocks/fake-call-service/types';
import {mockCallApi} from './mocks/fake-call-api';
import {logs} from './mocks/mockLogs';
import {dailyForecast, hourlyForecast} from './mocks/mockWeather';
import {generateMockHistory} from './mock-history';
interface HassProviderProps {
  children: (ready: boolean) => ReactNode;
  hassUrl: string;
  throttle?: number;
}

let fakeConfig: HassConfig = {
  latitude: -33.25779010313883,
  longitude: 151.4821529388428,
  elevation: 0,
  unit_system: {
    length: 'km',
    accumulated_precipitation: 'mm',
    mass: 'g',
    pressure: 'Pa',
    temperature: '°C',
    volume: 'L',
    wind_speed: 'm/s',
  },
  location_name: 'Home',
  time_zone: 'Europe/Paris',
  components: [],
  config_dir: '/config',
  allowlist_external_dirs: [],
  allowlist_external_urls: [],
  radius: 1,
  version: '2026.1.0',
  config_source: 'storage',
  safe_mode: false,
  recovery_mode: false,
  state: 'RUNNING',
  external_url: null,
  internal_url: null,
  currency: 'EUR',
  country: 'FR',
  language: 'fr',
};

const fakeAuth = {
  data: {
    hassUrl: '',
    clientId: null,
    expires: 0,
    refresh_token: '',
    access_token: '',
    expires_in: 0,
  },
  wsUrl: '',
  accessToken: '',
  expired: false,
  refreshAccessToken: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  revoke: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
} satisfies Auth;

class MockWebSocket {
  addEventListener() {}
  removeEventListener() {}
  send() {}
  close() {}
}

let renderTemplatePrevious = 'on';

class MockConnection extends Connection {
  private _mockListeners: {[event: string]: ((data: unknown) => void)[]};
  private _mockResponses: {
    [type: string]: object | ((message: object) => object) | undefined;
  };

  constructor() {
    super(new MockWebSocket() as unknown as HaWebSocket, {
      setupRetry: 0,
      createSocket: async () => new MockWebSocket() as unknown as HaWebSocket,
    });
    this._mockListeners = {};
    this._mockResponses = {};
  }

  // hass events
  async subscribeEvents<EventType>(
    eventCallback: (ev: EventType) => void,
    eventType?: string,
  ) {
    if (!eventType) {
      throw new Error('mock all events not implemented');
    }
    if (!(eventType in this._mockListeners)) {
      this._mockListeners[eventType] = [];
    }

    this._mockListeners[eventType].push(eventCallback as (ev: unknown) => void);
    return () => Promise.resolve();
  }

  mockEvent(event: string, data: object) {
    (this._mockListeners[event] ?? []).forEach(cb => cb(data));
  }

  mockResponse(type: string, data: object) {
    this._mockResponses[type] = data;
  }

  async subscribeMessage<Result>(
    callback: (result: Result) => void,
    params?: {
      type: string;
      entity_ids?: string[];
      start_time?: string;
      forecast_type?: string;
      end_time?: string;
    },
  ): Promise<() => Promise<void>> {
    if (
      params &&
      params.type === 'logbook/event_stream' &&
      params.start_time &&
      params.end_time
    ) {
      const isoStartTime = new Date(params.start_time);
      const isoEndTime = new Date(params.end_time);

      const unixStartTime = isoStartTime.getTime() / 1000;
      const unixEndTime = isoEndTime.getTime() / 1000;
      const newEvents = {
        ...logs,
        start_time: unixStartTime,
        end_time: unixEndTime,
        events: logs.events.map(event => ({
          ...event,
          entity_id: params?.entity_ids ? params?.entity_ids[0] : null,
          when: unixStartTime + Math.random() * (unixEndTime - unixStartTime),
        })),
      };
      callback(newEvents as Result);
    } else if (params && params.type === 'weather/subscribe_forecast') {
      if (params.forecast_type === 'daily') {
        callback(dailyForecast as Result);
      }
      if (params.forecast_type === 'hourly') {
        callback(hourlyForecast as Result);
      }
    } else if (params && params.type === 'render_template') {
      if (renderTemplatePrevious === 'on') {
        callback({
          result: 'The entity is on!!',
        } as Result);
      } else {
        callback({
          result: 'The entity is not on!!',
        } as Result);
      }
    } else {
      const entityId = params?.entity_ids?.[0] ?? 'sensor.mock_temperature';
      let min = 0;
      let max = 100;

      if (entityId.includes('temperature')) {
        min = 20;
        max = 25;
      } else if (entityId.includes('humidity')) {
        min = 40;
        max = 60;
      }

      const history = generateMockHistory(
        entityId,
        50,
        min,
        max,
        params?.start_time
          ? new Date(params.start_time).getTime() / 1000
          : undefined,
        params?.end_time
          ? new Date(params.end_time).getTime() / 1000
          : undefined,
      );

      callback(history as Result);
    }
    return () => Promise.resolve();
  }
  async sendMessagePromise<Result>(message: MessageBase): Promise<Result> {
    if (message.type === 'get_config') {
      return fakeConfig as Result;
    }
    if (message.type === 'config/auth/list') {
      const users: AuthUser[] = [
        {
          id: '123',
          name: 'Roméo',
          is_active: true,
          is_owner: true,
          system_generated: false,
          credentials: [],
          group_ids: [],
        },
        {
          id: '456',
          name: 'Juliette',
          is_active: true,
          is_owner: false,
          system_generated: false,
          credentials: [],
          group_ids: [],
        },
      ];
      return users as Result;
    }
    return null as Result;
  }
}

const originalStore = useHass.getState() as InternalStore;

useHass.setState({
  hash: '',
  routes: [],
  entities: ENTITIES,
  config: fakeConfig,
  locale: {
    language: 'fr',
    number_format: NumberFormat.language,
    time_format: TimeFormat.language,
    date_format: DateFormat.language,
    time_zone: TimeZone.local,
    first_weekday: FirstWeekday.language,
  },
  connection: new MockConnection(),
  auth: fakeAuth,
  user: {
    id: '',
    is_admin: false,
    is_owner: false,
    name: 'Joe Bloggs',
    credentials: [],
    mfa_modules: [],
  },
  helpers: {
    ...originalStore.helpers,
    joinHassUrl: p => p,
    callApi: mockCallApi as typeof originalStore.helpers.callApi,
    callService: (<
      R extends object,
      T extends SnakeOrCamelDomains,
      M extends DomainService<T>,
    >(
      rawArgs: CallServiceArgs<T, M, boolean>,
    ): Promise<ServiceResponse<R>> | void => {
      console.log('callService', rawArgs);
      const {domain, service, serviceData, target: target} = rawArgs;
      if (typeof target !== 'string' && !Array.isArray(target))
        return undefined as R extends true ? never : void;

      const now = new Date().toISOString();
      // Okay to cast here, we know the store is an InternalStore
      const {entities, setEntities} = useHass.getState() as InternalStore;
      if (domain in fakeApi) {
        const api = fakeApi[domain as 'scene'] as (
          params: ServiceArgs<'scene'>,
        ) => boolean;
        const skip = api({
          setEntities(cb: (entities: HassEntities) => HassEntities) {
            setEntities(cb(entities));
          },
          now,
          target,
          // @ts-expect-error - don't know domain
          service,
          // @ts-expect-error - don't know domain
          serviceData,
        });
        if (!skip) return undefined as R extends true ? never : void;
      }
      if (typeof target !== 'string')
        return undefined as R extends true ? never : void;

      const dates = {
        last_changed: now,
        last_updated: now,
      };
      switch (service) {
        case 'turn_on':
        case 'turnOn':
          {
            const attributes = {
              ...entities[target].attributes,
              ...(serviceData || {}),
            };
            setEntities({
              ...entities,
              [target]: {
                ...entities[target],
                attributes: {
                  ...attributes,
                },
                ...dates,
                state: 'on',
              },
            });
          }
          break;
        case 'turn_off':
        case 'turnOff':
          setEntities({
            ...entities,
            [target]: {
              ...entities[target],
              attributes: {
                ...entities[target].attributes,
                ...(serviceData || {}),
              },
              ...dates,
              state: 'off',
            },
          });
          break;
        case 'toggle':
          setEntities({
            ...entities,
            [target]: {
              ...entities[target],
              attributes: {
                ...entities[target].attributes,
                ...(serviceData || {}),
              },
              ...dates,
              state: entities[target].state === 'on' ? 'off' : 'on',
            },
          });
          break;
        default:
          setEntities({
            ...entities,
            [target]: {
              ...entities[target],
              ...dates,
            },
          });
          break;
      }
      return undefined as R extends true ? never : void;
    }) as InternalStore['helpers']['callService'],
  },

  // @ts-expect-error - intentional error, this method is available, but not typed
  setConfig: config => {
    const state = useHass.getState();
    if (state.connection && 'mockEvent' in state.connection && config) {
      fakeConfig = config;
      // @ts-expect-error - this is fine, it exists on the mock connection, just not on the real Connection type
      state.connection.mockEvent('core_config_updated', config);
    }
    state.config = config;
    return state;
  },
  setEntities: (newEntities: HassEntities) => {
    // used to mock out the render_template service
    if (newEntities['light.fake_light_1']) {
      renderTemplatePrevious = newEntities['light.fake_light_1'].state;
    }
    return originalStore.setEntities(newEntities);
  },
});

function HassProvider({children}: HassProviderProps) {
  const ready = useHass(s => s.ready);
  const _hash = useHass(s => s.hash);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const {setHash} = useHass.getState();
    if (location.hash === '') return;
    if (location.hash.replace('#', '') === _hash) return;
    setHash(location.hash);
  }, [_hash]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    function onHashChange() {
      const {setRoutes, setHash, routes} = useHass.getState();
      setRoutes(
        routes.map(route => {
          if (route.hash === location.hash.replace('#', '')) {
            return {
              ...route,
              active: true,
            };
          }
          return {
            ...route,
            active: false,
          };
        }),
      );
      setHash(location.hash);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    const {setLocales, setReady, setConfig} =
      useHass.getState() as InternalStore;
    locales
      .find(locale => locale.code === 'en')
      ?.fetch()
      .then(_locales => {
        setLocales(_locales);
        updateLocales(_locales);
        setReady(true);
        setConfig(fakeConfig);
      });
  }, []);

  return children(ready);
}

export type HassConnectProps = {
  children: ReactNode;
  hassUrl: string;
  fallback?: ReactNode;
  wrapperProps?: React.ComponentPropsWithoutRef<'div'>;
  loading?: ReactNode;
};

export const HassConnect = ({
  children,
  hassUrl,
  fallback,
}: HassConnectProps): ReactNode => {
  return (
    <HassProvider hassUrl={hassUrl}>
      {ready => (ready ? children : fallback)}
    </HassProvider>
  );
};
