import styled from '@emotion/styled';
import {IconButton, Stack} from '@mui/material';
import {AnimatePresence, motion} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import CloseIcon from '@mui/icons-material/CloseRounded';
import {Backdrop} from './Backdrop';

export interface ModalProps {
  open: boolean;
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}
export function Modal({open, id, children, onClose}: ModalProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [ready, setReady] = useState(false);

  const transition = {
    duration: 1,
    ease: [0.42, 0, 0.58, 1],
  };

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setReady(true);
      timerRef.current = null;
    }, 1000 / 1.8);

    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, [open]);

  return createPortal(
    <AnimatePresence
      initial={false}
      mode="wait"
      onExitComplete={() => {
        setReady(false);
      }}
    >
      {open && (
        <>
          <Backdrop />
          <Stack
            component={motion.div}
            transition={{
              duration: 1,
              type: 'spring',
              damping: 7.5,
              mass: 0.55,
              stiffness: 100,
            }}
            layoutId={id}
            direction="column"
            position="absolute"
            top="5rem"
            left="50%"
            zIndex={2}
            boxShadow="0px 0px 10px hsla(200, calc(50% * 0.8), 3%, 0.6)"
          >
            <Stack direction="row" justifyContent="flex-end">
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
            <Stack
              component={motion.div}
              initial="hidden"
              animate={ready ? 'show' : 'hidden'}
              exit="hidden"
              variants={{
                hidden: {y: '-10%', opacity: 0, transition, scale: 0.9},
                show: {
                  scale: 1,
                  y: 0,
                  x: 0,
                  opacity: 1,
                  transition,
                },
              }}
            >
              <AnimatePresence initial={false} mode="wait">
                {ready && children}
              </AnimatePresence>
            </Stack>
          </Stack>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
