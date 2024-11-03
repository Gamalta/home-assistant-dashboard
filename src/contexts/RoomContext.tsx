import {HassEntityWithService} from '@hakit/core';
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

type RoomContextType = {
  lightModalOpen: boolean;
  setLightModalOpen: Dispatch<SetStateAction<boolean>>;
  mainLightEntity: HassEntityWithService<'light'> | undefined;
  setMainLightEntity: Dispatch<
    SetStateAction<HassEntityWithService<'light'> | undefined>
  >;
  lightEntities: HassEntityWithService<'light'>[];
  setLightEntities: Dispatch<SetStateAction<HassEntityWithService<'light'>[]>>;
  tempModalOpen: boolean;
  setTempModalOpen: Dispatch<SetStateAction<boolean>>;
};

const RoomContext = createContext<RoomContextType>({
  lightModalOpen: false,
  setLightModalOpen: () => {},
  mainLightEntity: undefined,
  setMainLightEntity: () => {},
  lightEntities: [],
  setLightEntities: () => {},
  tempModalOpen: false,
  setTempModalOpen: () => {},
});

export const useRoomContext = () => useContext(RoomContext);

export const RoomProvider = ({children}: {children: React.ReactNode}) => {
  const [lightModalOpen, setLightModalOpen] = useState(false);
  const [tempModalOpen, setTempModalOpen] = useState(false);
  const [mainLightEntity, setMainLightEntity] = useState<
    HassEntityWithService<'light'> | undefined
  >(undefined);
  const [lightEntities, setLightEntities] = useState<
    HassEntityWithService<'light'>[]
  >([]);

  return (
    <RoomContext.Provider
      value={{
        lightModalOpen,
        setLightModalOpen,
        mainLightEntity,
        setMainLightEntity,
        lightEntities,
        setLightEntities,
        tempModalOpen,
        setTempModalOpen,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
