import {createContext, useContext, useState} from 'react';
import {HouseConfig} from '../components/3d/config';

type roomType = (typeof HouseConfig.rooms)[0] | null;

type HouseContextType = {
  room: roomType;
  setRoom: (room: roomType) => void;
};

const HouseContext = createContext<HouseContextType>({
  room: null,
  setRoom: () => {},
});

export const useHouseContext = () => useContext(HouseContext);

export const HouseProvider = ({children}: {children: React.ReactNode}) => {
  const [room, setRoom] = useState<roomType>(null);

  return (
    <HouseContext.Provider value={{room, setRoom}}>
      {children}
    </HouseContext.Provider>
  );
};
