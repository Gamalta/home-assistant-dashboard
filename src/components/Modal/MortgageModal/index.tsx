import type {EntityName, FilterByDomain} from '@hakit/core';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import HouseIcon from '@mui/icons-material/HouseRounded';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import {useState} from 'react';
import {Modal, ModalProps} from '..';
import {useLoans} from '../../../hooks/useLoans';
import {loansStatus} from '../../../utils/mortgage';
import {MortgageBalanceChart} from './MortgageBalanceChart';
import {MortgageCostChart} from './MortgageCostChart';
import {MortgageFigures} from './MortgageFigures';
import {MortgageHouse} from './MortgageHouse';

type MortgageModalProps = Omit<ModalProps, 'children'> & {
  entityIds: FilterByDomain<EntityName, 'sensor'>[];
};

export function MortgageModal(props: MortgageModalProps) {
  const {entityIds, ...modalProps} = props;
  const loans = useLoans(entityIds);
  const status = loansStatus(loans, new Date());
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
          <MortgageBalanceChart loans={loans} status={status} />
          <MortgageCostChart loans={loans} />
        </Stack>
      )}
    </Modal>
  );
}
