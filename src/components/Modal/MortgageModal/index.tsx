import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import HouseIcon from '@mui/icons-material/HouseRounded';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {Modal, ModalProps} from '..';
import type {MortgageConfigType} from '../../../configs/sidebar';
import {mortgagesStatus} from '../../../utils/mortgage';
import {MortgageBalanceChart} from './MortgageBalanceChart';
import {MortgageCostChart} from './MortgageCostChart';
import {MortgageFigures} from './MortgageFigures';
import {MortgageHouse} from './MortgageHouse';

type MortgageModalProps = Omit<ModalProps, 'children'> & {
  mortgages: MortgageConfigType[];
};

export function MortgageModal(props: MortgageModalProps) {
  const {mortgages, ...modalProps} = props;
  const status = mortgagesStatus(mortgages, new Date());
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
          <MortgageFigures status={status} />
        </Stack>
      ) : (
        <Stack spacing={3}>
          <MortgageBalanceChart mortgages={mortgages} status={status} />
          <MortgageCostChart mortgages={mortgages} />
        </Stack>
      )}
    </Modal>
  );
}
