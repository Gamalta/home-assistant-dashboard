import React, {useEffect} from 'react';
import {HassEntityWithService} from '@hakit/core';
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

type LightModalType = {
  entities: HassEntityWithService<'light'>[];
  activeEntityIds: string[];
  setActiveEntityIds: Dispatch<SetStateAction<string[]>>;
  hoverEntity: string | undefined;
  setHoverEntity: Dispatch<SetStateAction<string | undefined>>;
};

const LightModalContext = createContext<LightModalType>({
  entities: [],
  activeEntityIds: [],
  setActiveEntityIds: () => undefined,
  hoverEntity: undefined,
  setHoverEntity: () => undefined,
});

export const useLightModalContext = () => useContext(LightModalContext);

type LightModalProviderProps = {
  entities: HassEntityWithService<'light'>[];
  originLight: HassEntityWithService<'light'> | null;
  children: React.ReactNode;
};

export const LightModalProvider = (props: LightModalProviderProps) => {
  const {entities, originLight, children} = props;
  const [activeEntityIds, setActiveEntityIds] = useState<string[]>([]);
  const [hoverEntity, setHoverEntity] = useState<string>();

  useEffect(() => {
    if (!originLight) return;
    setActiveEntityIds([originLight.entity_id]);
  }, [originLight]);

  return (
    <LightModalContext.Provider
      value={{
        entities,
        activeEntityIds,
        setActiveEntityIds,
        hoverEntity,
        setHoverEntity,
      }}
    >
      {children}
    </LightModalContext.Provider>
  );
};
