import {describe, expect, it} from 'vitest';
import {
  formatEuros,
  type Loan,
  loanPayments,
  loansStatus,
  yearlyBalances,
  yearlyCosts,
} from './mortgage';

const payment = (
  month: string,
  principal: number,
  interest: number,
  insurance = 0,
) => ({month, principal, interest, insurance});

// Deux prêts qui se chevauchent : le premier avec assurance.
const first: Loan = {
  label: 'Premier',
  payments: [
    payment('2024-11', 100, 10, 2),
    payment('2024-12', 100, 8, 2),
    payment('2025-01', 100, 6, 2),
    payment('2025-02', 100, 4, 2),
  ],
};
const second: Loan = {
  label: 'Second',
  payments: [
    payment('2025-01', 50, 1),
    payment('2025-02', 50, 1),
    payment('2025-03', 50, 1),
    payment('2025-04', 50, 1),
  ],
};

describe('loanPayments', () => {
  it('lit l’échéancier dans les attributs, trié par mois', () => {
    expect(
      loanPayments({
        principal: {'2025-02': 120, '2025-01': 118},
        interest: {'2025-01': 25, '2025-02': 23},
        insurance: {'2025-01': 5},
      }),
    ).toEqual([payment('2025-01', 118, 25, 5), payment('2025-02', 120, 23, 0)]);
  });

  it('ne trouve aucune échéance sans attribut `principal`', () => {
    expect(loanPayments({friendly_name: 'Prêt', principal: 'inconnu'})).toEqual(
      [],
    );
  });
});

describe('loansStatus', () => {
  it('additionne les prêts à une date', () => {
    const status = loansStatus([first, second], new Date(2025, 1, 15));

    expect(status.principal).toBe(600);
    expect(status.remainingPrincipal).toBe(100);
    expect(status.repaidRatio).toBeCloseTo(5 / 6, 6);
    expect(status.monthlyPayment).toBe(104 + 51);
    expect(status.monthlyInsurance).toBe(2);
    expect(status.paidInterest).toBe(10 + 8 + 6 + 4 + 1 + 1);
    expect(status.remainingInterest).toBe(2);
    // Les mois de novembre 2024 à avril 2025, février compris.
    expect(status.paymentsMade).toBe(4);
    expect(status.paymentsTotal).toBe(6);
    expect(status.endDate).toEqual(new Date(2025, 3, 1));
  });

  it('compte l’échéance d’un mois dès son premier jour', () => {
    expect(loansStatus([first], new Date(2024, 11, 1)).paymentsMade).toBe(2);
    expect(loansStatus([first], new Date(2024, 10, 30)).paymentsMade).toBe(1);
  });

  it('arrive à zéro, sans mensualité, après la dernière échéance', () => {
    const status = loansStatus([first, second], new Date(2026, 0, 1));

    expect(status.remainingPrincipal).toBe(0);
    expect(status.repaidRatio).toBe(1);
    expect(status.monthlyPayment).toBe(0);
    expect(status.remainingInterest).toBe(0);
  });
});

describe('yearlyBalances', () => {
  it('va de la première échéance au 1er janvier qui suit la dernière', () => {
    const {x, balances} = yearlyBalances([first, second]);

    expect(x).toEqual([
      new Date(2024, 10, 1).getTime(),
      new Date(2025, 0, 1).getTime(),
      new Date(2026, 0, 1).getTime(),
    ]);
    expect(balances[0]).toEqual([300, 100, 0]);
  });

  it('ne compte un prêt qu’à partir de sa première échéance', () => {
    const {balances} = yearlyBalances([first, second]);

    expect(balances[1]).toEqual([0, 150, 0]);
  });
});

describe('yearlyCosts', () => {
  it('répartit les échéances de chaque année entre capital, intérêts et assurance', () => {
    expect(yearlyCosts([first, second])).toEqual([
      {year: 2024, principal: 200, interest: 18, insurance: 4},
      {year: 2025, principal: 400, interest: 14, insurance: 4},
    ]);
  });
});

describe('formatEuros', () => {
  it('arrondit à l’euro, au format français', () => {
    // Intl sépare par des espaces insécables.
    expect(formatEuros(154320.4).replace(/\s/g, ' ')).toBe('154 320 €');
  });
});
