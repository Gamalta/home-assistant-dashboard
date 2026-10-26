import {describe, expect, it} from 'vitest';
import {
  formatEuros,
  monthlyPayment,
  mortgageStatus,
  mortgagesStatus,
  paymentsMade,
  remainingPrincipal,
  yearlyBalances,
  yearlyCosts,
  type Mortgage,
} from './mortgage';

const mortgage: Mortgage = {
  principal: 200_000,
  annualRate: 3.5,
  durationMonths: 300,
  firstPaymentDate: '2020-01-05',
};

describe('monthlyPayment', () => {
  it('calcule la mensualité d’un prêt à échéances constantes', () => {
    expect(monthlyPayment(mortgage)).toBeCloseTo(1001.25, 2);
  });

  it('divise le capital sans intérêts quand le taux est nul', () => {
    expect(monthlyPayment({...mortgage, annualRate: 0})).toBeCloseTo(666.67, 2);
  });
});

describe('remainingPrincipal', () => {
  it('vaut le capital emprunté avant la première échéance', () => {
    expect(remainingPrincipal(mortgage, 0)).toBeCloseTo(200_000, 6);
  });

  it('retire la part de capital de la première échéance', () => {
    const interest = 200_000 * (0.035 / 12);
    expect(remainingPrincipal(mortgage, 1)).toBeCloseTo(
      200_000 - (monthlyPayment(mortgage) - interest),
      6,
    );
  });

  it('vaut zéro une fois la dernière échéance payée, et au-delà', () => {
    expect(remainingPrincipal(mortgage, 300)).toBe(0);
    expect(remainingPrincipal(mortgage, 400)).toBe(0);
  });
});

describe('paymentsMade', () => {
  it('ne compte rien avant la première échéance', () => {
    expect(paymentsMade(mortgage, new Date(2020, 0, 4))).toBe(0);
  });

  it('compte l’échéance le jour même du prélèvement', () => {
    expect(paymentsMade(mortgage, new Date(2020, 0, 5))).toBe(1);
    expect(paymentsMade(mortgage, new Date(2020, 1, 4))).toBe(1);
    expect(paymentsMade(mortgage, new Date(2020, 1, 5))).toBe(2);
  });

  it('s’arrête au nombre total d’échéances', () => {
    expect(paymentsMade(mortgage, new Date(2060, 0, 1))).toBe(300);
  });
});

describe('mortgageStatus', () => {
  it('donne l’avancement du prêt à une date', () => {
    const status = mortgageStatus(mortgage, new Date(2025, 0, 5));

    expect(status.paymentsMade).toBe(61);
    expect(status.remainingPrincipal).toBeCloseTo(
      remainingPrincipal(mortgage, 61),
      6,
    );
    // En début de prêt, les échéances remboursent surtout des intérêts.
    expect(status.repaidRatio).toBeCloseTo(0.139, 3);
    expect(status.paidInterest + status.remainingInterest).toBeCloseTo(
      1001.25 * 300 - 200_000,
      -1,
    );
    expect(status.endDate).toEqual(new Date(2044, 11, 5));
  });

  it('compte les intérêts payés comme un tableau d’amortissement mois par mois', () => {
    let remaining = mortgage.principal;
    let interest = 0;
    for (let month = 0; month < 61; month++) {
      const monthInterest = remaining * (0.035 / 12);
      interest += monthInterest;
      remaining -= monthlyPayment(mortgage) - monthInterest;
    }

    const status = mortgageStatus(mortgage, new Date(2025, 0, 5));
    expect(status.paidInterest).toBeCloseTo(interest, 6);
    expect(status.remainingPrincipal).toBeCloseTo(remaining, 6);
  });
});

// Un prêt à taux zéro, plus court et plus tardif, avec assurance.
const zeroRate: Mortgage = {
  principal: 40_000,
  annualRate: 0,
  durationMonths: 120,
  firstPaymentDate: '2022-07-10',
  monthlyInsurance: 5,
};

describe('mortgagesStatus', () => {
  it('additionne les prêts et pondère l’avancement par le capital emprunté', () => {
    const date = new Date(2025, 0, 5);
    const first = mortgageStatus(mortgage, date);
    const second = mortgageStatus(zeroRate, date);
    const status = mortgagesStatus([mortgage, zeroRate], date);

    expect(status.principal).toBe(240_000);
    expect(status.remainingPrincipal).toBeCloseTo(
      first.remainingPrincipal + second.remainingPrincipal,
      6,
    );
    expect(status.repaidRatio).toBeCloseTo(
      1 - status.remainingPrincipal / 240_000,
      6,
    );
    expect(status.monthlyPayment).toBeCloseTo(1001.25 + 333.33, 1);
    expect(status.monthlyInsurance).toBe(5);
    expect(status.paidInterest).toBeCloseTo(first.paidInterest, 6);
    expect(status.endDate).toEqual(new Date(2044, 11, 5));
    expect(status.remainingYears).toBe(20);
  });

  it('ne compte plus la mensualité ni l’assurance d’un prêt terminé', () => {
    const status = mortgagesStatus([mortgage, zeroRate], new Date(2033, 0, 1));

    expect(status.monthlyPayment).toBeCloseTo(1001.25, 2);
    expect(status.monthlyInsurance).toBe(0);
  });
});

describe('yearlyBalances', () => {
  it('va de la première échéance au 1er janvier qui suit la dernière', () => {
    const {x, balances} = yearlyBalances([mortgage, zeroRate]);

    expect(x).toHaveLength(26);
    expect(x[0]).toBe(new Date(2020, 0, 5).getTime());
    expect(x[x.length - 1]).toBe(new Date(2045, 0, 1).getTime());
    expect(balances[0][0]).toBeCloseTo(remainingPrincipal(mortgage, 1), 6);
    expect(balances[0][x.length - 1]).toBe(0);
    expect(balances[1][x.length - 1]).toBe(0);
  });

  it('ne compte un prêt qu’à partir de sa première échéance', () => {
    const {x, balances} = yearlyBalances([mortgage, zeroRate]);
    const year = (y: number) => x.indexOf(new Date(y, 0, 1).getTime());

    expect(balances[1][year(2022)]).toBe(0);
    // Six échéances de juillet à décembre 2022.
    expect(balances[1][year(2023)]).toBeCloseTo(40_000 - 6 * (40_000 / 120), 6);
  });
});

describe('yearlyCosts', () => {
  it('répartit les échéances entre capital, intérêts et assurance', () => {
    const years = yearlyCosts([mortgage, zeroRate]);
    const total = (key: 'principal' | 'interest' | 'insurance') =>
      years.reduce((sum, year) => sum + year[key], 0);

    expect(years[0].year).toBe(2020);
    expect(years[years.length - 1].year).toBe(2044);
    expect(total('principal')).toBeCloseTo(240_000, 6);
    expect(total('interest')).toBeCloseTo(
      monthlyPayment(mortgage) * 300 - 200_000,
      6,
    );
    expect(total('insurance')).toBe(5 * 120);
  });

  it('montre que les premières années remboursent surtout des intérêts', () => {
    const [first] = yearlyCosts([mortgage]);

    expect(first.interest).toBeGreaterThan(first.principal);
    expect(first.insurance).toBe(0);
  });
});

describe('formatEuros', () => {
  it('arrondit à l’euro, au format français', () => {
    // Intl sépare par des espaces insécables.
    expect(formatEuros(154320.4).replace(/\s/g, ' ')).toBe('154 320 €');
  });
});
