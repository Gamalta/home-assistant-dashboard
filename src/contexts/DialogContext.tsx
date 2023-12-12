import Dialog from '@mui/material/Dialog';
import {createContext, useContext, useState} from 'react';

export type DialogContextType = {
  state: boolean;
  open: () => void;
  close: () => void;
  setContent: () => void;
  entity?: string;
};

export const DialogContext = createContext<DialogContextType>({
  state: false,
  open: () => {},
  close: () => {},
  setContent: () => {},
});

export function DialogProvider({children}: {children: React.ReactNode}) {
  const [open, setOpen] = useState(false);

  return (
    <DialogContext.Provider
      value={{
        state: open,
        open: () => {
          setOpen(true);
        },
        close: () => {
          setOpen(false);
        },
        setContent: () => {
          setOpen(true);
        },
      }}
    >
      {children}
      <Dialog open={open}>coucou</Dialog>
    </DialogContext.Provider>
  );
}

export function useDialogContext() {
  return useContext(DialogContext);
}
