import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import {ReactNode, createContext, useContext, useState} from 'react';
import CloseIcon from '@mui/icons-material/CloseRounded';

export type DialogContextType = {
  state: boolean;
  open: () => void;
  close: () => void;
  setContent: (newContent: ReactNode) => void;
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
  const [content, setContent] = useState<React.ReactNode>(null);

  const handleClose = () => {
    setOpen(false);
    setContent(null);
  };

  return (
    <DialogContext.Provider
      value={{
        state: open,
        open: () => {
          setOpen(true);
        },
        close: handleClose,
        setContent: newContent => {
          setContent(newContent);
        },
      }}
    >
      {children}
      <Dialog
        open={open}
        fullScreen
        sx={{
          m: 4,
          '& .MuiPaper-root': {
            borderRadius: 1,
          },
        }}
      >
        <Stack p={2} gap={2}>
          <Stack direction="row-reverse">
            <IconButton onClick={() => handleClose()}>
              <CloseIcon />
            </IconButton>
          </Stack>
          {content}
        </Stack>
      </Dialog>
    </DialogContext.Provider>
  );
}

export function useDialogContext() {
  return useContext(DialogContext);
}
