import {createContext, useContext, useState} from 'react';

type roomType = string | null;

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
