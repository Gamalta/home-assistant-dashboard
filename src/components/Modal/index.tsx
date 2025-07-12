import {IconButton, Stack, Typography} from '@mui/material';
import {AnimatePresence, motion, Variants} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import CloseIcon from '@mui/icons-material/CloseRounded';
import {Backdrop} from './Base/Backdrop';
import {Container} from './Base/Container';

export interface ModalProps {
  open: boolean;
  id?: string;
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  onClose: () => void;
}

const variants: Variants = {
  hidden: {
    scale: 0.9,
    y: '-10%',
    opacity: 0,
    transition: {
      duration: 1,
      ease: [0.42, 0, 0.58, 1],
    },
  },
  show: {
    scale: 1,
    y: 0,
    x: 0,
    opacity: 1,
    transition: {
      duration: 1,
      ease: [0.42, 0, 0.58, 1],
    },
  },
};

export function Modal(props: ModalProps) {
  const {open, id, title = '', children, action, onClose} = props;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [ready, setReady] = useState(false);

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
    <AnimatePresence mode="wait" initial={false}>
      {open && (
        <>
          <Backdrop />
          <Container id={id}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h5">{title}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {action}
                <IconButton onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Stack>
            <Stack
              component={motion.div}
              initial="hidden"
              animate={ready ? 'show' : 'hidden'}
              exit="hidden"
              variants={variants}
              p={2}
              maxHeight="100%"
            >
              <AnimatePresence initial={false} mode="wait">
                {ready && children}
              </AnimatePresence>
            </Stack>
          </Container>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
