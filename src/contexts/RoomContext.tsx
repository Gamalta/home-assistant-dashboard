import {HassEntityWithService} from '@hakit/core';
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

type RoomContextType = {
  lightEntities: HassEntityWithService<'light'>[];
  setLightEntities: Dispatch<SetStateAction<HassEntityWithService<'light'>[]>>;
};

const RoomContext = createContext<RoomContextType>({
  lightEntities: [],
  setLightEntities: () => {},
});

export const useRoomContext = () => useContext(RoomContext);

export const RoomProvider = ({children}: {children: React.ReactNode}) => {
  const [lightEntities, setLightEntities] = useState<
    HassEntityWithService<'light'>[]
  >([]);

  return (
    <RoomContext.Provider
      value={{
        lightEntities,
        setLightEntities,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
