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
};

const AppContext = createContext<AppContextType>({
  debug: false,
  setDebug: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({children}: {children: React.ReactNode}) => {
  const [debug, setDebug] = useState<boolean>(false);

  return (
    <AppContext.Provider
      value={{
        debug,
        setDebug,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
