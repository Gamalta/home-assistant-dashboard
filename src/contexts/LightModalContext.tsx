import {HassEntityWithService} from '@hakit/core';
import {createContext, useContext, useState} from 'react';

type LightModalType = {
  entities: HassEntityWithService<'light'>[];
  activeEntities: string[];
  setActiveEntities: (activeEntities: string[]) => void;
};

const LightModalContext = createContext<LightModalType>({
  entities: [],
  activeEntities: [],
  setActiveEntities: () => {},
});

export const useLightModalContext = () => useContext(LightModalContext);

type LightModalProviderProps = {
  entities: HassEntityWithService<'light'>[];
  children: React.ReactNode;
};

export const LightModalProvider = (props: LightModalProviderProps) => {
  const {entities, children} = props;
  const [activeEntities, setActiveEntities] = useState<string[]>([]);

  return (
    <LightModalContext.Provider
      value={{entities, activeEntities, setActiveEntities}}
    >
      {children}
    </LightModalContext.Provider>
  );
};
