import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import HouseIcon from '@mui/icons-material/HouseRounded';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {Modal, ModalProps} from '..';
import type {Mortgage, MortgageStatus} from '../../../utils/mortgage';
import {MortgageChart} from './MortgageChart';
import {MortgageFigures} from './MortgageFigures';
import {MortgageHouse} from './MortgageHouse';

type MortgageModalProps = Omit<ModalProps, 'children'> & {
  mortgage: Mortgage;
  status: MortgageStatus;
};

export function MortgageModal(props: MortgageModalProps) {
  const {mortgage, status, ...modalProps} = props;
  const [tab, setTab] = useState<'progress' | 'history'>('progress');

  return (
    <Modal
      {...modalProps}
      action={
        tab === 'progress' ? (
          <IconButton aria-label="Historique" onClick={() => setTab('history')}>
            <AssessmentIcon />
          </IconButton>
        ) : (
          <IconButton
            aria-label="Avancement"
            onClick={() => setTab('progress')}
          >
            <HouseIcon />
          </IconButton>
        )
      }
    >
      {tab === 'progress' ? (
        <Stack direction="row" spacing={3}>
          <MortgageHouse ratio={status.repaidRatio} />
          <MortgageFigures mortgage={mortgage} status={status} />
        </Stack>
      ) : (
        <MortgageChart mortgage={mortgage} status={status} />
      )}
    </Modal>
  );
}
