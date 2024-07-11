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
  tempModalOpen: boolean;
  setTempModalOpen: Dispatch<SetStateAction<boolean>>;
};

const RoomContext = createContext<RoomContextType>({
  lightModalOpen: false,
  setLightModalOpen: () => {},
  tempModalOpen: false,
  setTempModalOpen: () => {},
});

export const useRoomContext = () => useContext(RoomContext);

export const RoomProvider = ({children}: {children: React.ReactNode}) => {
  const [lightModalOpen, setLightModalOpen] = useState(false);
  const [tempModalOpen, setTempModalOpen] = useState(false);

  return (
    <RoomContext.Provider
      value={{
        lightModalOpen,
        setLightModalOpen,
        tempModalOpen,
        setTempModalOpen,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
