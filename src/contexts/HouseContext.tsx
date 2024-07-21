import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';
import {HouseConfig} from '../components/House/config';

type roomType = (typeof HouseConfig.rooms)[0] | null;

type HouseContextType = {
  room: roomType;
  setRoom: Dispatch<SetStateAction<roomType>>;
};

const HouseContext = createContext<HouseContextType>({
  room: null,
  setRoom: () => {},
});

export const useHouseContext = () => useContext(HouseContext);

type HouseProviderProps = {
  children: ReactNode;
};

export const HouseProvider = (props: HouseProviderProps) => {
  const {children} = props;
  const [room, setRoom] = useState<roomType>(null);

  return (
    <HouseContext.Provider value={{room, setRoom}}>
      {children}
    </HouseContext.Provider>
  );
};
