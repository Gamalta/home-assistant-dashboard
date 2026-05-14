import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

type AppContextType = {
  debug: boolean;
  setDebug: Dispatch<SetStateAction<boolean>>;
  triangle: number;
  setTriangle: Dispatch<SetStateAction<number>>;
};

const AppContext = createContext<AppContextType>({
  debug: false,
  setDebug: () => {},
  triangle: -1,
  setTriangle: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({children}: {children: React.ReactNode}) => {
  const [debug, setDebug] = useState<boolean>(false);
  const [triangle, setTriangle] = useState<number>(-1);

  return (
    <AppContext.Provider
      value={{
        debug,
        setDebug,
        triangle,
        setTriangle,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
