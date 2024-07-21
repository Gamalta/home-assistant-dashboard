import {RefObject, createContext, useContext, useEffect, useState} from 'react';

type FloatingActionContextTyoe = {
  containerRef: RefObject<HTMLDivElement> | null;
  ratio: number;
  offsetWidth: number;
  offsetHeight: number;
};

const FloatingActionContext = createContext<FloatingActionContextTyoe>({
  containerRef: null,
  ratio: 0,
  offsetWidth: 0,
  offsetHeight: 0,
});

export const useFloatingActionContext = () => useContext(FloatingActionContext);

type FloatingActionProviderProps = {
  children: React.ReactNode;
  containerRef: RefObject<HTMLDivElement>;
};

export const FloatingActionProvider = (props: FloatingActionProviderProps) => {
  const {children, containerRef} = props;
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef && containerRef.current) {
        setRatio(
          containerRef.current.offsetWidth / containerRef.current.offsetHeight
        );
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef]);

  return (
    <FloatingActionContext.Provider
      value={{
        containerRef,
        ratio,
        offsetWidth: containerRef.current?.offsetWidth ?? 0,
        offsetHeight: containerRef.current?.offsetHeight ?? 0,
      }}
    >
      {children}
    </FloatingActionContext.Provider>
  );
};
